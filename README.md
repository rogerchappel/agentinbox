# agentinbox

Local-first task inbox and brief generator for coding agents.

## Status

This repository is early-stage. Use it for local developer automation and review workflows, and verify results before relying on them in production.

## Install

```sh
npm ci
npm run build
```

## Use

Inspect the CLI surface first:

```sh
npx agentinbox --help
```

Run the project verification command before making changes:

```sh
npm test
```

## Verify

```sh
npm test
npm run package:smoke
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Keep changes small, reviewable, and backed by the verification commands above.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance. Do not include secrets, private logs, or customer data in issues or fixtures.

## License

MIT
