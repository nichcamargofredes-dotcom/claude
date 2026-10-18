// Downloads the generated photos listed in images.json and writes optimised
// WebP versions to public/images. Existing files are kept unless --force.
// Usage: npm run images [-- --force]
import { access, mkdir, readFile } from 'node:fs/promises'
import sharp from 'sharp'

const manifest = JSON.parse(await readFile(new URL('./images.json', import.meta.url), 'utf8'))
const outDir = new URL('../public/images/', import.meta.url)
const force = process.argv.includes('--force')
await mkdir(outDir, { recursive: true })

const exists = (url) => access(url).then(() => true, () => false)

for (const { name, url, widths } of manifest.images) {
  const targets = widths.map((w) => ({ w, file: new URL(`${name}-${w}.webp`, outDir) }))
  const missing = force ? targets : (await Promise.all(targets.map(async (t) => ((await exists(t.file)) ? null : t)))).filter(Boolean)
  if (missing.length === 0) continue

  const res = await fetch(url)
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`)
  const source = Buffer.from(await res.arrayBuffer())

  for (const { w, file } of missing) {
    const info = await sharp(source).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74, effort: 5 }).toFile(file.pathname)
    console.log(`${name}-${w}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`)
  }
}
