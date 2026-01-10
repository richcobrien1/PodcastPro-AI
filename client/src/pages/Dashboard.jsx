import { Link } from 'react-router-dom';
import { 
  Upload, 
  Video, 
  FolderOpen, 
  ArrowRight,
  PlayCircle
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Assets', value: '0', icon: FolderOpen, color: 'from-blue-500 to-blue-600' },
    { label: 'Videos Generated', value: '0', icon: Video, color: 'from-purple-500 to-purple-600' },
    { label: 'Templates Saved', value: '0', icon: PlayCircle, color: 'from-accent to-accent-dark' },
  ];

  const quickActions = [
    {
      title: 'Upload Assets',
      description: 'Add backgrounds, promos, and outros',
      icon: Upload,
      link: '/assets',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Generate Video',
      description: 'Create a new podcast video',
      icon: Video,
      link: '/generate',
      color: 'from-accent to-accent-dark'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to PodcastPro<span className="bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">AI</span>
        </h1>
        <p className="text-white/70 text-lg">AI-powered podcast video generation at your fingertips</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-white/60 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.link}
              className="group bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-accent/50 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color}`}>
                  <action.icon size={24} className="text-white" />
                </div>
                <ArrowRight className="text-white/40 group-hover:text-accent group-hover:translate-x-1 transition" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
              <p className="text-white/60">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-accent/20 to-accent-dark/20 backdrop-blur-sm rounded-lg p-8 border border-accent/30">
        <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
        <ol className="space-y-3 text-white/80">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold mr-3">1</span>
            <span><strong className="text-white">Upload your assets</strong> - Add backgrounds, promo videos, audio clips, and outros to your library</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold mr-3">2</span>
            <span><strong className="text-white">Configure your video</strong> - Set up how your podcast video should be composed</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold mr-3">3</span>
            <span><strong className="text-white">Generate with AI</strong> - Let AI create your complete podcast video automatically</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
