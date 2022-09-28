# Contributing

## Local tooling

This repo uses [`commitlint`](https://github.com/conventionalcommit/commitlint) to ensure consistent commit messages, and to trigger version upgrades in CI.

```bash
go install github.com/conventionalcommit/commitlint@latest
commitlint init
```

## Builds & release

The [`commitizen` Github action](https://github.com/marketplace/actions/bump-and-changelog-using-commitizen) is used remotely to apply version bumps, tag & release based on these conventional commits.
