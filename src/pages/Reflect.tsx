import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { JournalEntry, EMOTION_TAGS } from '@/lib/types';
import { PenLine, Loader2, Sparkles, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function Reflect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadEntries();
    } else {
      setLoadingEntries(false);
    }
  }, [user]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEntries((data as JournalEntry[]) || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoadingEntries(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const saveEntry = async () => {
    if (!content.trim() || loading) return;

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your reflections.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get AI response
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: content.trim() }],
          type: 'reflect'
        }),
      });

      let aiResponse = '';
      
      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const deltaContent = data.choices?.[0]?.delta?.content;
                if (deltaContent) {
                  aiResponse += deltaContent;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Save entry
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: content.trim(),
          emotion_tags: selectedTags,
          ai_response: aiResponse || null,
        })
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => [data as JournalEntry, ...prev]);
      setContent('');
      setSelectedTags([]);
      setExpandedEntry(data.id);

      toast({
        title: "Reflection saved",
        description: "Your thoughts have been safely stored.",
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save your reflection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries(prev => prev.filter(e => e.id !== id));
      toast({ title: "Entry deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" });
    }
  };

  const prompts = [
    "How are you feeling right now?",
    "What's weighing on your mind?",
    "What made you smile today?",
    "What are you grateful for?",
    "What would help you feel better?",
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-safe-sage-light mx-auto mb-4 flex items-center justify-center">
          <PenLine className="w-8 h-8 text-safe-sage" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Reflect</h1>
        <p className="text-muted-foreground">
          A private space to express your thoughts and feelings
        </p>
      </div>

      {/* Writing Area */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border mb-8 animate-slide-up">
        {/* Prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {prompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setContent(prompt + ' ')}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-safe-sage-light text-muted-foreground hover:text-foreground transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write freely... your thoughts are private and safe here."
          className="min-h-[150px] resize-none border-0 focus-visible:ring-0 text-base bg-transparent"
        />

        {/* Emotion Tags */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">How are you feeling? (optional)</p>
          <div className="flex flex-wrap gap-2">
            {EMOTION_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-safe-sage-light'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="safe"
            onClick={saveEntry}
            disabled={!content.trim() || loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Save & Reflect
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Past Entries */}
      {user && (
        <div>
          <h2 className="text-lg font-medium mb-4">Your Reflections</h2>
          
          {loadingEntries ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reflections yet. Start writing above to begin your journey.
            </p>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <div key={entry.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  {entry.emotion_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entry.emotion_tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.ai_response && (
                    <div>
                      <button
                        onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        {expandedEntry === entry.id ? 'Hide' : 'Show'} reflection
                        {expandedEntry === entry.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      
                      {expandedEntry === entry.id && (
                        <div className="mt-2 p-3 rounded-lg bg-safe-sage-light text-sm">
                          <p className="whitespace-pre-wrap">{entry.ai_response}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!user && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Sign in to save your reflections and track your emotional journey.
          </p>
          <Button variant="safe-outline" onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
}
