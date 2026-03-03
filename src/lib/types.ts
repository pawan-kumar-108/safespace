export interface User {
  id: string;
  email?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  emotion_tags: string[];
  ai_response: string | null;
  is_anonymous: boolean;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  note: string | null;
  created_at: string;
}

export interface ConnectPost {
  id: string;
  user_id: string;
  content: string;
  topic: string;
  is_professional: boolean;
  likes_count: number;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_professional: boolean;
  created_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  content: StoryContent;
  category: string;
  author_id: string | null;
  is_professional_content: boolean;
  created_at: string;
}

export interface StoryContent {
  scenes: StoryScene[];
}

export interface StoryScene {
  id: string;
  text: string;
  choices?: StoryChoice[];
  reflection?: string;
  isEnding?: boolean;
}

export interface StoryChoice {
  text: string;
  nextSceneId: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Professional {
  id: string;
  user_id: string;
  full_name: string;
  title: string;
  specializations: string[];
  languages: string[];
  bio: string | null;
  certification_details: string | null;
  status: 'pending' | 'verified' | 'rejected';
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Topic = 
  | 'anxiety'
  | 'loneliness'
  | 'academics'
  | 'family'
  | 'relationships'
  | 'self-esteem'
  | 'general';

export const TOPICS: { value: Topic; label: string; emoji: string }[] = [
  { value: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { value: 'loneliness', label: 'Loneliness', emoji: '🌙' },
  { value: 'academics', label: 'Academics', emoji: '📚' },
  { value: 'family', label: 'Family', emoji: '🏠' },
  { value: 'relationships', label: 'Relationships', emoji: '💕' },
  { value: 'self-esteem', label: 'Self-Esteem', emoji: '🪞' },
  { value: 'general', label: 'General', emoji: '💭' },
];

export const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🥰', label: 'Loved', value: 'loved' },
];

export const EMOTION_TAGS = [
  'hopeful', 'overwhelmed', 'grateful', 'confused', 
  'peaceful', 'worried', 'proud', 'lonely',
  'excited', 'frustrated', 'content', 'scared'
];
