import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Play, Dumbbell } from "lucide-react";

export default async function MemberTutorialPage() {
  const supabase = await createClient();

  const { data: tutorials } = await supabase
    .from("tutorials")
    .select("id, judul, deskripsi, tipe_file, url_file, thumbnail_url, kategori_gerakan")
    .eq("is_active", true)
    .order("urutan", { ascending: true });

  const staticTutorials = [
    {
      id: "st1",
      judul: "Bench Press",
      deskripsi: "Latihan dasar untuk membentuk otot dada, bahu, dan triceps. Cocok untuk pemula hingga mahir.",
      kategori_gerakan: "Dada & Triceps",
      image: "/tutorial-bench-press.jpg",
      tips: ["Punggung tetap menempel bench", "Grip selebar bahu", "Turunkan perlahan, angkat eksplosif"],
    },
    {
      id: "st2",
      judul: "Barbell Squat",
      deskripsi: "Raja latihan kaki. Melatih quads, hamstrings, gluteus, dan seluruh otot core secara bersamaan.",
      kategori_gerakan: "Kaki & Core",
      image: "/tutorial-squat.jpg",
      tips: ["Punggung lurus, dada tegak", "Lutut mengikuti arah jari kaki", "Turun hingga paha sejajar lantai"],
    },
    {
      id: "st3",
      judul: "Deadlift",
      deskripsi: "Latihan compound yang melatih hampir seluruh tubuh, terutama punggung bawah dan kaki.",
      kategori_gerakan: "Punggung & Kaki",
      image: "/tutorial-deadlift.jpg",
      tips: ["Punggung netral (tidak membungkuk)", "Bar dekat dengan kaki sepanjang gerakan", "Dorong lantai dengan kaki saat angkat"],
    },
    {
      id: "st4",
      judul: "Pull-Up",
      deskripsi: "Latihan bodyweight terbaik untuk melatih otot punggung lebar (lat) dan biceps.",
      kategori_gerakan: "Punggung & Biceps",
      image: "/tutorial-pullup.jpg",
      tips: ["Grip lebih lebar dari bahu", "Tarik dagu melewati bar", "Turunkan perlahan untuk kontrol maksimal"],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
          TUTORIAL GERAKAN
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Pelajari teknik latihan yang benar untuk hasil optimal dan menghindari cedera.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {staticTutorials.map((tutorial) => (
          <div
            key={tutorial.id}
            className="card overflow-hidden group"
            style={{ padding: 0 }}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={tutorial.image}
                alt={tutorial.judul}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="badge badge-orange">{tutorial.kategori_gerakan}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-bebas text-2xl mb-2" style={{ color: "var(--color-text-primary)" }}>
                {tutorial.judul}
              </h3>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {tutorial.deskripsi}
              </p>

              {/* Tips */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-brand-orange)" }}>
                  Tips Penting
                </div>
                {tutorial.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold"
                      style={{ background: "rgba(255,107,44,0.15)", color: "var(--color-brand-orange)" }}
                    >
                      {i + 1}
                    </span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supabase tutorials (dynamic) */}
      {tutorials && tutorials.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bebas text-2xl mb-4" style={{ color: "var(--color-text-primary)" }}>
            TUTORIAL TAMBAHAN
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tutorials.map((t) => (
              <div key={t.id} className="card flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,107,44,0.1)" }}
                >
                  {t.tipe_file === "mp4" ? (
                    <Play className="w-5 h-5" style={{ color: "var(--color-brand-orange)" }} />
                  ) : (
                    <Dumbbell className="w-5 h-5" style={{ color: "var(--color-brand-orange)" }} />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1" style={{ color: "var(--color-text-primary)" }}>
                    {t.judul}
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{t.kategori_gerakan}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
