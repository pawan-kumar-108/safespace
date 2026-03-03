import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Professional } from '@/lib/types';
import { Shield, MessageCircle, Loader2, ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function TherapistChat() {
  const { therapistId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [therapist, setTherapist] = useState<Professional | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();

    // Subscribe to new messages
    const channel = supabase
      .channel('therapist-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === user.id && newMsg.recipient_id === therapistId) ||
          (newMsg.sender_id === therapistId && newMsg.recipient_id === user.id)
        ) {
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, therapistId]);

  const loadData = async () => {
    if (!therapistId) return;

    // Load therapist profile
    const { data: profData } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', therapistId)
      .single();

    setTherapist(profData as Professional);

    // Load conversation
    const { data: msgData } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${therapistId}),and(sender_id.eq.${therapistId},recipient_id.eq.${user?.id})`)
      .order('created_at', { ascending: true });

    setMessages((msgData as Message[]) || []);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !therapistId) return;
    setSending(true);

    const { error } = await supabase.from('direct_messages').insert({
      sender_id: user.id,
      recipient_id: therapistId,
      content: newMessage.trim(),
    });

    if (error) {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Therapist not found.</p>
        <Button variant="safe-outline" onClick={() => navigate('/professionals')} className="mt-4">
          Back to Professionals
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-2xl h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/professionals')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-safe-lavender flex items-center justify-center">
          <Shield className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="font-medium">{therapist.full_name}</h2>
          <p className="text-xs text-muted-foreground">{therapist.title}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Start a conversation with {therapist.full_name}</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="text-[10px] opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="bg-card rounded-2xl border border-border p-3">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-32 resize-none border-0 focus-visible:ring-0 bg-transparent"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button variant="safe" size="icon" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
