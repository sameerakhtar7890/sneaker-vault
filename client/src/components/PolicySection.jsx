export function PolicySection({ title, children }) {
  return (
    <section className="glass rounded-2xl p-6 md:p-8">
      <h2 className="font-display text-xl text-gold mb-4">{title}</h2>
      <div className="text-sm text-zinc-400 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function PolicyList({ items }) {
  return (
    <ul className="list-disc list-inside space-y-2 text-zinc-500">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
