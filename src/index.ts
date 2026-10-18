import { gzipChromiumLicenses } from './gzip-chromium-licenses.ts'

export {
  CHROMIUM_LICENSES_FILE,
  gzipChromiumLicenses,
  gzipChromiumLicensesIn,
  type GzipChromiumLicensesOptions,
  type GzipResult,
  type PackContext,
} from './gzip-chromium-licenses.ts'

/**
 * `afterPack` hook with default options, so the package name can be referenced
 * directly from a YAML / JSON config.
 *
 * @example
 * ```yaml
 * # electron-builder.yml
 * afterPack: '@banzhe/electron-builder-gzip-chromium-licenses'
 * ```
 */
export default gzipChromiumLicenses()
