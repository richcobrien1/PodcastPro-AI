import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="flex space-x-0.5">
              <div className="w-1 h-5 bg-white/90 rounded"></div>
              <div className="w-1 h-10 bg-white/90 rounded"></div>
              <div className="w-1 h-12 bg-white/90 rounded"></div>
              <div className="w-1 h-7 bg-white/90 rounded"></div>
              <div className="w-1 h-14 bg-gradient-to-b from-accent to-accent-dark rounded"></div>
              <div className="w-1 h-10 bg-white/90 rounded"></div>
              <div className="w-1 h-6 bg-white/90 rounded"></div>
            </div>
            <h1 className="text-3xl font-bold text-white">
              PodcastPro<span className="bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">AI</span>
            </h1>
          </div>
          <p className="text-white/70 text-lg">Sign in to your account</p>
        </div>
        
        <SignIn 
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl"
            }
          }}
        />
      </div>
    </div>
  );
}
