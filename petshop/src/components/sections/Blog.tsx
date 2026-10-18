import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { photos, type Photo } from '../../lib/assets'
import { Container, Eyebrow, Reveal, SectionTitle } from '../ui'

const POSTS: { title: string; excerpt: string; tag: string; time: string; date: string; image: Photo; alt: string }[] = [
  {
    title: 'Choosing food for a senior dog',
    excerpt: 'Joints, teeth and appetite all change after seven. Our partner vet explains what to look for on the label.',
    tag: 'Nutrition',
    time: '6 min read',
    date: 'Oct 12, 2026',
    image: photos.vet,
    alt: 'Golden retriever puppy at a vet check-up',
  },
  {
    title: 'Seven ways to keep an indoor cat happy',
    excerpt: 'Window perches, puzzle feeders and a little daily hunting game go a long way for cats who stay inside.',
    tag: 'Cats',
    time: '4 min read',
    date: 'Oct 5, 2026',
    image: photos.catNap,
    alt: 'Cat sleeping in a sunny orange bed',
  },
  {
    title: 'Your first week with a rabbit',
    excerpt: 'A gentle checklist for the hutch, the hay and the first handling sessions, so your bunny settles in calmly.',
    tag: 'Small pets',
    time: '5 min read',
    date: 'Sep 28, 2026',
    image: photos.rabbit,
    alt: 'White and brown rabbit sitting on a mint background',
  },
]

export function Blog() {
  return (
    <section id="blog" aria-labelledby="blog-title" className="scroll-mt-20 py-24 md:py-32">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <Eyebrow>From the blog</Eyebrow>
            <SectionTitle className="mt-4 text-forest">
              <span id="blog-title">Tips from our vets and groomers</span>
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href="#blog"
              className="group inline-flex items-center gap-2 rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-forest hover:text-white"
            >
              All articles
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-6">
          {POSTS.map((post, i) => (
            <Reveal key={post.title} delay={i * 0.1}>
              <article className="group relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-sage">
                  <img
                    src={post.image.src}
                    srcSet={post.image.srcSet}
                    sizes="(min-width: 768px) 30vw, 90vw"
                    width={post.image.width}
                    height={post.image.height}
                    alt={post.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-forest backdrop-blur">
                    {post.tag}
                  </span>
                  <span className="absolute bottom-4 right-4 grid size-11 translate-y-2 place-items-center rounded-full bg-orange text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
                <p className="mt-5 text-sm text-gray-500">
                  {post.date} · {post.time}
                </p>
                <h3 className="mt-2 font-serif-display text-[28px] leading-tight text-forest">
                  <a href="#blog" className="after:absolute after:inset-0">
                    {post.title}
                  </a>
                </h3>
                <p className="mt-3 leading-relaxed text-gray-600">{post.excerpt}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
