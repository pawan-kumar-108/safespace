import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Check } from 'lucide-react';

const SPECIALIZATIONS = [
  'Anxiety', 'Depression', 'Stress', 'Self-Esteem', 'Relationships',
  'Family Issues', 'Grief', 'Trauma', 'ADHD', 'Academic Pressure'
];

const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'Arabic', 'Portuguese'];

export default function TherapistRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    title: '',
    bio: '',
    certificationDetails: '',
    specializations: [] as string[],
    languages: ['English'] as string[],
  });

  const toggleSpecialization = (spec: string) => {
    setForm(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const toggleLanguage = (lang: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/therapist-dashboard`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // Create professional profile (auto-verified for now)
      const { error: profileError } = await supabase
        .from('professionals')
        .insert({
          user_id: authData.user.id,
          full_name: form.fullName,
          title: form.title,
          bio: form.bio,
          certification_details: form.certificationDetails,
          specializations: form.specializations,
          languages: form.languages,
          status: 'verified',
          verified_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Add professional role
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'professional'
      });

      toast({
        title: "Welcome to Safe Space!",
        description: "Your professional account has been created.",
      });

      navigate('/therapist-dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 gradient-calm">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-safe-lavender mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Join as a Professional</h1>
          <p className="text-muted-foreground">
            Help youth by sharing your expertise and support
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-medium border border-border animate-slide-up">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium mb-4">Account Details</h2>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  className="rounded-xl"
                />
              </div>

              <Button type="button" variant="safe" className="w-full" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium mb-4">Professional Details</h2>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Dr. Jane Smith"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Licensed Clinical Psychologist"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (visible to users)</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell users about your experience and approach..."
                  className="rounded-xl min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cert">Certification Details</Label>
                <Input
                  id="cert"
                  value={form.certificationDetails}
                  onChange={e => setForm(prev => ({ ...prev, certificationDetails: e.target.value }))}
                  placeholder="License number, certifications..."
                  className="rounded-xl"
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button type="button" variant="safe" className="flex-1" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium mb-4">Specializations & Languages</h2>
              
              <div className="space-y-2">
                <Label>Areas of Expertise</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        form.specializations.includes(spec)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-safe-sage-light'
                      }`}
                    >
                      {form.specializations.includes(spec) && <Check className="w-3 h-3" />}
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        form.languages.includes(lang)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-safe-sage-light'
                      }`}
                    >
                      {form.languages.includes(lang) && <Check className="w-3 h-3" />}
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button type="submit" variant="safe" className="flex-1" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </Button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <a href="/auth" className="text-primary hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
