import { useState } from 'react';
import { BookHeart, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stories = [
  { id: '1', title: 'The Weight of Expectations', category: 'Academic Pressure', description: 'Navigating parental expectations while finding your own path.', scenes: [
    { id: 'start', text: 'Your parents expect straight A\'s. Your latest test came back with a B-. Your heart sinks as you walk home.', choices: [{ text: 'Hide the test', nextSceneId: 'hide' }, { text: 'Tell them honestly', nextSceneId: 'honest' }] },
    { id: 'hide', text: 'You stuff it in your bag. But the anxiety grows each day. What if they find out?', choices: [{ text: 'Keep hiding it', nextSceneId: 'anxiety' }, { text: 'Come clean', nextSceneId: 'relief' }] },
    { id: 'honest', text: 'Your mom looks disappointed but listens. "What happened?" she asks, genuinely curious.', choices: [{ text: 'Explain your struggles', nextSceneId: 'understood' }] },
    { id: 'anxiety', text: 'The secret weighs on you. You realize hiding creates more stress than the grade itself.', reflection: 'Hiding difficult truths often increases anxiety. Opening up, though scary, usually brings relief.', isEnding: true },
    { id: 'relief', text: 'Coming clean feels like a weight lifted. Your parents are disappointed but appreciate your honesty.', reflection: 'Courage to be honest builds trust and reduces the burden of secrets.', isEnding: true },
    { id: 'understood', text: '"I\'ve been stressed," you admit. Your mom shares she felt similar pressure at your age. You feel less alone.', reflection: 'Opening up can reveal unexpected connections. Adults often understand more than we expect.', isEnding: true },
  ]},
  { id: '2', title: 'The New School', category: 'Loneliness', description: 'Finding connection after moving to a new place.', scenes: [
    { id: 'start', text: 'Week three at your new school. Lunch is the hardest - sitting alone while everyone else has their groups.', choices: [{ text: 'Put on headphones', nextSceneId: 'headphones' }, { text: 'Look for someone else alone', nextSceneId: 'reach' }] },
    { id: 'headphones', text: 'Music helps, but you notice another student glancing at you. They look just as lonely.', choices: [{ text: 'Keep to yourself', nextSceneId: 'alone' }, { text: 'Smile at them', nextSceneId: 'smile' }] },
    { id: 'reach', text: 'You spot someone reading alone. "What are you reading?" you ask nervously.', choices: [{ text: 'Wait for their response', nextSceneId: 'friend' }] },
    { id: 'alone', text: 'Days pass. The loneliness deepens. You realize walls keep pain out but also keep connection out.', reflection: 'Protection mechanisms like isolation can backfire. Small risks in reaching out often pay off.', isEnding: true },
    { id: 'smile', text: 'They smile back and wave you over. "Mind if I sit with you tomorrow?"', reflection: 'A simple smile can open doors. Others often feel just as nervous about connecting.', isEnding: true },
    { id: 'friend', text: 'Their eyes light up. Turns out you like the same author. You finally have someone to sit with.', reflection: 'Taking small social risks, like starting a conversation, can change everything.', isEnding: true },
  ]},
  { id: '3', title: 'Speaking Up at Home', category: 'Family Dynamics', description: 'Expressing emotions in a household where feelings aren\'t discussed.', scenes: [
    { id: 'start', text: 'Your family doesn\'t talk about feelings. "We deal with problems, not emotions," your dad says. But you\'re struggling.', choices: [{ text: 'Keep it inside', nextSceneId: 'inside' }, { text: 'Write a letter', nextSceneId: 'letter' }] },
    { id: 'inside', text: 'The pressure builds. You snap at your sibling. Everyone asks what\'s wrong with you.', choices: [{ text: 'Storm off', nextSceneId: 'storm' }, { text: 'Use this moment', nextSceneId: 'moment' }] },
    { id: 'letter', text: 'You write everything down and leave it for your mom. The next day, she knocks on your door quietly.', choices: [{ text: 'Open the door', nextSceneId: 'open' }] },
    { id: 'storm', text: 'Alone in your room, you cry. The emotions needed somewhere to go. Maybe next time you can find a better outlet.', reflection: 'Suppressed emotions often come out sideways. Finding healthy outlets is essential.', isEnding: true },
    { id: 'moment', text: '"I\'m not okay," you say quietly. The room goes silent. Then your mom sits beside you.', reflection: 'Crisis moments can become opportunities for breakthrough if we stay present.', isEnding: true },
    { id: 'open', text: '"I didn\'t know you felt this way," she says softly. It\'s the beginning of a new kind of conversation.', reflection: 'Writing can be a bridge when speaking feels impossible. New patterns can start small.', isEnding: true },
  ]},
  { id: '4', title: 'The Perfect Feed', category: 'Social Media & Self-Image', description: 'When comparison steals your joy.', scenes: [
    { id: 'start', text: 'You scroll through perfect photos - perfect bodies, perfect lives. You feel small and inadequate.', choices: [{ text: 'Keep scrolling', nextSceneId: 'scroll' }, { text: 'Put the phone down', nextSceneId: 'put' }] },
    { id: 'scroll', text: 'Hours pass. You feel worse. You post a filtered photo of yourself, seeking validation.', choices: [{ text: 'Wait for likes', nextSceneId: 'wait' }, { text: 'Delete it', nextSceneId: 'delete' }] },
    { id: 'put', text: 'You go for a walk instead. The real world feels different - less polished but more real.', choices: [{ text: 'Keep walking', nextSceneId: 'walk' }] },
    { id: 'wait', text: 'The likes trickle in. It feels good for a moment, then empty. You realize you\'re chasing something that can\'t satisfy.', reflection: 'External validation is like junk food - temporarily satisfying but never nourishing.', isEnding: true },
    { id: 'delete', text: 'Deleting feels freeing. You don\'t need to perform for anyone. Your worth isn\'t measured in likes.', reflection: 'Opting out of comparison culture is an act of self-compassion.', isEnding: true },
    { id: 'walk', text: 'You notice flowers, feel the breeze. Real experiences beat curated ones. Your mood lifts.', reflection: 'Presence in the real world often heals what digital consumption wounds.', isEnding: true },
  ]},
  { id: '5', title: 'Asking for Help', category: 'Mental Health Stigma', description: 'When you realize you can\'t do it alone.', scenes: [
    { id: 'start', text: 'The dark thoughts have lasted weeks now. You know something\'s wrong, but asking for help feels like failure.', choices: [{ text: 'Try to push through', nextSceneId: 'push' }, { text: 'Tell someone', nextSceneId: 'tell' }] },
    { id: 'push', text: 'Another week passes. The weight gets heavier. You realize strength isn\'t about handling everything alone.', choices: [{ text: 'Keep trying alone', nextSceneId: 'alone' }, { text: 'Reach out', nextSceneId: 'reach' }] },
    { id: 'tell', text: 'You tell the school counselor. "Thank you for trusting me," they say. "That took courage."', choices: [{ text: 'Accept their help', nextSceneId: 'accept' }] },
    { id: 'alone', text: 'Isolation deepens the struggle. You finally realize: asking for help isn\'t weakness, suffering alone is just harder.', reflection: 'True strength includes knowing when to reach out. No one is meant to struggle alone.', isEnding: true },
    { id: 'reach', text: 'You text a trusted adult: "I need help." Their response is immediate and caring. Relief washes over you.', reflection: 'Reaching out is the first step toward healing. Help is often closer than we think.', isEnding: true },
    { id: 'accept', text: 'You start meeting weekly. For the first time in months, you feel hope. You\'re not broken - you\'re healing.', reflection: 'Professional support isn\'t a sign of failure. It\'s a pathway to growth and recovery.', isEnding: true },
  ]},
];

export default function Stories() {
  const [activeStory, setActiveStory] = useState<typeof stories[0] | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState('start');

  const currentScene = activeStory?.scenes.find(s => s.id === currentSceneId);

  const reset = () => { setActiveStory(null); setCurrentSceneId('start'); };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-safe-coral-light mx-auto mb-4 flex items-center justify-center">
          <BookHeart className="w-8 h-8 text-safe-coral" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Stories</h1>
        <p className="text-muted-foreground">Interactive narratives to explore and reflect</p>
      </div>

      {!activeStory ? (
        <div className="space-y-4">
          {stories.map((story, i) => (
            <button key={story.id} onClick={() => setActiveStory(story)} className="w-full text-left bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all shadow-soft animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <span className="text-xs text-primary font-medium">{story.category}</span>
              <h3 className="text-lg font-medium mt-1">{story.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{story.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-primary font-medium">{activeStory.category}</span>
            <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="w-4 h-4" /> Exit</Button>
          </div>
          
          <p className="text-lg mb-6">{currentScene?.text}</p>

          {currentScene?.isEnding ? (
            <div className="bg-safe-sage-light rounded-xl p-4 mt-4">
              <p className="text-sm font-medium text-safe-sage-dark mb-2">Reflection</p>
              <p className="text-sm text-foreground">{currentScene.reflection}</p>
              <Button variant="safe" className="mt-4" onClick={reset}>Explore More Stories</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {currentScene?.choices?.map((choice, i) => (
                <button key={i} onClick={() => setCurrentSceneId(choice.nextSceneId)} className="w-full text-left px-4 py-3 rounded-xl bg-muted hover:bg-safe-sage-light transition-colors text-sm flex justify-between items-center">
                  {choice.text} <ArrowRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
