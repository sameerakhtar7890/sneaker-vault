export default function ProductSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square shimmer-skeleton" />
      <div className="p-5 flex items-end justify-between border-t border-white/5">
        <div className="w-2/3 space-y-2">
          <div className="h-3 w-1/3 shimmer-skeleton rounded" />
          <div className="h-5 w-3/4 shimmer-skeleton rounded" />
        </div>
        <div className="h-5 w-14 shimmer-skeleton rounded" />
      </div>
    </div>
  );
}
