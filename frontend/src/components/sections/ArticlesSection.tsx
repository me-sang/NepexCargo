import { SectionHeader } from "@/components/ui/SectionHeader";

const articles = [
  {
    date: "April 20, 2026",
    title: "Cargo+ opens new logistics hub in Rotterdam",
    excerpt: "Expanding our European network with a new 40,000 m² distribution center near the Port of Rotterdam.",
    imageSrc: "/images/article-rotterdam.jpg",
    placeholder: "linear-gradient(160deg, #0D3D5A 0%, #1B2B3B 100%)",
  },
  {
    date: "May 20, 2026",
    title: "Hybrid fleet reaches 100 active vehicles across Europe",
    excerpt: "Cargo+ continues its sustainability roadmap by integrating hybrid-transport solutions to reduce emissions.",
    imageSrc: "/images/article-hybrid-fleet.jpg",
    placeholder: "linear-gradient(160deg, #1a5570 0%, #0D3D5A 100%)",
  },
  {
    date: "June 20, 2026",
    title: "New cross-border corridor connects Warsaw and Hamburg",
    excerpt: "Improved transit times and real-time customs tracking enhance regional logistics efficiency.",
    imageSrc: "/images/article-warsaw.jpg",
    placeholder: "linear-gradient(160deg, #3a1a10 0%, #1B2B3B 100%)",
  },
];

export function ArticlesSection() {
  return (
    <section className="py-20 md:py-24 bg-[#EBF7FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="ARTICLES"
          title="From the Nepex Cargo articles"
          description="Industry trends, shipping tips and product updates."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {articles.map((article, index) => (
            <article
              key={index}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{ background: article.placeholder }}
                />
                {/* <Image src={article.imageSrc} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> */}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-2">
                <h3 className="text-base font-bold text-dark leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                {/* Date at bottom in teal */}
                <time className="text-xs font-semibold text-primary mt-1">{article.date}</time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
