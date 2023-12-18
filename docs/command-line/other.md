---
order: 1
---

# Other commands

## bootstrap

The `bootstrap` command initializes QuickDapp, and only needs to be run **once**, after NPM dependencies have been installed.

It installs a `git` hook which ensures your future commit messages adhere to the [conventional commits](https://github.com/conventional-changelog/commitlint).

Example usage:

```shell
pnpm bootstrap
```

## showdocs

The `showdocs` command is responsible for building and rendering this documentation in the browser using [Retype](https://retype.com).

Example usage:

```shell
pnpm showdocs
```

The documentation will now be accessible at [http://localhost:5000](http://localhost:500).
