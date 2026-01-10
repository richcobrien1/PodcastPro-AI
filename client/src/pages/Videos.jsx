export default function Videos() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Videos</h1>
        <p className="text-white/70">View and manage your generated podcast videos</p>
      </div>

      <div className="text-center py-16">
        <div className="text-white/30 text-6xl mb-4">🎬</div>
        <p className="text-white/60 text-lg">No videos generated yet</p>
        <p className="text-white/40 text-sm mt-2">Create your first video to see it here</p>
      </div>
    </div>
  );
}
