const features = [
  {
    icon: "🎤",
    title: "Registra",
    description:
      "Tieni premuto e descrivi il lavoro da quotare. Weva cattura ogni dettaglio della tua voce.",
  },
  {
    icon: "🧠",
    title: "AI On-Device",
    description:
      "Whisper trascrive, Phi-3 estrae i dati. Tutto sul tuo telefono, nessun dato inviato a server esterni.",
  },
  {
    icon: "📄",
    title: "Esporta PDF",
    description:
      "Genera preventivi professionali in PDF con i tuoi dati e condividili via email o WhatsApp.",
  },
] as const;

export function Features() {
  return (
    <section className="px-6 py-20">
      <h2 className="mb-12 text-center text-3xl font-bold">Come funziona</h2>

      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-weva-border bg-weva-surface p-6 text-center transition hover:border-weva-primary/40"
          >
            <div className="mb-4 text-5xl">{f.icon}</div>
            <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-weva-text-secondary">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
