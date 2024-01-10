const get = require('lodash.get')
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')
const { prompt, Select } = require('enquirer')

const getAccessToken = () => {
  if (process.env.DIGITALOCEAN_ACCESS_TOKEN) {
    return process.env.DIGITALOCEAN_ACCESS_TOKEN
  }
  throw new Error('DIGITALOCEAN_ACCESS_TOKEN is not set')
}

const callApi = async (urlPath, options) => {
  const { got } = await import('got')

  return got(`https://api.digitalocean.com/v2/${urlPath}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    ...options,
  })
}

/// -------------------------------------------------------------------------------- ///
/// Docker
/// -------------------------------------------------------------------------------- ///

const doesRegistryExist = async id => {
  try {
    console.log(`Checking if registry ${id} exists...`)

    const { body } = await callApi('registry/validate-name', {
      method: 'POST',
      json: {
        name: id,
      },
    })

    console.log(body)
  } catch (err) {
    if (get(err, 'response.statusCode') === 409) {
      return true
    } else {
      throw err
    }
  }

  return false
}

const createContainerRegistry = async containerRegistryId => {
  console.log('Creating new container registry...')

  const { id } = await prompt({
    type: 'input',
    name: 'id',
    message: 'Name of new registry',
    required: true,
    initial: containerRegistryId,
  })

  if (await doesRegistryExist(id)) {
    console.log('Registry already exists, proceeding...')
    return id
  }

  const tier = 'starter'

  const region = await new Select({
    name: 'region',
    message: 'Region to create the registry in',
    required: true,
    choices: [
      { message: 'New York', name: 'nyc3' },
      { message: 'San Francisco', name: 'sfo3' },
      { message: 'Amsterdam', name: 'ams3' },
      { message: 'Singapore', name: 'sgp1' },
      { message: 'Frankfurt', name: 'fra1' },
    ],
  }).run()

  await callApi('registry', {
    method: 'POST',
    json: {
      name: id,
      subscription_tier_slug: tier,
      region,
    },
  })

  console.log(`Created registry ${id}`)

  return id
}

const updateDockerCredentials = async ($$, containerRegistryId) => {
  console.log(`Setting docker credentials for registry ${containerRegistryId}...`)

  const token = getAccessToken()

  await $$`docker login registry.digitalocean.com --username ${token} --password ${token}`
}

exports.pushDockerImageToContainerRegistry = async ($$, containerRegistryId, dockerImageName) => {
  if (!containerRegistryId || !(await doesRegistryExist(containerRegistryId))) {
    containerRegistryId = await createContainerRegistry(containerRegistryId)
  }

  await updateDockerCredentials($$, containerRegistryId)

  const tag = `registry.digitalocean.com/${containerRegistryId}/${dockerImageName}`

  console.log(`Tagging image ${dockerImageName} with name ${tag} ...`)
  await $$`docker tag ${dockerImageName} ${tag}`

  console.log(`Pushing ${tag} to DigitalOcean...`)
  await $$`docker push ${tag}`
}


/// -------------------------------------------------------------------------------- ///
/// Databases
/// -------------------------------------------------------------------------------- ///

const getPostgresClusters = async () => {
  const { body } = await callApi('databases')
  return JSON.parse(body).databases.filter(a => a.connection.protocol === 'postgresql')
}



const doesDatabaseExist = async (clusterId, dbName) => {
  try {
    console.log(`Checking if cluster ${clusterId} contains db named ${dbName}...`)

    const { body } =await callApi(`databases/${clusterId}/dbs/${dbName}`)
    return JSON.parse(body)
  } catch (err) {
    if (err.response.statusCode === 404) {
      return false
    } else {
      throw err
    }
  }
}

const doesDatabaseUserExist = async (clusterId, userName) => {
  try {
    console.log(`Checking if cluster ${clusterId} contains db user named ${userName}...`)

    const { body } = await callApi(`databases/${clusterId}/users/${userName}`)
    return JSON.parse(body)
  } catch (err) {
    if (err.response.statusCode === 404) {
      return false
    } else {
      throw err
    }
  }
}

const grantUserFullAccessToDb = async(clusterId, userName, dbName) => {
  console.log(`Granting user ${userName} full access to database ${dbName}...`)

  const pgClusters = await getPostgresClusters()
  const cluster = pgClusters.find(c => c.id === clusterId)
  if (!cluster) {
    throw new Error(`Cluster ${clusterId} not found`)
  }

  const adminUser = await doesDatabaseUserExist(clusterId, 'doadmin')

  if (!adminUser) {
    throw new Error(`User dodmin does not exist in cluster ${clusterId}`)
  }

  const dbret = await doesDatabaseExist(clusterId, dbName)
  if (!dbret) {
    throw new Error(`Database ${dbName} does not exist in cluster ${clusterId}`)
  }

  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
  const client = new Client({
    ...cluster.connection,
    // database: dbName,
  })
  await client.connect()
  await client.query(`ALTER DATABASE ${dbName} OWNER TO ${userName}`)
  await client.end()
}


exports.createDatabase = async (dbName, username) => {
  console.log(`Creating database ${dbName}...`)

  try {
    const pgClusters = await getPostgresClusters()

    if (!pgClusters.length) {
      console.error('No postgres clusters found, please create one first via your DigitalOcean control panel.')
      return
    } else {
      const selectedCluster = await new Select({
        name: 'cluster',
        message: 'Select which postgres cluster to create the db in',
        required: true,
        choices: pgClusters.map(c => {
          let tagStr = ''
          if (c.tags && c.tags.length) {
            tagStr = ` (tags: ${c.tags.join(', ')})`
          }
          return { message: `${c.name}${tagStr}`, name: c }
        }),
      }).run()

      if (await doesDatabaseExist(selectedCluster.id, dbName)) {
        console.log(`Database ${dbName} already exists, skipping create...`)
      } else {
        console.log(`Creating database ${dbName} in cluster ${selectedCluster.id}...`)

        await callApi(`databases/${selectedCluster.id}/dbs`, {
          method: 'POST',
          json: {
            name: dbName,
          },
        })
      }

      let password = ''

      const existingUser = await doesDatabaseUserExist(selectedCluster.id, username)
      if (existingUser) {
        console.log(`Database user ${username} already exists, skipping create...`)
        password = existingUser.user.password
      } else {
        console.log(`Creating database user ${username} in cluster ${selectedCluster.id}...`)

        const { body } = await callApi(`databases/${selectedCluster.id}/users`, {
          method: 'POST',
          json: {
            name: username,
          },
        })

        password = JSON.parse(body).user.password
      }

      // grant user privileges on database
      await grantUserFullAccessToDb(selectedCluster.id, username, dbName)

      const hostport = `${selectedCluster.connection.host}:${selectedCluster.connection.port}`
      console.log(`\nConnection string:\n\npostgres://${username}:${password}@${hostport}/${dbName}?schema=public`)
    }
  } catch (err) {
    console.error(err)
    throw new Error(`Failed to create database: ${err}`)
  }
}
