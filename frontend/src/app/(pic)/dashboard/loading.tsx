export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 rounded-xl w-48" />
      <div className="h-4 bg-gray-100 rounded-xl w-72 -mt-4" />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white border border-gray-100 rounded-2xl" />
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-white border border-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
