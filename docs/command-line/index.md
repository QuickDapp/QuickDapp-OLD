---
icon: command-palette
order: 96
label: Command-line
expanded: true
---

# Command-line (CLI)

The QuickDapp CLI is a collection of Node.js scripts which live within the `./scripts` folder. 

The available commands are:

* `dev` - run development code, interact with development database.
* `contracts` - interact with `./contracts` folder, build and deploy contracts to a local node.
* `build` - build production code.
* `prod` - run production code, interact with production database.
* `docker` - build and run Docker images.
* `do-cloud` - interact with [DigitalOcean](https://www.digitalocean.com/) cloud hosting.

To get help on any command simply affix `--help`. However, note that some commands have sub-commands, e.g:

* `build` - _build both web + worker production servers_
  * To get usage help: `build "(default)" --help`
* `build web` - _build web production server only_
  * To get usage help: `build web --help`

