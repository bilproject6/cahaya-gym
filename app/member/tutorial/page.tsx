"use client";

import Image from "next/image";

const TUTORIALS = [
  { img: "/Bench_Press.gif",     cat: "Dada",             title: "Bench Press",      tips: ["Punggung menempel bench", "Grip selebar bahu", "Turunkan perlahan, angkat eksplosif"] },
  { img: "/Deadlift.gif",        cat: "Punggung",         title: "Deadlift",          tips: ["Punggung netral, tidak bungkuk", "Bar dekat kaki sepanjang gerakan", "Dorong lantai dengan kaki"] },
  { img: "/Lat_Pulldown.gif",    cat: "Punggung & Bisep", title: "Lat Pulldown",      tips: ["Tarik ke dada bagian atas", "Siku mengarah ke bawah", "Kontrol saat kembali ke atas"] },
  { img: "/Bicep_Curl.gif",      cat: "Bisep",            title: "Bicep Curl",        tips: ["Siku tidak bergerak maju", "Genggam erat", "Kontraksikan puncak gerakan"] },
  { img: "/Tricep_Pushdown.gif", cat: "Trisep",           title: "Tricep Pushdown",   tips: ["Siku tetap di samping tubuh", "Dorongan penuh hingga ekstensi", "Naik perlahan untuk kontrol"] },
  { img: "/Cable_Crossover.gif", cat: "Dada",             title: "Cable Crossover",   tips: ["Badan sedikit maju", "Gerakan melingkar lebar", "Fokus squeeze di tengah dada"] },
  { img: "/Leg_Press.gif",       cat: "Kaki",             title: "Leg Press",         tips: ["Jangan kunci lutut di atas", "Tumit menempel platform", "Turunkan terkontrol"] },
  { img: "/Kettlebell_Swing.gif",cat: "Full Body",        title: "Kettlebell Swing",  tips: ["Gerak dari pinggul, bukan bahu", "Core kencang sepanjang gerakan", "Ayunan hingga sejajar bahu"] },
];

export default function MemberTutorialPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
          TUTORIAL GERAKAN
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Pelajari teknik latihan yang benar untuk hasil optimal dan menghindari cedera.
        </p>
      </div>

      {/* Grid 4×2 — sama persis dengan landing page */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          border: "3px solid var(--color-border-default)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
        className="tutorial-grid"
      >
        {TUTORIALS.map((item, i) => (
          <div
            key={i}
            className="gym-tutorial-card group"
            style={{
              position: "relative",
              overflow: "hidden",
              aspectRatio: "4/5",
              borderRight: i % 4 < 3 ? "2px solid var(--color-border-default)" : "none",
              borderBottom: i < 4 ? "2px solid var(--color-border-default)" : "none",
              cursor: "default",
            }}
          >
            {/* GIF */}
            <img
              src={item.img}
              alt={item.title}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            {/* Dark overlay — always visible */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />

            {/* Label bawah */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem 1rem" }}>
              <div
                className="font-barlow"
                style={{ fontSize: "0.7rem", fontWeight: 700, color: "#D4A73B", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.2rem" }}
              >
                {item.cat}
              </div>
              <h3
                className="font-anton"
                style={{ fontSize: "1.25rem", color: "#fff", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "0.5rem" }}
              >
                {item.title}
              </h3>

              {/* Tips — muncul saat hover */}
              <div
                className="tutorial-tips"
                style={{
                  maxHeight: 0,
                  overflow: "hidden",
                  transition: "max-height 0.35s ease, opacity 0.3s ease",
                  opacity: 0,
                }}
              >
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {item.tips.map((tip, ti) => (
                    <li key={ti} style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", fontSize: "0.72rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.4 }}>
                      <span style={{ color: "#D4A73B", flexShrink: 0, fontWeight: 700 }}>›</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: 2 kolom */}
      <style>{`
        @media (max-width: 768px) {
          .tutorial-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        .gym-tutorial-card:hover .tutorial-tips {
          max-height: 120px !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Catatan */}
      <p
        className="text-xs text-center mt-6"
        style={{ color: "var(--color-text-muted)" }}
      >
        Arahkan kursor ke kartu untuk melihat tips teknik gerakan.
      </p>
    </div>
  );
}
