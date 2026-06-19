# agentinbox

Local-first task inbox and brief generator for coding agents.

## Status

This is an early implementation with parser and filesystem modules for task inbox data. The package metadata advertises a CLI, but the current source tree does not yet include a complete CLI entry point. Treat the package as pre-release until that surface lands.

## Install

```sh
npm install
npm run build
```

## Use

Use the parser modules under `src/parse/` as the current implementation reference for Markdown inbox data. Add CLI-backed examples once `dist/cli.js` is produced by the build.

## Verify

```sh
npm run release:check
```

## Limitations

- The CLI entry point is not complete yet.
- Generated briefs should be reviewed before handing them to an agent.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

MIT
