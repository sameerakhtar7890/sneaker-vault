export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-ink-950/60">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-sm text-zinc-400">
        <div>
          <div className="font-display text-lg text-zinc-100">SNEAKER <span className="text-gold">VAULT</span></div>
          <p className="mt-3">Curated luxury sneakers. Released in limited drops.</p>
        </div>
        <div>
          <h4 className="text-zinc-200 font-semibold mb-3">Vault</h4>
          <ul className="space-y-2"><li>Shop</li><li>Drops</li><li>Concierge</li></ul>
        </div>
        <div>
          <h4 className="text-zinc-200 font-semibold mb-3">Support</h4>
          <ul className="space-y-2"><li>Shipping</li><li>Returns</li><li>Authenticity</li></ul>
        </div>
      </div>
      <div className="text-center text-xs text-zinc-500 pb-6">© {new Date().getFullYear()} Sneaker Vault</div>
    </footer>
  );
}
