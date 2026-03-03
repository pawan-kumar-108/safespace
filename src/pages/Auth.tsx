import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Heart, Stethoscope } from 'lucide-react';

type AuthMode = 'user' | 'therapist';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('user');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: isLogin ? "Welcome back!" : "Account created!",
          description: "You're now signed in to Safe Space.",
        });
        
        if (mode === 'therapist') {
          navigate(isLogin ? '/therapist-dashboard' : '/therapist-register');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-calm">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-glow ${
            mode === 'therapist' ? 'bg-safe-sage' : 'bg-primary'
          }`}>
            <span className="text-3xl">{mode === 'therapist' ? '🩺' : '🌿'}</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {mode === 'therapist' 
              ? (isLogin ? 'Therapist Login' : 'Join as Therapist')
              : (isLogin ? 'Welcome back' : 'Join Safe Space')}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'therapist'
              ? 'Access your dashboard to help others'
              : (isLogin 
                  ? 'A safe place to feel, reflect, and connect.' 
                  : 'Create your anonymous, safe space.')}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
          <button
            type="button"
            onClick={() => setMode('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
              mode === 'user' 
                ? 'bg-card shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="w-4 h-4" />
            User
          </button>
          <button
            type="button"
            onClick={() => setMode('therapist')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
              mode === 'therapist' 
                ? 'bg-card shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Therapist
          </button>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-medium animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              variant={mode === 'therapist' ? 'default' : 'safe'}
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'therapist' ? <Stethoscope className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
            
            {mode === 'therapist' && !isLogin && (
              <p className="text-xs text-muted-foreground">
                After signing up, you'll complete your professional profile
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          {mode === 'therapist' 
            ? 'Your credentials help us verify your professional status.'
            : 'Your privacy matters. All your reflections and activities are private and secure.'}
        </p>
      </div>
    </div>
  );
}
