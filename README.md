# @banzhe/electron-builder-gzip-chromium-licenses

English | [简体中文](./README.zh-CN.md)

An [electron-builder](https://www.electron.build) `afterPack` hook that compresses Electron's bundled `LICENSES.chromium.html` (~20 MB) into `LICENSES.chromium.html.gz` (~2 MB) and removes the original, so only the compressed file is installed.

## Installation

```sh
pnpm add -D @banzhe/electron-builder-gzip-chromium-licenses
```

## Usage

Importing it from a TS / JS config is recommended (electron-builder automatically picks up `electron-builder.ts` in the project directory):

```ts
// electron-builder.ts
import { gzipChromiumLicenses } from '@banzhe/electron-builder-gzip-chromium-licenses'
import type { Configuration } from 'electron-builder'

export default {
  afterPack: gzipChromiumLicenses(),
} satisfies Configuration
```

The package's default export is the hook with default options, so you can also reference the package name directly in a YAML / JSON config:

```yaml
# electron-builder.yml
afterPack: '@banzhe/electron-builder-gzip-chromium-licenses'
```

> electron-builder resolves hook module names from its own location. With pnpm's isolated `node_modules` the package may not be found; in that case, use the TS / JS config above instead.

## API

- `gzipChromiumLicenses(options?)` — creates the `afterPack` hook; on macOS electron-builder already removes the file, so the hook does nothing
  - `level` — gzip compression level (0–9), defaults to 9
- `gzipChromiumLicensesIn(dir, options?)` — processes the given directory directly and returns the sizes before and after compression, or `null` if the file does not exist
- `CHROMIUM_LICENSES_FILE` — `'LICENSES.chromium.html'`

## Size impact

Installers such as NSIS are themselves LZMA-compressed, and LZMA compresses the original HTML better than gzip does, so the installer gets slightly larger (about +1.2 MB); what shrinks is the disk usage after installation (about -17.5 MB).

## License

MIT
