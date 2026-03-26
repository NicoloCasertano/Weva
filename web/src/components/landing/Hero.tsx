export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      {/* Logo */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-weva-primary shadow-lg shadow-weva-primary/30">
        <span className="text-4xl">W</span>
      </div>

      <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
        <span className="text-weva-primary">Weva</span>
      </h1>

      <p className="mx-auto mb-2 max-w-xl text-xl text-weva-text-secondary sm:text-2xl">
        Trasforma la tua voce in preventivi professionali
      </p>

      <p className="mx-auto mb-10 max-w-md text-base text-weva-text-secondary/70">
        Registra una nota audio, l&apos;AI trascrive e genera il preventivo.
        Tutto on-device, zero costi cloud, totale privacy.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <a
          href="#download"
          className="inline-flex items-center gap-2 rounded-xl bg-weva-primary px-8 py-4 text-lg font-semibold text-white transition hover:bg-weva-primary-dark"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
          </svg>
          Scarica l&apos;app
        </a>
      </div>

      {/* Mockup placeholder */}
      <div className="mt-16 w-full max-w-sm">
        <div className="mx-auto aspect-[9/16] w-64 overflow-hidden rounded-[2rem] border-4 border-weva-border bg-weva-surface shadow-2xl shadow-weva-primary/10">
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-weva-primary shadow-lg shadow-weva-primary/40">
              <span className="text-5xl">🎤</span>
            </div>
            <p className="text-sm text-weva-text-secondary">
              Tieni premuto per registrare
            </p>
            <div className="mt-4 w-full rounded-xl bg-weva-bg p-3">
              <div className="mb-1 text-xs text-weva-text-secondary">
                Trascrizione
              </div>
              <div className="text-sm text-weva-text">
                &ldquo;Per il cliente Rossi, sito web con 5 pagine...&rdquo;
              </div>
            </div>
            <div className="w-full rounded-xl bg-weva-primary/20 p-3">
              <div className="mb-1 text-xs text-weva-primary">
                Preventivo generato
              </div>
              <div className="text-sm text-weva-text">
                Rossi — 3 voci — € 2.500
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
