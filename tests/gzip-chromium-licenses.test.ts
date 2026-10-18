import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import afterPack, { gzipChromiumLicenses, gzipChromiumLicensesIn } from '../src/index.ts'

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'gzip-chromium-licenses-'))
})

afterEach(async () => {
  vi.restoreAllMocks()
  await rm(dir, { recursive: true, force: true })
})

const license = '<html><body>' + 'Chromium license text. '.repeat(10_000) + '</body></html>'

describe('gzipChromiumLicensesIn', () => {
  test('replaces LICENSES.chromium.html with a gzip file', async () => {
    await writeFile(path.join(dir, 'LICENSES.chromium.html'), license)
    await writeFile(path.join(dir, 'LICENSE.electron.txt'), 'MIT')

    const result = await gzipChromiumLicensesIn(dir)

    expect((await readdir(dir)).toSorted()).toEqual([
      'LICENSE.electron.txt',
      'LICENSES.chromium.html.gz',
    ])
    const gz = await readFile(path.join(dir, 'LICENSES.chromium.html.gz'))
    expect(gunzipSync(gz).toString()).toBe(license)
    expect(result).toEqual({ originalSize: Buffer.byteLength(license), compressedSize: gz.length })
    expect(gz.length).toBeLessThan(Buffer.byteLength(license))
  })

  test('accepts a custom compression level', async () => {
    await writeFile(path.join(dir, 'LICENSES.chromium.html'), license)

    await gzipChromiumLicensesIn(dir, { level: 1 })

    const gz = await readFile(path.join(dir, 'LICENSES.chromium.html.gz'))
    expect(gunzipSync(gz).toString()).toBe(license)
  })

  test('returns null when the file is missing', async () => {
    await expect(gzipChromiumLicensesIn(dir)).resolves.toBeNull()
    expect(await readdir(dir)).toEqual([])
  })

  test('ignores a directory with the same name', async () => {
    await mkdir(path.join(dir, 'LICENSES.chromium.html'))

    await expect(gzipChromiumLicensesIn(dir)).resolves.toBeNull()
    expect(await readdir(dir)).toEqual(['LICENSES.chromium.html'])
  })
})

describe('gzipChromiumLicenses', () => {
  test('gzips the file in appOutDir and logs the size change', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    await writeFile(path.join(dir, 'LICENSES.chromium.html'), license)

    await gzipChromiumLicenses()({ appOutDir: dir, electronPlatformName: 'win32' })

    expect(await readdir(dir)).toEqual(['LICENSES.chromium.html.gz'])
    expect(log).toHaveBeenCalledOnce()
    expect(log.mock.calls[0]?.[0]).toContain('gzip LICENSES.chromium.html (win32)')
  })

  test('default export is a hook with default options', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    await writeFile(path.join(dir, 'LICENSES.chromium.html'), license)

    await afterPack({ appOutDir: dir, electronPlatformName: 'linux' })

    expect(await readdir(dir)).toEqual(['LICENSES.chromium.html.gz'])
  })

  test('does nothing when the file was already removed (macOS)', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await gzipChromiumLicenses()({ appOutDir: dir, electronPlatformName: 'darwin' })

    expect(log).not.toHaveBeenCalled()
  })
})
