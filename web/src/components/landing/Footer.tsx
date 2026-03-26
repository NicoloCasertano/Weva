export function Footer() {
  return (
    <footer className="border-t border-weva-border px-6 py-10 text-center text-sm text-weva-text-secondary">
      <p className="mb-2">
        <span className="font-semibold text-weva-primary">Weva</span> — Voce
        in Preventivi
      </p>
      <p className="mb-4">
        AI completamente on-device. I tuoi dati non lasciano mai il tuo
        telefono.
      </p>
      <p className="text-xs text-weva-text-secondary/50">
        © {new Date().getFullYear()} Weva. Tutti i diritti riservati.
      </p>
    </footer>
  );
}
