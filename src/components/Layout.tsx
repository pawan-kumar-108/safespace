import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PenLine, Users, Sparkles, BookOpen, BookHeart, MessageCircle, User, LogOut, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/reflect', icon: PenLine, label: 'Reflect' },
  { path: '/connect', icon: Users, label: 'Connect' },
  { path: '/wellness', icon: Sparkles, label: 'Wellness' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
  { path: '/stories', icon: BookHeart, label: 'Stories' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isProfessional, setIsProfessional] = useState(false);

  useEffect(() => {
    if (user) {
      checkProfessionalStatus();
    } else {
      setIsProfessional(false);
    }
  }, [user]);

  const checkProfessionalStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'verified')
      .single();
    setIsProfessional(!!data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-lg">🌿</span>
              </div>
              <span className="font-semibold text-lg text-foreground">Safe Space</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? 'safe' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {isProfessional && (
                <Link to="/therapist-dashboard">
                  <Button variant="lavender" size="sm" className="hidden sm:flex gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              )}
              <Link to="/professionals">
                <Button variant="safe-outline" size="sm" className="hidden sm:flex gap-2">
                  <Shield className="w-4 h-4" />
                  Therapists
                </Button>
              </Link>
              {user ? (
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="safe" size="sm">
                    <User className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? 'safe' : 'ghost'}
                size="icon"
                className="flex flex-col gap-0.5 h-auto py-2 px-3"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
