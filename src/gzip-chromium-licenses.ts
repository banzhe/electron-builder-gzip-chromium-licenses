import { createReadStream, createWriteStream } from 'node:fs'
import { rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { constants, createGzip } from 'node:zlib'

export interface PackContext {
  readonly appOutDir: string
  readonly electronPlatformName: string
}

export interface GzipChromiumLicensesOptions {
  /** gzip compression level (0–9), defaults to 9 */
  level?: number
}

export interface GzipResult {
  originalSize: number
  compressedSize: number
}

export const CHROMIUM_LICENSES_FILE = 'LICENSES.chromium.html'

/**
 * Compresses `LICENSES.chromium.html` in `dir` into `LICENSES.chromium.html.gz`
 * and removes the original file.
 *
 * @param dir - Directory containing `LICENSES.chromium.html`, e.g. `release/win-unpacked`
 * @param options - Compression options
 * @returns The file sizes in bytes before and after compression, or `null` if the file does not exist
 */
export async function gzipChromiumLicensesIn(
  dir: string,
  options: GzipChromiumLicensesOptions = {},
): Promise<GzipResult | null> {
  const source = path.join(dir, CHROMIUM_LICENSES_FILE)
  const original = await stat(source).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return null
    throw error
  })
  if (!original?.isFile()) return null
  const target = `${source}.gz`
  const level = options.level ?? constants.Z_BEST_COMPRESSION
  await pipeline(createReadStream(source), createGzip({ level }), createWriteStream(target))
  await rm(source)
  return { originalSize: original.size, compressedSize: (await stat(target)).size }
}

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

/**
 * Creates an electron-builder `afterPack` hook that replaces `LICENSES.chromium.html`
 * in the packed app with `LICENSES.chromium.html.gz`. Does nothing when the file is
 * absent, e.g. on macOS where electron-builder already removes it.
 *
 * @param options - Compression options
 * @returns An `afterPack` hook
 *
 * @example
 * ```ts
 * // electron-builder.ts
 * import { gzipChromiumLicenses } from '@banzhe/electron-builder-gzip-chromium-licenses'
 * import type { Configuration } from 'electron-builder'
 *
 * export default {
 *   afterPack: gzipChromiumLicenses({ level: 9 }),
 * } satisfies Configuration
 * ```
 */
export function gzipChromiumLicenses(options: GzipChromiumLicensesOptions = {}) {
  return async (context: PackContext): Promise<void> => {
    const result = await gzipChromiumLicensesIn(context.appOutDir, options)
    if (result == null) return
    console.log(
      `  • gzip ${CHROMIUM_LICENSES_FILE} (${context.electronPlatformName}): ${formatSize(result.originalSize)} → ${formatSize(result.compressedSize)}`,
    )
  }
}
