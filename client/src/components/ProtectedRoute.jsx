import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Show nothing while checking auth status
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary-dark flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
