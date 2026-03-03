import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MoodEntry, MOODS } from '@/lib/types';
import { Sparkles, Wind, Target, Heart, Play, Pause, RotateCcw, ChevronRight, Stethoscope } from 'lucide-react';

interface TherapistExercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: string;
  icon: string;
}

export default function Wellness() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [therapistExercises, setTherapistExercises] = useState<TherapistExercise[]>([]);
  const [activeTherapistExercise, setActiveTherapistExercise] = useState<string | null>(null);

  useEffect(() => {
    loadTherapistExercises();
    if (user) loadMoodEntries();
  }, [user]);

  const loadTherapistExercises = async () => {
    const { data } = await supabase
      .from('wellness_exercises')
      .select('*')
      .order('created_at', { ascending: false });
    setTherapistExercises((data as TherapistExercise[]) || []);
  };

  const loadMoodEntries = async () => {
    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(7);
    setMoodEntries((data as MoodEntry[]) || []);
  };

  const saveMood = async (mood: string) => {
    if (!user) {
      toast({ title: "Sign in to track moods", variant: "destructive" });
      return;
    }

    await supabase.from('mood_entries').insert({ user_id: user.id, mood });
    loadMoodEntries();
    toast({ title: "Mood recorded", description: "Thanks for checking in with yourself." });
  };

  const exercises = [
    {
      id: 'breathing',
      title: 'Box Breathing',
      description: '4-4-4-4 breathing technique to calm your nervous system',
      icon: Wind,
      color: 'bg-safe-sky',
      iconColor: 'text-safe-sky-dark',
    },
    {
      id: 'grounding',
      title: '5-4-3-2-1 Grounding',
      description: 'Use your senses to anchor yourself in the present',
      icon: Target,
      color: 'bg-safe-sage-light',
      iconColor: 'text-safe-sage',
    },
    {
      id: 'gratitude',
      title: 'Gratitude Pause',
      description: 'Take a moment to appreciate three good things',
      icon: Heart,
      color: 'bg-safe-coral-light',
      iconColor: 'text-safe-coral',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-safe-sky mx-auto mb-4 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-safe-sky-dark" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Wellness</h1>
        <p className="text-muted-foreground">
          Simple tools for emotional regulation and self-care
        </p>
      </div>

      {/* Mood Check-in */}
      <div className="bg-card rounded-2xl p-6 border border-border mb-8 shadow-soft animate-slide-up">
        <h2 className="text-lg font-medium mb-4">How are you feeling?</h2>
        <div className="grid grid-cols-4 gap-3">
          {MOODS.map(mood => (
            <button
              key={mood.value}
              onClick={() => saveMood(mood.value)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs text-muted-foreground">{mood.label}</span>
            </button>
          ))}
        </div>

        {moodEntries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Recent check-ins:</p>
            <div className="flex gap-2 flex-wrap">
              {moodEntries.slice(0, 7).map(entry => (
                <span key={entry.id} className="text-xl" title={new Date(entry.created_at).toLocaleDateString()}>
                  {MOODS.find(m => m.value === entry.mood)?.emoji}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Built-in Exercises */}
      <h2 className="text-lg font-medium mb-4">Coping Toolkit</h2>
      <div className="space-y-4">
        {exercises.map((exercise, i) => (
          <div
            key={exercise.id}
            className="bg-card rounded-2xl p-4 border border-border shadow-soft animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${exercise.color} flex items-center justify-center`}>
                <exercise.icon className={`w-6 h-6 ${exercise.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{exercise.title}</h3>
                <p className="text-sm text-muted-foreground">{exercise.description}</p>
              </div>
              <Button
                variant={activeExercise === exercise.id ? 'safe' : 'safe-outline'}
                size="sm"
                onClick={() => setActiveExercise(activeExercise === exercise.id ? null : exercise.id)}
              >
                {activeExercise === exercise.id ? 'Close' : 'Start'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {activeExercise === exercise.id && (
              <div className="mt-4 pt-4 border-t border-border">
                {exercise.id === 'breathing' && <BreathingExercise />}
                {exercise.id === 'grounding' && <GroundingExercise />}
                {exercise.id === 'gratitude' && <GratitudeExercise />}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Therapist Exercises */}
      {therapistExercises.length > 0 && (
        <>
          <h2 className="text-lg font-medium mb-4 mt-8 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-safe-sage" />
            From Our Therapists
          </h2>
          <div className="space-y-4">
            {therapistExercises.map((exercise, i) => (
              <div
                key={exercise.id}
                className="bg-card rounded-2xl p-4 border border-border shadow-soft animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-safe-sage-light flex items-center justify-center">
                    <span className="text-2xl">{exercise.icon || '✨'}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{exercise.title}</h3>
                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                  </div>
                  <Button
                    variant={activeTherapistExercise === exercise.id ? 'safe' : 'safe-outline'}
                    size="sm"
                    onClick={() => setActiveTherapistExercise(activeTherapistExercise === exercise.id ? null : exercise.id)}
                  >
                    {activeTherapistExercise === exercise.id ? 'Close' : 'View'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {activeTherapistExercise === exercise.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-wrap">{exercise.instructions}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BreathingExercise() {
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhase(current => {
            if (current === 'inhale') return 'hold1';
            if (current === 'hold1') return 'exhale';
            if (current === 'exhale') return 'hold2';
            setCycles(c => c + 1);
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(4);
    setCycles(0);
  };

  const phaseLabels = {
    inhale: 'Breathe In',
    hold1: 'Hold',
    exhale: 'Breathe Out',
    hold2: 'Hold',
  };

  return (
    <div className="text-center">
      <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-1000 ${
        phase === 'inhale' ? 'scale-110 bg-safe-sky' : phase === 'exhale' ? 'scale-90 bg-safe-sage-light' : 'bg-safe-lavender'
      }`}>
        <div className="text-center">
          <p className="text-3xl font-light">{count}</p>
          <p className="text-sm text-muted-foreground">{phaseLabels[phase]}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-4">Cycles: {cycles}</p>

      <div className="flex justify-center gap-2 mt-4">
        <Button variant={isActive ? 'secondary' : 'safe'} size="sm" onClick={() => setIsActive(!isActive)}>
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function GroundingExercise() {
  const [step, setStep] = useState(0);
  const steps = [
    { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see' },
    { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can touch' },
    { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear' },
    { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell' },
    { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste' },
  ];

  return (
    <div className="text-center">
      {step < 5 ? (
        <>
          <div className="w-20 h-20 mx-auto rounded-full bg-safe-sage-light flex items-center justify-center mb-4">
            <span className="text-3xl font-light text-safe-sage">{steps[step].count}</span>
          </div>
          <p className="text-lg font-medium mb-2">{steps[step].sense}</p>
          <p className="text-muted-foreground mb-4">{steps[step].prompt}</p>
          <Button variant="safe" onClick={() => setStep(step + 1)}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <>
          <div className="w-20 h-20 mx-auto rounded-full bg-safe-sage-light flex items-center justify-center mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-lg font-medium mb-2">Well done!</p>
          <p className="text-muted-foreground mb-4">You've reconnected with the present moment.</p>
          <Button variant="safe-outline" onClick={() => setStep(0)}>
            <RotateCcw className="w-4 h-4" /> Restart
          </Button>
        </>
      )}
    </div>
  );
}

function GratitudeExercise() {
  const [items, setItems] = useState(['', '', '']);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (items.filter(i => i.trim()).length >= 1) {
      setSubmitted(true);
    }
  };

  return (
    <div className="text-center">
      {!submitted ? (
        <>
          <p className="text-muted-foreground mb-4">What are three things you're grateful for today?</p>
          <div className="space-y-2 max-w-sm mx-auto text-left">
            {items.map((item, i) => (
              <input
                key={i}
                type="text"
                value={item}
                onChange={(e) => setItems(prev => prev.map((p, idx) => idx === i ? e.target.value : p))}
                placeholder={`${i + 1}. I'm grateful for...`}
                className="w-full px-4 py-2 rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            ))}
          </div>
          <Button variant="safe" className="mt-4" onClick={handleSubmit}>
            <Heart className="w-4 h-4" /> Done
          </Button>
        </>
      ) : (
        <>
          <div className="w-20 h-20 mx-auto rounded-full bg-safe-coral-light flex items-center justify-center mb-4">
            <span className="text-3xl">💝</span>
          </div>
          <p className="text-lg font-medium mb-2">Beautiful!</p>
          <p className="text-muted-foreground mb-4">Gratitude shifts our focus to what's good in our lives.</p>
          <Button variant="safe-outline" onClick={() => { setItems(['', '', '']); setSubmitted(false); }}>
            <RotateCcw className="w-4 h-4" /> Again
          </Button>
        </>
      )}
    </div>
  );
}
