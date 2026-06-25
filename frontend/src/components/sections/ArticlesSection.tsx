import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Article = {
  title: string;
  excerpt: string;
  date: string;
  image: string;
  imageAlt: string;
};

const ARTICLE_IMAGE = "/images/article-dummy.png";

const articles: Article[] = [
  {
    title: "Cargo+ opens new logistics hub in Rotterdam",
    excerpt:
      "Expanding our European network with a new 40,000 m² distribution center near the Port of Rotterdam.",
    date: "April 20, 2026",
    image: ARTICLE_IMAGE,
    imageAlt: "Reach stacker lifting a container at a port terminal",
  },
  {
    title: "Hybrid fleet reaches 100 active vehicles across Europe",
    excerpt:
      "Cargo+ continues its sustainability roadmap by integrating hybrid transport solutions to reduce emissions.",
    date: "May 20, 2026",
    image: ARTICLE_IMAGE,
    imageAlt: "Container truck on a highway",
  },
  {
    title: "New cross-border corridor connects Warsaw and Hamburg",
    excerpt:
      "Improved transit times and real-time customs tracking enhance regional logistics efficiency.",
    date: "June 20, 2026",
    image: ARTICLE_IMAGE,
    imageAlt: "Reach stacker moving a container in a stacked container yard",
  },
];

export function ArticlesSection() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--color-accent-soft)]">
      <div className="container-content">
        <SectionHeader
          eyebrow="Articles"
          title="From the Nepex Cargo articles"
          description="Industry trends, shipping tips and product updates."
          align="center"
          className="mb-14 mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {articles.map((article) => (
            <article
              key={article.title}
              className="bg-white rounded-[18px] p-4 lg:p-[18px] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-lg)] transition-shadow cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[16/11] overflow-hidden rounded-[12px] bg-[var(--color-border)]">
                <Image
                  src={article.image}
                  alt={article.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="px-2 pt-5 pb-3 flex flex-col flex-1">
                <h3 className="text-[18px] lg:text-[19px] font-bold text-[var(--color-text)] leading-snug line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-3 text-[14px] text-[#56707A] leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                <time className="mt-6 text-[14px] font-medium text-[var(--color-accent)]">
                  {article.date}
                </time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
