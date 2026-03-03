import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ConnectPost, PostComment, TOPICS, Topic } from '@/lib/types';
import { Users, Heart, MessageCircle, Send, Loader2, Shield } from 'lucide-react';

export default function Connect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<Topic>('general');
  const [posts, setPosts] = useState<ConnectPost[]>([]);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadPosts();
    if (user) loadUserLikes();
  }, [selectedTopic, user]);

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('connect-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connect_posts' }, () => {
        loadPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => {
        if (expandedPost) loadComments(expandedPost);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTopic, expandedPost]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('connect_posts')
        .select('*')
        .eq('topic', selectedTopic)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setPosts((data as ConnectPost[]) || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserLikes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserLikes(new Set(data?.map(l => l.post_id) || []));
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [postId]: (data as PostComment[]) || [] }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || posting) return;

    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to share.", variant: "destructive" });
      return;
    }

    setPosting(true);
    try {
      const { error } = await supabase
        .from('connect_posts')
        .insert({ user_id: user.id, content: newPost.trim(), topic: selectedTopic });

      if (error) throw error;
      setNewPost('');
      toast({ title: "Shared", description: "Your thoughts have been shared anonymously." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to share. Please try again.", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    const hasLiked = userLikes.has(postId);

    try {
      if (hasLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
        setUserLikes(prev => { const n = new Set(prev); n.delete(postId); return n; });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p));
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
        setUserLikes(prev => new Set([...prev, postId]));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    try {
      await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, content });
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      loadComments(postId);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" });
    }
  };

  const handleExpandPost = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      loadComments(postId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-safe-lavender mx-auto mb-4 flex items-center justify-center">
          <Users className="w-8 h-8 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Connect</h1>
        <p className="text-muted-foreground">
          Anonymous peer support. You're not alone.
        </p>
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center animate-slide-up">
        {TOPICS.map(topic => (
          <button
            key={topic.value}
            onClick={() => setSelectedTopic(topic.value)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selectedTopic === topic.value
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            {topic.emoji} {topic.label}
          </button>
        ))}
      </div>

      {/* New Post */}
      <div className="bg-card rounded-2xl p-4 border border-border mb-6 shadow-soft">
        <Textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share what's on your mind... (anonymous)"
          className="min-h-[80px] resize-none border-0 focus-visible:ring-0 bg-transparent"
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">{newPost.length}/500</span>
          <Button variant="safe" size="sm" onClick={createPost} disabled={!newPost.trim() || posting}>
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Share <Send className="w-3 h-3 ml-1" /></>}
          </Button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts in this space yet. Be the first to share.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-card rounded-2xl p-4 border border-border">
              {post.is_professional && (
                <div className="flex items-center gap-1 text-xs text-primary mb-2">
                  <Shield className="w-3 h-3" />
                  <span>Verified Professional</span>
                </div>
              )}
              
              <p className="text-foreground whitespace-pre-wrap mb-3">{post.content}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      userLikes.has(post.id) ? 'text-safe-coral' : 'text-muted-foreground hover:text-safe-coral'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${userLikes.has(post.id) ? 'fill-current' : ''}`} />
                    {post.likes_count > 0 && post.likes_count}
                  </button>
                  
                  <button
                    onClick={() => handleExpandPost(post.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {comments[post.id]?.length || 0}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  {comments[post.id]?.map(comment => (
                    <div key={comment.id} className="flex gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {comment.is_professional ? (
                          <Shield className="w-3 h-3 text-primary" />
                        ) : (
                          <span className="text-xs">👤</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{comment.content}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Add a supportive comment..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                    />
                    <Button variant="safe" size="icon" onClick={() => addComment(post.id)}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
