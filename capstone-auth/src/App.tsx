import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthService from './auth';
import Dashboard from './components/Dashboard';
import OCRDashboard from './components/OCRDashboard';
import { User } from './types';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { Chrome, Lock, Mail, KeyRound, LogOut, LayoutDashboard, FileText, Github, Sparkles, TrendingUp, Award } from 'lucide-react';

const isValidEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);

// Welcome component for authenticated users with enhanced UI
const WelcomeScreen = ({ user, loading, handleSignOut }: { user: User; loading: boolean; handleSignOut: () => void }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <Card className="w-full max-w-lg shadow-2xl border-2 relative z-10 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-4 ring-blue-100 dark:ring-blue-900 transform hover:scale-110 transition-transform duration-300">
            <span className="text-4xl font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome back!</CardTitle>
            <CardDescription className="text-base mt-2 font-medium">{user.email}</CardDescription>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Ready to analyze your skills?</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            size="lg"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/ocr')}
            variant="outline"
            className="w-full border-2 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300 transform hover:-translate-y-0.5"
            size="lg"
          >
            <FileText className="w-5 h-5 mr-2" />
            Resume OCR Scanner
          </Button>
          <Button 
            onClick={handleSignOut}
            disabled={loading}
            variant="ghost"
            className="w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all duration-300"
            size="lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {loading ? 'Signing out...' : 'Sign Out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Auth component for login/signup with enhanced design
const AuthScreen = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  error, 
  isLogin, 
  setIsLogin, 
  loading, 
  googleLoading,
  githubLoading,
  handleSubmit, 
  handleGoogleSignIn,
  handleGithubSignIn,
  handleKeyDown 
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string;
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  loading: boolean;
  googleLoading: boolean;
  githubLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleGoogleSignIn: () => void;
  handleGithubSignIn: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
    {/* Animated background elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
    
    <Card className="w-full max-w-md shadow-2xl border-2 relative z-10 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-4 ring-blue-100 dark:ring-blue-900">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <div>
          <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isLogin ? 'Sign in to continue your journey' : 'Join us and unlock your potential'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 border-2 focus:border-blue-500 transition-colors"
              disabled={loading || googleLoading || githubLoading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 border-2 focus:border-blue-500 transition-colors"
              disabled={loading || googleLoading || githubLoading}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={loading || googleLoading || githubLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          size="lg"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            isLogin ? 'Sign In' : 'Create Account'
          )}
        </Button>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-2 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t-2" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 py-1 text-muted-foreground font-semibold rounded-full border-2">Or continue with</span>
          </div>
        </div>
        
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading || githubLoading}
          variant="outline"
          className="w-full border-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950 transition-all duration-300 transform hover:-translate-y-0.5"
          size="lg"
        >
          <Chrome className="w-5 h-5 mr-2" />
          {googleLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Connecting...
            </>
          ) : (
            'Continue with Google'
          )}
        </Button>
        
        <Button
          onClick={handleGithubSignIn}
          disabled={loading || googleLoading || githubLoading}
          variant="outline"
          className="w-full border-2 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-0.5"
          size="lg"
        >
          <Github className="w-5 h-5 mr-2" />
          {githubLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Connecting...
            </>
          ) : (
            'Continue with GitHub'
          )}
        </Button>
        
        <div className="text-center pt-4">
          <Button 
            onClick={() => setIsLogin(!isLogin)}
            variant="link"
            disabled={loading || googleLoading || githubLoading}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  // Check for existing OAuth session on mount
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const userData = isLogin 
        ? await AuthService.login(email, password)
        : await AuthService.signup(email, password);
      
      setUser(userData);
      setError('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const userData = await AuthService.googleSignIn();
      setUser(userData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
    setGoogleLoading(false);
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      const userData = await AuthService.githubSignIn();
      setUser(userData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'GitHub sign-in failed');
    }
    setGithubLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Router>
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/welcome" /> : (
              <AuthScreen 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                error={error}
                isLogin={isLogin}
                setIsLogin={setIsLogin}
                loading={loading}
                googleLoading={googleLoading}
                githubLoading={githubLoading}
                handleSubmit={handleSubmit}
                handleGoogleSignIn={handleGoogleSignIn}
                handleGithubSignIn={handleGithubSignIn}
                handleKeyDown={handleKeyDown}
              />
            )
          } />
          
          <Route path="/welcome" element={
            user ? (
              <WelcomeScreen 
                user={user} 
                loading={loading} 
                handleSignOut={handleSignOut} 
              />
            ) : <Navigate to="/" />
          } />
          
          <Route path="/dashboard" element={
            user ? <Dashboard /> : <Navigate to="/" />
          } />
          
          <Route path="/ocr" element={
            user ? <OCRDashboard /> : <Navigate to="/" />
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
