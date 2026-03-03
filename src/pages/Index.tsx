import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { PenLine, Users, Sparkles, BookOpen, BookHeart, MessageCircle, Shield, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: PenLine,
    title: 'Reflect',
    description: 'Private journaling with AI-powered empathetic responses',
    path: '/reflect',
    color: 'bg-safe-sage-light',
    iconColor: 'text-safe-sage',
  },
  {
    icon: Users,
    title: 'Connect',
    description: 'Anonymous peer support in safe topic-based spaces',
    path: '/connect',
    color: 'bg-safe-lavender',
    iconColor: 'text-accent-foreground',
  },
  {
    icon: Sparkles,
    title: 'Wellness',
    description: 'Breathing exercises, grounding techniques & mood tracking',
    path: '/wellness',
    color: 'bg-safe-sky',
    iconColor: 'text-safe-sky-dark',
  },
  {
    icon: BookOpen,
    title: 'Learn',
    description: 'Youth-friendly mental health education',
    path: '/learn',
    color: 'bg-safe-warm',
    iconColor: 'text-foreground',
  },
  {
    icon: BookHeart,
    title: 'Stories',
    description: 'Interactive narratives that break cultural stigma',
    path: '/stories',
    color: 'bg-safe-coral-light',
    iconColor: 'text-safe-coral',
  },
  {
    icon: MessageCircle,
    title: 'Chat',
    description: 'AI mental health advisor for guidance and support',
    path: '/chat',
    color: 'bg-safe-sage-light',
    iconColor: 'text-safe-sage',
  },
];

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-calm opacity-50" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-6 flex items-center justify-center shadow-glow animate-breathe">
              <span className="text-4xl">🌿</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4 tracking-tight">
              Safe Space
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              A safe place to feel, reflect, and connect.
            </p>
            
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              You're safe here. Move at your own pace. Explore emotions, find support, 
              and learn about mental wellness in a judgment-free environment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/reflect">
                  <Button variant="safe" size="xl">
                    Start Reflecting
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="safe" size="xl">
                      Get Started
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/learn">
                    <Button variant="safe-outline" size="xl">
                      Explore First
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
          Your spaces for growth and healing
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Link key={feature.path} to={feature.path}>
              <div 
                className="group p-6 rounded-2xl bg-card hover:shadow-medium transition-all duration-300 border border-border hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Professional Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-soft border border-border">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-safe-lavender flex items-center justify-center shrink-0">
              <Shield className="w-10 h-10 text-accent-foreground" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                Connect with Verified Professionals
              </h3>
              <p className="text-muted-foreground mb-4">
                Our platform includes verified therapists, counselors, and mental health 
                professionals who contribute trusted content and are available for guidance.
              </p>
              <Link to="/professionals">
                <Button variant="lavender" size="lg">
                  Discover Therapists
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Safe Space is an early emotional support tool, not a replacement for professional care.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          If you're in crisis, please reach out to a trusted adult or crisis helpline.
        </p>
      </footer>
    </div>
  );
}
