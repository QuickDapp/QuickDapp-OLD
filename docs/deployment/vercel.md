---
order: 85
---

# Deploying to Vercel

You can deploy the QuickDapp Next.js app to Vercel by simply deploying from your Github repo within the Vercel dashboard. 

Note that since the `.env.production` file does not get checked into version control - this is intentional. Instead, the production environment variables will need to be set [in Vercel's dashboard](https://vercel.com/docs/projects/environment-variables), which is their recommended method.

Vercel will only build the Next.js web app (thus excluding the background worker). This behaviour can be changed by editing the [vercel.json](https://github.com/QuickDapp/QuickDapp/blob/master/vercel.json) config file.

