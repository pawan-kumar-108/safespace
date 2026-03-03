import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Professional } from '@/lib/types';
import { Shield, MessageCircle, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Professionals() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfessionals(); }, []);

  const loadProfessionals = async () => {
    const { data } = await supabase.from('professionals').select('*').eq('status', 'verified');
    setProfessionals((data as Professional[]) || []);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-safe-lavender mx-auto mb-4 flex items-center justify-center">
          <Shield className="w-8 h-8 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Verified Professionals</h1>
        <p className="text-muted-foreground mb-4">Certified therapists and counselors in our community</p>
        
        <Link to="/therapist-register">
          <Button variant="safe-outline" size="sm" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Join as a Professional
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No verified professionals yet.</p>
          <p className="text-sm text-muted-foreground mt-2 mb-4">Be the first to join!</p>
          <Link to="/therapist-register">
            <Button variant="safe">Register as Professional</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {professionals.map(pro => (
            <div key={pro.id} className="bg-card rounded-2xl p-5 border border-border shadow-soft animate-slide-up">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-safe-lavender flex items-center justify-center shrink-0">
                  <Shield className="w-7 h-7 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{pro.full_name}</h3>
                  <p className="text-sm text-primary">{pro.title}</p>
                  {pro.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pro.bio}</p>}
                  
                  {pro.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pro.specializations.slice(0, 3).map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted">{s}</span>
                      ))}
                      {pro.specializations.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted">+{pro.specializations.length - 3}</span>
                      )}
                    </div>
                  )}

                  {pro.languages.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Speaks: {pro.languages.join(', ')}
                    </p>
                  )}
                  
                  {user ? (
                    <Link to={`/therapist-chat/${pro.user_id}`}>
                      <Button variant="safe-outline" size="sm" className="mt-3 gap-2">
                        <MessageCircle className="w-3 h-3" /> Contact
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth">
                      <Button variant="safe-outline" size="sm" className="mt-3 gap-2">
                        <MessageCircle className="w-3 h-3" /> Sign in to Contact
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
