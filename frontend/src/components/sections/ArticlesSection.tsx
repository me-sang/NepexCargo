import { SectionHeader } from "@/components/ui/SectionHeader";

const articles = [
  {
    date: "April 20, 2026",
    title: "Cargo+ opens new logistics hub in Rotterdam",
    excerpt:
      "Expanding our European network with a new 40,000 m² distribution center near the Port of Rotterdam.",
    tag: "Logistics",
    bg: "linear-gradient(135deg, #09242B 0%, #1B7E96 100%)",
  },
  {
    date: "May 20, 2026",
    title: "Hybrid fleet reaches 100 active vehicles across Europe",
    excerpt:
      "Continuing our sustainability roadmap by integrating hybrid transport solutions to reduce emissions.",
    tag: "Sustainability",
    bg: "linear-gradient(135deg, #1B4D2E 0%, #2390AC 100%)",
  },
  {
    date: "June 20, 2026",
    title: "New cross-border corridor connects Warsaw and Hamburg",
    excerpt:
      "Improved transit times and real-time customs tracking enhance regional logistics efficiency.",
    tag: "Routes",
    bg: "linear-gradient(135deg, #4A2A0E 0%, #2390AC 100%)",
  },
];

export function ArticlesSection() {
  return (
    <section className="py-20 lg:py-24 bg-[var(--color-accent-soft)]">
      <div className="container-content">
        <SectionHeader
          eyebrow="Articles"
          title="From the Nepex Cargo articles"
          description="Industry trends, shipping tips and product updates."
          align="center"
          className="mb-12 mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {articles.map((article) => (
            <article
              key={article.title}
              className="group bg-white rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] hover:shadow-[var(--shadow-card-lg)] transition-shadow cursor-pointer"
            >
              {/* Image placeholder */}
              <div
                className="aspect-[16/10] relative overflow-hidden"
                style={{ background: article.bg }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 40% 60%, rgba(255,255,255,0.4) 0%, transparent 60%)",
                  }}
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[var(--color-brand)] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {article.tag}
                </span>
              </div>

              <div className="p-6">
                <time className="text-[11px] text-[#7A8E96] font-medium tracking-wide uppercase">
                  {article.date}
                </time>
                <h3 className="mt-2.5 text-[15px] font-bold text-[var(--color-text)] leading-snug group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-2.5 text-[13px] text-[#56707A] leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-accent)] group-hover:gap-2.5 transition-all">
                  Read article
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
