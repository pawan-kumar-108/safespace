import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Shield, MessageCircle, Loader2, ArrowLeft, Send, Users } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  user_id: string;
  display_name: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Profile {
  user_id: string;
  display_name: string | null;
}

export default function TherapistConversations() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('therapist-conversations')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.recipient_id === user.id || newMsg.sender_id === user.id) {
          loadConversations();
          if (selectedUserId && (newMsg.sender_id === selectedUserId || newMsg.recipient_id === selectedUserId)) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;

    // Get all messages where therapist is recipient or sender
    const { data: msgData } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!msgData) {
      setLoading(false);
      return;
    }

    // Group by user
    const userMap = new Map<string, { messages: Message[] }>();
    
    msgData.forEach((msg: Message) => {
      const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      if (!userMap.has(otherUserId)) {
        userMap.set(otherUserId, { messages: [] });
      }
      userMap.get(otherUserId)!.messages.push(msg);
    });

    // Load user profiles
    const userIds = Array.from(userMap.keys());
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    const profileMap = new Map<string, Profile>();
    (profiles || []).forEach((p: Profile) => profileMap.set(p.user_id, p));

    // Build conversations list
    const convs: Conversation[] = [];
    userMap.forEach((data, oderId) => {
      const msgs = data.messages.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const unreadCount = msgs.filter(m => m.recipient_id === user.id && !m.is_read).length;
      const profile = profileMap.get(oderId);
      
      convs.push({
        user_id: oderId,
        display_name: profile?.display_name || 'Anonymous User',
        last_message: msgs[0].content,
        last_message_time: msgs[0].created_at,
        unread_count: unreadCount,
      });
    });

    // Sort by most recent
    convs.sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
    
    setConversations(convs);
    setLoading(false);
  };

  const loadMessages = async (otherUserId: string) => {
    if (!user) return;

    const { data: msgData } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    setMessages((msgData as Message[]) || []);

    // Mark messages as read
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('sender_id', otherUserId)
      .eq('recipient_id', user.id);
    
    loadConversations();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedUserId) return;
    setSending(true);

    const { error } = await supabase.from('direct_messages').insert({
      sender_id: user.id,
      recipient_id: selectedUserId,
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

  return (
    <div className="container mx-auto px-4 py-4 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/therapist-dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-safe-lavender flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground">Chat with your clients</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Conversations ({conversations.length})
            </h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {conversations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No conversations yet</p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.user_id}
                  onClick={() => setSelectedUserId(conv.user_id)}
                  className={`w-full p-4 text-left border-b border-border hover:bg-muted/50 transition-colors ${
                    selectedUserId === conv.user_id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{conv.display_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(conv.last_message_time).toLocaleDateString()}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border flex flex-col overflow-hidden">
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-safe-sage-light flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <span className="font-medium">
                  {conversations.find(c => c.user_id === selectedUserId)?.display_name || 'User'}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                          msg.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
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
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="min-h-[44px] max-h-32 resize-none"
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}