import { Link, useLocation } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { 
  LayoutDashboard, 
  Video, 
  FolderOpen, 
  Settings,
  Wand2,
  LogIn
} from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const { isSignedIn, user } = useUser();
  
  const isActive = (path) => location.pathname === path;
  
  const navLinks = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/assets', icon: FolderOpen, label: 'Assets' },
    { path: '/videos', icon: Video, label: 'Videos' },
    { path: '/generate', icon: Wand2, label: 'Generate' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary-dark">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
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
            </Link>
            
            <div className="flex items-center space-x-4">
              {isSignedIn && (
                <nav className="hidden md:flex items-center space-x-1">
                  {navLinks.map(({ path, icon: Icon, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                        isActive(path)
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </Link>
                  ))}
                </nav>
              )}
              
              {/* User Menu */}
              {isSignedIn ? (
                <div className="flex items-center space-x-3">
                  <span className="hidden sm:block text-white/80 text-sm">
                    {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
                  </span>
                  <UserButton 
                    afterSignOutUrl="/sign-in"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 ring-2 ring-accent"
                      }
                    }}
                  />
                </div>
              ) : (
                <Link
                  to="/sign-in"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold rounded-lg hover:opacity-90 transition"
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
