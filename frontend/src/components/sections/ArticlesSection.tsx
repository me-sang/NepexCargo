import { SectionHeader } from "@/components/ui/SectionHeader";

const articles = [
  {
    date: "April 20, 2026",
    title: "Cargo+ opens new logistics hub in Rotterdam",
    excerpt: "Expanding our European network with a new 40,000 m² distribution center near the Port of Rotterdam.",
    gradient: "from-[#0D3D5A] to-[#1B2B3B]",
    tag: "Logistics",
  },
  {
    date: "May 20, 2026",
    title: "Hybrid fleet reaches 150 active vehicles across Europe",
    excerpt: "Cargo+ continues its sustainability roadmap by integrating hybrid-transport solutions to reduce emissions.",
    gradient: "from-[#1a5c3a] to-[#0D3D5A]",
    tag: "Sustainability",
  },
  {
    date: "June 20, 2026",
    title: "New cross-border corridor connects Warsaw and Hamburg",
    excerpt: "Improved transit times and real-time customs tracking enhance regional logistics efficiency.",
    gradient: "from-[#7c2d12] to-[#1B2B3B]",
    tag: "Routes",
  },
];

export function ArticlesSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="ARTICLES"
          title="From the Nepex Cargo articles"
          description="Industry trends, shipping tips and product updates."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <article
              key={index}
              className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Image placeholder */}
              <div className={`aspect-video bg-gradient-to-br ${article.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <span className="absolute top-3 left-3 bg-[#2CB4D7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {article.tag}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <time className="text-xs text-[#9CA3AF]">{article.date}</time>
                <h3 className="mt-2 text-sm font-bold text-[#1B2B3B] leading-snug group-hover:text-[#2CB4D7] transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs text-[#6B7280] leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
