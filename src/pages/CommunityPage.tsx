// Week 66-68: Community Platform Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { SEO } from '@/components/SEO';

interface Post {
  id: string;
  author: string;
  avatar: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  timeAgo: string;
  tags: string[];
  isAnswered?: boolean;
}

const POSTS: Post[] = [
  {
    id: 'p1', author: 'Rahul M.', avatar: '👨', category: 'Question',
    title: 'What does Saturn in 7th house mean for marriage?',
    content: 'I have Saturn in 7th house in Capricorn. My astrologer said it will delay marriage. Can someone explain the effects and remedies?',
    likes: 24, replies: 8, timeAgo: '2 hours ago',
    tags: ['Saturn', '7th House', 'Marriage', 'Remedies'],
    isAnswered: true,
  },
  {
    id: 'p2', author: 'Priya S.', avatar: '👩', category: 'Discussion',
    title: 'Jupiter transit 2026 - Effects on different signs',
    content: 'Jupiter is transiting Gemini in 2026. Let\'s discuss how this affects each rising sign. I\'m Scorpio rising and feeling the 8th house effects...',
    likes: 45, replies: 23, timeAgo: '5 hours ago',
    tags: ['Jupiter', 'Transit', '2026', 'Gemini'],
  },
  {
    id: 'p3', author: 'Amit K.', avatar: '🧑', category: 'Chart Reading',
    title: 'Please help interpret my birth chart - Kaal Sarp Yoga',
    content: 'I have all planets between Rahu and Ketu. Born 15 March 1990, 6:30 AM, Delhi. Is this Kaal Sarp Yoga? What are the effects?',
    likes: 12, replies: 5, timeAgo: '1 day ago',
    tags: ['Kaal Sarp', 'Chart Reading', 'Rahu', 'Ketu']
,
  },
  {
    id: 'p4', author: 'Sunita R.', avatar: '👩‍🦱', category: 'Remedies',
    title: 'Best gemstones for Rahu Mahadasha - My experience',
    content: 'Currently in Rahu Mahadasha for 3 years. Tried Hessonite Garnet and it has helped significantly. Sharing my experience and what worked for me.',
    likes: 67, replies: 31, timeAgo: '2 days ago',
    tags: ['Rahu', 'Mahadasha', 'Gemstone', 'Hessonite'],
  },
  {
    id: 'p5', author: 'Vikram P.', avatar: '👨‍💼', category: 'Learning',
    title: 'How to read Navamsa (D9) chart for marriage predictions',
    content: 'I\'ve been studying Navamsa for 2 years. Here\'s my simplified guide to reading D9 for marriage timing and spouse characteristics...',
    likes: 89, replies: 42, timeAgo: '3 days ago',
    tags: ['Navamsa', 'D9', 'Marriage', 'Learning'],
  },
  {
    id: 'p6', author: 'Deepa N.', avatar: '👩‍🎓', category: 'Question',
    title: 'Sade Sati starting - How to prepare?',
    content: 'Saturn is about to enter my Moon sign (Aquarius). Sade Sati starting in 6 months. What should I do to prepare? Any experiences to share?',
    likes: 33, replies: 19, timeAgo: '4 days ago',
    tags: ['Sade Sati', 'Saturn', 'Preparation', 'Remedies'],
  },
];

const CATEGORIES = ['All', 'Question', 'Discussion', 'Chart Reading', 'Remedies', 'Learning'];
const CATEGORY_COLORS: Record<string, string> = {
  Question: 'bg-blue-100 text-blue-800',
  Discussion: 'bg-purple-100 text-purple-800',
  'Chart Reading': 'bg-orange-100 text-orange-800',
  Remedies: 'bg-green-100 text-green-800',
  Learning: 'bg-yellow-100 text-yellow-800',
};

const CommunityPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const isHi = lang === 'hi';

  const filtered = selectedCategory === 'All' ? POSTS : POSTS.filter(p => p.category === selectedCategory);

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <>
      <SEO title="Astrology Community - Forums & Discussions" description="Join the Vedic astrology community. Ask questions, share experiences, get chart readings, and learn from expert astrologers." keywords="astrology community, astrology forum, vedic astrology discussion, chart reading help, astrology questions" canonical="/community" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👥</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'ज्योतिष समुदाय' : 'Astrology Community'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'प्रश्न • चर्चा • सीखें' : 'Ask • Discuss • Learn Together'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {selectedPost ? (
            <div className="space-y-4">
              <button onClick={() => setSelectedPost(null)} className="text-sm text-primary flex items-center gap-1">← Back to community</button>
              <div className="bg-card border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{selectedPost.avatar}</span>
                  <div>
                    <div className="font-semibold text-sm">{selectedPost.author}</div>
                    <div className="text-xs text-muted-foreground">{selectedPost.timeAgo}</div>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[selectedPost.category]}`}>{selectedPost.category}</span>
                </div>
                <h2 className="font-bold mb-3">{selectedPost.title}</h2>
                <p className="text-sm text-muted-foreground mb-3">{selectedPost.content}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedPost.tags.map(t => <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded">#{t}</span>)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button onClick={() => toggleLike(selectedPost.id)} className={`flex items-center gap-1 ${likedPosts.has(selectedPost.id) ? 'text-red-500' : ''}`}>
                    {likedPosts.has(selectedPost.id) ? '❤️' : '🤍'} {selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)}
                  </button>
                  <span>💬 {selectedPost.replies} replies</span>
                  {selectedPost.isAnswered && <span className="text-green-600">✅ Answered</span>}
                </div>
              </div>
              <div className="bg-card border rounded-xl p-4">
                <div className="text-sm font-medium mb-3">Add a Reply</div>
                <textarea placeholder="Share your knowledge or experience..." className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none h-20 mb-2" />
                <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium">Post Reply</button>
              </div>
            </div>
          ) : showNewPost ? (
            <div className="space-y-4">
              <button onClick={() => setShowNewPost(false)} className="text-sm text-primary flex items-center gap-1">← Cancel</button>
              <div className="bg-card border rounded-xl p-5 space-y-3">
                <h2 className="font-bold">Create New Post</h2>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Title</label>
                  <input value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} placeholder="What's your question or topic?" className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Content</label>
                  <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Describe your question or share your knowledge..." className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none h-32" />
                </div>
                <button disabled={!newPostTitle.trim() || !newPostContent.trim()} className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium disabled:opacity-50">
                  Post to Community
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Members', value: '12,450', icon: '👥' },
                  { label: 'Posts', value: '8,920', icon: '💬' },
                  { label: 'Experts', value: '156', icon: '🧙' },
                ].map(s => (
                  <div key={s.label} className="bg-card border rounded-xl p-3 text-center">
                    <div className="text-xl">{s.icon}</div>
                    <div className="font-bold text-sm">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowNewPost(true)} className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-medium">
                + Create New Post
              </button>

              {/* Category Filter */}
              <div className="flex gap-1 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Posts */}
              <div className="space-y-3">
                {filtered.map(post => (
                  <button key={post.id} onClick={() => setSelectedPost(post)}
                    className="w-full bg-card border rounded-xl p-4 text-left hover:border-primary transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{post.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>{post.category}</span>
                          {post.isAnswered && <span className="text-xs text-green-600">✅ Answered</span>}
                        </div>
                        <div className="font-semibold text-sm mb-1">{post.title}</div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{post.author}</span>
                          <span>{post.timeAgo}</span>
                          <span>🤍 {post.likes}</span>
                          <span>💬 {post.replies}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default CommunityPage;
