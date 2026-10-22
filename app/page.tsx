import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#2c1810]">

      {/* ───────────────────── HERO ───────────────────── */}
      <section
        id="home"
        className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#2c1810] via-[#4a2c20] to-[#1a0f08] text-white"
      >
        {/* Decorative circles */}
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-amber-700/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 inline-block rounded-full border border-amber-400/40 bg-amber-900/30 px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
            Grade 1 · Single Origin · Direct Trade
          </p>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Export-Quality Coffee,{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Rigorous Standards
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-amber-100/70 md:text-xl">
            Export-quality coffee is subject to rigorous quality control measures
            to ensure that only the finest beans reach international markets.
            From cherry selection to final cupping — every step is meticulously
            monitored.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#quality-control"
              className="rounded-full bg-amber-500 px-8 py-3.5 text-sm font-bold text-[#2c1810] shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30"
            >
              Explore Quality Process
            </a>
            <Link
              href="/katalog"
              className="rounded-full border border-amber-400/30 px-8 py-3.5 text-sm font-bold text-amber-200 transition-all hover:border-amber-400/60 hover:bg-amber-900/30"
            >
              Lihat Katalog Kopi
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 text-amber-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ───────────────────── STATS BAR ───────────────────── */}
      <section className="bg-[#2c1810] py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { value: "17+", label: "Islands of Origin" },
            { value: "Grade 1", label: "Export Standard" },
            { value: "100%", label: "Traceability" },
            { value: "30+", label: "Countries Served" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-amber-400 md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-amber-200/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────── QUALITY CONTROL PROCESS ───────────────────── */}
      <section id="quality-control" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">
              Our Process
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
              Rigorous Quality Control
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#6b4c3b]">
              Every batch undergoes a multi-stage inspection pipeline, ensuring
              only beans that meet the highest international export standards are
              approved for shipment.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                icon: "🌿",
                title: "Cherry Selection",
                description:
                  "Hand-picked at peak ripeness. Only fully red, mature cherries are harvested — ensuring optimal sugar development and flavor potential.",
              },
              {
                step: "02",
                icon: "💧",
                title: "Wet Processing",
                description:
                  "Cherries are pulped and fermented in controlled environments. Precise water temperature and duration unlock clean, bright cup profiles.",
              },
              {
                step: "03",
                icon: "☀️",
                title: "Drying & Moisture Control",
                description:
                  "Sun-dried on raised beds to 11–12% moisture content. Monitored with digital hygrometers for absolute consistency across lots.",
              },
              {
                step: "04",
                icon: "🔬",
                title: "Defect Sorting",
                description:
                  "Multi-pass sorting: gravity tables, UV light scanning, and hand-sorting to remove defects. Grade 1 allows maximum 3 defects per 300g.",
              },
              {
                step: "05",
                icon: "👃",
                title: "Cupping & Sensory Analysis",
                description:
                  "Q-Graders evaluate each lot on a 100-point SCA scale — aroma, flavor, acidity, body, balance, and aftertaste are all scored.",
              },
              {
                step: "06",
                icon: "📦",
                title: "Export Packaging",
                description:
                  "Vacuum-sealed in GrainPro liners inside jute bags. Each bag is tagged with lot number, origin, altitude, variety, and cupping score.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/5"
              >
                <span className="absolute right-4 top-4 text-6xl font-black text-amber-100/50 transition-colors group-hover:text-amber-200/60">
                  {item.step}
                </span>
                <div className="relative">
                  <span className="mb-4 inline-block text-4xl">{item.icon}</span>
                  <h3 className="mb-2 text-xl font-bold text-[#2c1810]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#7a5e4d]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── COFFEE VARIETIES ───────────────────── */}
      <section
        id="our-coffees"
        className="bg-gradient-to-b from-[#2c1810] to-[#3d2318] py-24 text-white"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              Our Collection
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
              Premium Indonesian Origins
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-amber-100/60">
              Each origin tells a unique story — shaped by volcanic soil,
              tropical altitude, and generations of farming expertise.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Gayo Arabica",
                region: "Aceh, Sumatra",
                altitude: "1,200–1,600m",
                notes: "Herbal, Earthy, Low Acidity",
                score: "85+",
              },
              {
                name: "Toraja Kalosi",
                region: "South Sulawesi",
                altitude: "1,400–1,800m",
                notes: "Spicy, Dark Chocolate, Full Body",
                score: "84+",
              },
              {
                name: "Java Preanger",
                region: "West Java",
                altitude: "1,200–1,500m",
                notes: "Floral, Citrus, Sweet Finish",
                score: "83+",
              },
              {
                name: "Bali Kintamani",
                region: "Bali",
                altitude: "900–1,200m",
                notes: "Citrus, Lemon, Bright Acidity",
                score: "84+",
              },
            ].map((coffee) => (
              <div
                key={coffee.name}
                className="group rounded-2xl border border-amber-800/30 bg-amber-950/30 p-6 backdrop-blur transition-all hover:border-amber-600/40 hover:bg-amber-950/50"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-700/30 text-2xl transition-colors group-hover:bg-amber-600/40">
                  ☕
                </div>
                <h3 className="text-lg font-bold text-amber-100">
                  {coffee.name}
                </h3>
                <p className="mt-0.5 text-xs text-amber-300/60">
                  {coffee.region}
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-200/50">Altitude</span>
                    <span className="font-medium text-amber-200">
                      {coffee.altitude}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-200/50">SCA Score</span>
                    <span className="font-bold text-amber-400">
                      {coffee.score}
                    </span>
                  </div>
                </div>
                <div className="mt-4 border-t border-amber-800/30 pt-4">
                  <p className="text-xs text-amber-200/50">Tasting Notes</p>
                  <p className="mt-1 text-sm font-medium text-amber-100/80">
                    {coffee.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── GRADING TABLE ───────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">
              Standards
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Export Grading Classification
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white shadow-lg">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e8ddd0] bg-[#2c1810] text-amber-100">
                  <th className="px-6 py-4 font-semibold">Grade</th>
                  <th className="px-6 py-4 font-semibold">Max Defects / 300g</th>
                  <th className="px-6 py-4 font-semibold">SCA Score</th>
                  <th className="px-6 py-4 font-semibold">Market</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6d8]">
                {[
                  {
                    grade: "Grade 1 (Specialty)",
                    defects: "0–3",
                    score: "80+",
                    market: "Premium Export",
                    highlight: true,
                  },
                  {
                    grade: "Grade 2 (Premium)",
                    defects: "4–12",
                    score: "75–79",
                    market: "Commercial Export",
                    highlight: false,
                  },
                  {
                    grade: "Grade 3 (Exchange)",
                    defects: "13–25",
                    score: "70–74",
                    market: "Commodity Export",
                    highlight: false,
                  },
                  {
                    grade: "Grade 4 (Below Standard)",
                    defects: "26–46",
                    score: "60–69",
                    market: "Domestic Only",
                    highlight: false,
                  },
                ].map((row) => (
                  <tr
                    key={row.grade}
                    className={`transition-colors hover:bg-amber-50 ${
                      row.highlight ? "bg-amber-50/60 font-semibold" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        {row.highlight && (
                          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                        )}
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">{row.defects}</td>
                    <td className="px-6 py-4">{row.score}</td>
                    <td className="px-6 py-4">{row.market}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-[#9a7e6d]">
            Based on SCA (Specialty Coffee Association) and SNI 01-2907
            Indonesian National Standard
          </p>
        </div>
      </section>

      {/* ───────────────────── CTA / CONTACT ───────────────────── */}
      <section
        id="contact"
        className="relative overflow-hidden bg-gradient-to-r from-amber-700 to-amber-900 py-24 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Ready to Source Premium Indonesian Coffee?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-amber-100/70">
            Connect with us for samples, pricing, and direct-trade partnerships.
            We ship FOB from Belawan, Tanjung Priok, and Makassar ports.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:export@nusantaracoffee.id"
              className="rounded-full bg-white px-10 py-4 text-sm font-bold text-amber-900 shadow-lg transition-all hover:bg-amber-50 hover:shadow-xl"
            >
              Request Samples →
            </a>
            <a
              href="#"
              className="rounded-full border-2 border-white/30 px-10 py-4 text-sm font-bold transition-all hover:border-white/60 hover:bg-white/10"
            >
              Download Catalog
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

