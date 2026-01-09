function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary-dark">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Waveform Logo */}
              <div className="flex space-x-0.5">
                <div className="w-1 h-5 bg-white/90 rounded"></div>
                <div className="w-1 h-10 bg-white/90 rounded"></div>
                <div className="w-1 h-12 bg-white/90 rounded"></div>
                <div className="w-1 h-7 bg-white/90 rounded"></div>
                <div className="w-1 h-14 bg-gradient-to-b from-accent to-accent-dark rounded"></div>
                <div className="w-1 h-10 bg-white/90 rounded"></div>
                <div className="w-1 h-6 bg-white/90 rounded"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  PodcastPro<span className="bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">AI</span>
                </h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-white/90 hover:text-white transition">Dashboard</a>
              <a href="#" className="text-white/90 hover:text-white transition">Episodes</a>
              <a href="#" className="text-white/90 hover:text-white transition">Settings</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Automated Podcast Video Production
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
            Transform AI news into engaging podcast videos automatically. 
            From RSS feeds to publishable MP4s—no manual editing required.
          </p>
          
          <div className="flex justify-center gap-4 mb-16">
            <button className="px-8 py-4 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold rounded-lg hover:opacity-90 transition shadow-lg">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition border border-white/20">
              View Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">2 hrs → 10 min</div>
              <div className="text-white/70">Time Saved Per Episode</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">92%</div>
              <div className="text-white/70">Automation Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
              <div className="text-4xl font-bold text-white mb-2">Zero</div>
              <div className="text-white/70">Manual Editing</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full py-6 text-center text-white/60">
        <p>© 2026 PodcastProAI. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App

