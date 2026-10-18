# @banzhe/electron-builder-gzip-chromium-licenses

[English](./README.md) | 简体中文

[electron-builder](https://www.electron.build) `afterPack` 钩子: 将 Electron 自带的 `LICENSES.chromium.html` (约 20 MB) 压缩为 `LICENSES.chromium.html.gz` (约 2 MB) 并删除原文件, 安装后只保留压缩文件。

## 安装

```sh
pnpm add -D @banzhe/electron-builder-gzip-chromium-licenses
```

## 使用

推荐使用 TS / JS 配置导入 (electron-builder 会自动识别项目目录下的 `electron-builder.ts`):

```ts
// electron-builder.ts
import { gzipChromiumLicenses } from '@banzhe/electron-builder-gzip-chromium-licenses'
import type { Configuration } from 'electron-builder'

export default {
  afterPack: gzipChromiumLicenses(),
} satisfies Configuration
```

包的默认导出是使用默认参数的钩子, 也可以在 YAML / JSON 配置中直接写包名:

```yaml
# electron-builder.yml
afterPack: '@banzhe/electron-builder-gzip-chromium-licenses'
```

> electron-builder 从自身所在位置解析钩子模块名。pnpm 的隔离 `node_modules` 下可能找不到该包, 此时请改用上面的 TS / JS 配置。

## API

- `gzipChromiumLicenses(options?)` — 创建 `afterPack` 钩子; macOS 上 electron-builder 已删除该文件, 钩子不做任何事
  - `level` — gzip 压缩级别 (0–9), 默认 9
- `gzipChromiumLicensesIn(dir, options?)` — 直接处理指定目录, 返回压缩前后的大小, 文件不存在时返回 `null`
- `CHROMIUM_LICENSES_FILE` — `'LICENSES.chromium.html'`

## 体积说明

NSIS 等安装包本身用 LZMA 压缩, 原 HTML 在安装包内的压缩率比 gzip 更高, 因此安装包会略微变大 (约 +1.2 MB); 减小的是安装后的磁盘占用 (约 -17.5 MB)。

## License

MIT
