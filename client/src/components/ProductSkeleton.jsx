export default function ProductSkeleton() {
  return (
    <div className="card animate-pulse group">
      <div className="aspect-square bg-white/5 overflow-hidden"></div>
      <div className="p-5 flex items-end justify-between">
        <div className="w-2/3">
          <div className="h-3 w-1/3 bg-white/5 rounded mb-2"></div>
          <div className="h-5 w-3/4 bg-white/10 rounded"></div>
        </div>
        <div className="h-5 w-1/4 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}
