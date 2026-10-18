// Hero assets are served from the original Figma site (external on purpose).
const FIGMA = 'https://polo-pecan-73837341.figma.site/_assets/v11'

export const heroAssets = {
  logo: `${FIGMA}/0ae29d6d9628bede667f90d57bebe81b8f1ec2bf.svg`,
  avatar: `${FIGMA}/e62173d41f91350a59628e8a9a55ae078a886fb9.png?w=128`,
  catHouse: `${FIGMA}/3e5158dad63d392ade022e81890edc9f54d750bc.png`,
  videoCard: `${FIGMA}/76be6ec3a93a703b15e9cc01e764a4e3f9d7d2c0.png`,
  bottomLeft: `${FIGMA}/8d44b25186ef45a5789c74668fb781cea4e1ff49.png`,
  bottomCenter: `${FIGMA}/96745c4e72ad5c5208e53a885df797fd82cd854a.png?h=1024`,
  bottomRight: `${FIGMA}/81bd2e7a66b58f3d8f3ad78fd1ebf01af8dfdee1.png`,
} as const

// Natural sizes, used to reserve space before the images load.
export const heroSizes = {
  catHouse: { width: 1024, height: 1024 },
  videoCard: { width: 354, height: 574 },
  bottomLeft: { width: 870, height: 762 },
  bottomCenter: { width: 1100, height: 1152 },
  bottomRight: { width: 870, height: 816 },
} as const

// figma.site resizes images on the fly with ?w=
export function figmaSrcSet(url: string, widths: number[]) {
  const base = url.split('?')[0]
  return widths.map((w) => `${base}?w=${w} ${w}w`).join(', ')
}

// Generated photos live in public/images as <name>-<width>.webp (see scripts/images.json).
export type Photo = { src: string; srcSet: string; width: number; height: number }

export function photo(name: string, ratio: [number, number] = [3, 4], widths: number[] = [640, 1280]): Photo {
  const base = `${import.meta.env.BASE_URL}images/${name}`
  const width = widths[0]
  return {
    src: `${base}-${width}.webp`,
    srcSet: widths.map((w) => `${base}-${w}.webp ${w}w`).join(', '),
    width,
    height: Math.round((width * ratio[1]) / ratio[0]),
  }
}

export const photos = {
  dog: photo('pet-dog'),
  cat: photo('pet-cat'),
  bird: photo('pet-bird'),
  fish: photo('pet-fish'),
  rabbit: photo('pet-rabbit'),
  donutBed: photo('product-donut-bed', [1, 1], [800]),
  kibble: photo('product-kibble', [1, 1], [800]),
  toys: photo('product-toys', [1, 1], [800]),
  collar: photo('product-collar', [1, 1], [800]),
  grooming: photo('service-grooming'),
  vet: photo('service-vet'),
  delivery: photo('service-delivery'),
  daycare: photo('service-daycare'),
  hug: photo('life-hug'),
  catNap: photo('life-cat-nap'),
  puppyToy: photo('life-puppy-toy'),
  walk: photo('life-walk'),
} as const
