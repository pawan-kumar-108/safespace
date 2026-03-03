import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Stethoscope } from 'lucide-react';

interface LearningArticle {
  id: string;
  title: string;
  emoji: string;
  content: string;
  author_id: string;
  created_at: string;
}

const builtInCards = [
  { title: 'Understanding Emotions', emoji: '🎭', content: "Emotions are natural responses to life. They're not 'good' or 'bad' - they're information about what matters to you." },
  { title: 'Stress vs Anxiety', emoji: '⚡', content: 'Stress is a response to a specific situation. Anxiety is worry about what might happen. Both are manageable with the right tools.' },
  { title: 'Healthy Coping', emoji: '🌱', content: 'Healthy coping helps you process feelings. Unhealthy coping (like avoidance) offers short-term relief but long-term problems.' },
  { title: 'When to Seek Help', emoji: '🤝', content: 'If feelings interfere with daily life for weeks, or you have thoughts of self-harm, reach out to a trusted adult or professional.' },
  { title: 'Self-Compassion', emoji: '💚', content: 'Treat yourself like you would a good friend. Mistakes are part of being human. Be gentle with yourself.' },
  { title: 'Building Resilience', emoji: '🏔️', content: 'Resilience isn\'t about not feeling pain. It\'s about having tools and support to navigate difficult times.' },
];

export default function Learn() {
  const [therapistArticles, setTherapistArticles] = useState<LearningArticle[]>([]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const { data } = await supabase
      .from('learning_articles')
      .select('*')
      .order('created_at', { ascending: false });
    setTherapistArticles((data as LearningArticle[]) || []);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-safe-warm mx-auto mb-4 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-foreground" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Learn</h1>
        <p className="text-muted-foreground">Youth-friendly mental health education</p>
      </div>

      {/* Built-in Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {builtInCards.map((card, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-soft animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <span className="text-3xl mb-3 block">{card.emoji}</span>
            <h3 className="text-lg font-medium mb-2">{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.content}</p>
          </div>
        ))}
      </div>

      {/* Therapist Articles */}
      {therapistArticles.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4 mt-10">
            <Stethoscope className="w-5 h-5 text-safe-sage" />
            <h2 className="text-lg font-medium">From Our Therapists</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {therapistArticles.map((article, i) => (
              <div key={article.id} className="bg-card rounded-2xl p-6 border border-border shadow-soft animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="text-3xl mb-3 block">{article.emoji}</span>
                <h3 className="text-lg font-medium mb-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground">{article.content}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}