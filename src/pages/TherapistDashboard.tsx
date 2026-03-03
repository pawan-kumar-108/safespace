import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Professional } from '@/lib/types';
import { 
  Shield, Plus, Sparkles, BookHeart, MessageCircle, Loader2, 
  Trash2, X, BookOpen, ChevronRight, LayoutDashboard 
} from 'lucide-react';

interface WellnessExercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: string;
  icon: string;
  author_id: string;
  created_at: string;
}

interface Story {
  id: string;
  title: string;
  description: string;
  category: string;
  content: any;
  author_id: string;
  is_professional_content: boolean;
  created_at: string;
}

interface LearningArticle {
  id: string;
  title: string;
  emoji: string;
  content: string;
  author_id: string;
  created_at: string;
}

interface DashboardStats {
  exercises: number;
  stories: number;
  articles: number;
  unreadMessages: number;
}

export default function TherapistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Professional | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ exercises: 0, stories: 0, articles: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'exercises' | 'stories' | 'learn' | null>('overview');

  // Content state
  const [exercises, setExercises] = useState<WellnessExercise[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [articles, setArticles] = useState<LearningArticle[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Load professional profile
    const { data: profData } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profData) {
      toast({ title: "Not authorized", description: "You need a professional account.", variant: "destructive" });
      navigate('/');
      return;
    }

    setProfile(profData as Professional);

    // Load all content in parallel
    const [exData, stData, artData, msgData] = await Promise.all([
      supabase.from('wellness_exercises').select('*').eq('author_id', user.id).order('created_at', { ascending: false }),
      supabase.from('stories').select('*').eq('author_id', user.id).order('created_at', { ascending: false }),
      supabase.from('learning_articles').select('*').eq('author_id', user.id).order('created_at', { ascending: false }),
      supabase.from('direct_messages').select('id, is_read').eq('recipient_id', user.id).eq('is_read', false),
    ]);

    setExercises((exData.data as WellnessExercise[]) || []);
    setStories((stData.data as Story[]) || []);
    setArticles((artData.data as LearningArticle[]) || []);
    
    setStats({
      exercises: exData.data?.length || 0,
      stories: stData.data?.length || 0,
      articles: artData.data?.length || 0,
      unreadMessages: msgData.data?.length || 0,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-safe-sage to-safe-sage-light flex items-center justify-center shadow-soft">
            <Shield className="w-7 h-7 text-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{profile?.full_name}</h1>
            <p className="text-muted-foreground">{profile?.title}</p>
          </div>
        </div>
        <Link to="/therapist-conversations">
          <Button variant="safe" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Messages
            {stats.unreadMessages > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primary-foreground/20 rounded-full text-xs">
                {stats.unreadMessages}
              </span>
            )}
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Exercises" 
          value={stats.exercises} 
          icon={Sparkles} 
          color="bg-safe-sky" 
          onClick={() => setActiveSection('exercises')}
          active={activeSection === 'exercises'}
        />
        <StatCard 
          title="Stories" 
          value={stats.stories} 
          icon={BookHeart} 
          color="bg-safe-coral-light" 
          onClick={() => setActiveSection('stories')}
          active={activeSection === 'stories'}
        />
        <StatCard 
          title="Articles" 
          value={stats.articles} 
          icon={BookOpen} 
          color="bg-safe-warm" 
          onClick={() => setActiveSection('learn')}
          active={activeSection === 'learn'}
        />
        <StatCard 
          title="Messages" 
          value={stats.unreadMessages} 
          icon={MessageCircle} 
          color="bg-safe-lavender" 
          onClick={() => navigate('/therapist-conversations')}
          badge={stats.unreadMessages > 0 ? 'new' : undefined}
        />
      </div>

      {/* Content Section */}
      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/30">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'overview' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveSection('exercises')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'exercises' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Exercises
          </button>
          <button
            onClick={() => setActiveSection('stories')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'stories' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
          >
            <BookHeart className="w-4 h-4 inline mr-2" />
            Stories
          </button>
          <button
            onClick={() => setActiveSection('learn')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'learn' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Learn
          </button>
        </div>

        {/* Section Content */}
        <div className="p-6">
          {activeSection === 'overview' && (
            <OverviewSection 
              exercises={exercises} 
              stories={stories} 
              articles={articles} 
              onNavigate={setActiveSection} 
            />
          )}
          {activeSection === 'exercises' && (
            <ExercisesSection 
              exercises={exercises} 
              userId={user?.id || ''} 
              onRefresh={loadData} 
            />
          )}
          {activeSection === 'stories' && (
            <StoriesSection 
              stories={stories} 
              userId={user?.id || ''} 
              onRefresh={loadData} 
            />
          )}
          {activeSection === 'learn' && (
            <LearnSection 
              articles={articles} 
              userId={user?.id || ''} 
              onRefresh={loadData} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, onClick, active, badge }: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string; 
  onClick?: () => void;
  active?: boolean;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-card rounded-2xl p-5 border shadow-soft text-left transition-all hover:shadow-medium ${
        active ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full uppercase font-medium">
            {badge}
          </span>
        )}
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </button>
  );
}

function OverviewSection({ exercises, stories, articles, onNavigate }: {
  exercises: WellnessExercise[];
  stories: Story[];
  articles: LearningArticle[];
  onNavigate: (section: 'exercises' | 'stories' | 'learn') => void;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="font-medium mb-3 flex items-center justify-between">
          Recent Exercises
          <Button variant="ghost" size="sm" onClick={() => onNavigate('exercises')}>
            View all <ChevronRight className="w-4 h-4" />
          </Button>
        </h3>
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exercises yet. Create your first one!</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            {exercises.slice(0, 3).map(ex => (
              <div key={ex.id} className="bg-muted/50 rounded-xl p-4">
                <span className="text-2xl">{ex.icon}</span>
                <h4 className="font-medium mt-2 text-sm">{ex.title}</h4>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-medium mb-3 flex items-center justify-between">
          Recent Stories
          <Button variant="ghost" size="sm" onClick={() => onNavigate('stories')}>
            View all <ChevronRight className="w-4 h-4" />
          </Button>
        </h3>
        {stories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stories yet. Share your first one!</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            {stories.slice(0, 3).map(story => (
              <div key={story.id} className="bg-muted/50 rounded-xl p-4">
                <span className="text-xs text-primary">{story.category}</span>
                <h4 className="font-medium text-sm">{story.title}</h4>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-medium mb-3 flex items-center justify-between">
          Recent Articles
          <Button variant="ghost" size="sm" onClick={() => onNavigate('learn')}>
            View all <ChevronRight className="w-4 h-4" />
          </Button>
        </h3>
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No articles yet. Write your first one!</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            {articles.slice(0, 3).map(article => (
              <div key={article.id} className="bg-muted/50 rounded-xl p-4">
                <span className="text-2xl">{article.emoji}</span>
                <h4 className="font-medium mt-2 text-sm">{article.title}</h4>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExercisesSection({ exercises, userId, onRefresh }: { 
  exercises: WellnessExercise[]; 
  userId: string; 
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', instructions: '', category: 'breathing', icon: '🌬️' });
  const [saving, setSaving] = useState(false);

  const ICONS = ['🌬️', '🧘', '💭', '🎯', '💚', '🌊', '🌸', '✨', '🌿', '🦋'];
  const CATEGORIES = ['breathing', 'grounding', 'mindfulness', 'gratitude', 'relaxation', 'body-scan', 'visualization'];

  const saveExercise = async () => {
    if (!form.title || !form.description || !form.instructions) return;
    setSaving(true);

    const { error } = await supabase.from('wellness_exercises').insert({
      author_id: userId,
      title: form.title,
      description: form.description,
      instructions: form.instructions,
      category: form.category,
      icon: form.icon,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save exercise.", variant: "destructive" });
    } else {
      toast({ title: "Exercise created!" });
      setForm({ title: '', description: '', instructions: '', category: 'breathing', icon: '🌬️' });
      setShowForm(false);
      onRefresh();
    }
    setSaving(false);
  };

  const deleteExercise = async (id: string) => {
    await supabase.from('wellness_exercises').delete().eq('id', id);
    toast({ title: "Exercise deleted" });
    onRefresh();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium">Wellness Exercises</h2>
          <p className="text-sm text-muted-foreground">Create exercises for users to practice</p>
        </div>
        <Button variant="safe" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'New Exercise'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/50 rounded-xl p-6 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Exercise name" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-background border border-border">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the exercise" />
          </div>
          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} placeholder="Step-by-step instructions..." className="min-h-[120px]" />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(i => (
                <button key={i} type="button" onClick={() => setForm(p => ({ ...p, icon: i }))} className={`text-2xl p-2 rounded-lg transition-colors ${form.icon === i ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{i}</button>
              ))}
            </div>
          </div>
          <Button variant="safe" onClick={saveExercise} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Save Exercise
          </Button>
        </div>
      )}

      {exercises.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No exercises yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map(ex => (
            <div key={ex.id} className="bg-muted/30 rounded-xl p-4 relative group hover:bg-muted/50 transition-colors">
              <button onClick={() => deleteExercise(ex.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
              <span className="text-3xl">{ex.icon}</span>
              <h3 className="font-medium mt-3">{ex.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{ex.description}</p>
              <span className="text-xs text-primary mt-2 block">{ex.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoriesSection({ stories, userId, onRefresh }: { 
  stories: Story[]; 
  userId: string; 
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Mental Health', firstScene: '' });
  const [saving, setSaving] = useState(false);

  const saveStory = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);

    const content = {
      scenes: [
        { 
          id: 'start', 
          text: form.firstScene || 'This is the beginning of your story. The narrative unfolds here...', 
          choices: [{ text: 'Continue', nextSceneId: 'end' }] 
        },
        { 
          id: 'end', 
          text: 'Thank you for reading this story.', 
          reflection: 'What did this story make you think about?', 
          isEnding: true 
        }
      ]
    };

    const { error } = await supabase.from('stories').insert({
      author_id: userId,
      title: form.title,
      description: form.description,
      category: form.category,
      content,
      is_professional_content: true,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save story.", variant: "destructive" });
    } else {
      toast({ title: "Story created!" });
      setForm({ title: '', description: '', category: 'Mental Health', firstScene: '' });
      setShowForm(false);
      onRefresh();
    }
    setSaving(false);
  };

  const deleteStory = async (id: string) => {
    await supabase.from('stories').delete().eq('id', id);
    toast({ title: "Story deleted" });
    onRefresh();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium">Interactive Stories</h2>
          <p className="text-sm text-muted-foreground">Create therapeutic narratives for users</p>
        </div>
        <Button variant="safe" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'New Story'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/50 rounded-xl p-6 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Story title" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g., Anxiety, Family, Self-Care" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What is this story about?" />
          </div>
          <div className="space-y-2">
            <Label>Opening Scene</Label>
            <Textarea value={form.firstScene} onChange={e => setForm(p => ({ ...p, firstScene: e.target.value }))} placeholder="Write the opening of your story..." className="min-h-[100px]" />
          </div>
          <Button variant="safe" onClick={saveStory} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Save Story
          </Button>
        </div>
      )}

      {stories.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <BookHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No stories yet. Share your first one!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {stories.map(story => (
            <div key={story.id} className="bg-muted/30 rounded-xl p-4 relative group hover:bg-muted/50 transition-colors">
              <button onClick={() => deleteStory(story.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
              <span className="text-xs text-primary font-medium">{story.category}</span>
              <h3 className="font-medium mt-1">{story.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{story.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LearnSection({ articles, userId, onRefresh }: { 
  articles: LearningArticle[]; 
  userId: string; 
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', emoji: '📖', content: '' });
  const [saving, setSaving] = useState(false);

  const EMOJIS = ['📖', '💭', '🧠', '💚', '🌱', '🎭', '⚡', '🤝', '🏔️', '🦋', '🌈', '🔮'];

  const saveArticle = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);

    const { error } = await supabase.from('learning_articles').insert({
      author_id: userId,
      title: form.title,
      emoji: form.emoji,
      content: form.content,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save article.", variant: "destructive" });
    } else {
      toast({ title: "Article created!" });
      setForm({ title: '', emoji: '📖', content: '' });
      setShowForm(false);
      onRefresh();
    }
    setSaving(false);
  };

  const deleteArticle = async (id: string) => {
    await supabase.from('learning_articles').delete().eq('id', id);
    toast({ title: "Article deleted" });
    onRefresh();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium">Learning Articles</h2>
          <p className="text-sm text-muted-foreground">Write educational content for users</p>
        </div>
        <Button variant="safe" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'New Article'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-muted/50 rounded-xl p-6 mb-6 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Article title" />
          </div>
          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setForm(p => ({ ...p, emoji: e }))} className={`text-2xl p-2 rounded-lg transition-colors ${form.emoji === e ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{e}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your educational content here..." className="min-h-[150px]" />
          </div>
          <Button variant="safe" onClick={saveArticle} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Save Article
          </Button>
        </div>
      )}

      {articles.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No articles yet. Write your first one!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {articles.map(article => (
            <div key={article.id} className="bg-muted/30 rounded-xl p-4 relative group hover:bg-muted/50 transition-colors">
              <button onClick={() => deleteArticle(article.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
              <span className="text-3xl">{article.emoji}</span>
              <h3 className="font-medium mt-3">{article.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}