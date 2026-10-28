// Interactive Growers Community Hub: Connect with farmers cultivating similar plants, share tips, ideas & best practices
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  ThumbsUp,
  Share2,
  Plus,
  Sparkles,
  MapPin,
  CheckCircle2,
  Send,
  HelpCircle,
  Lightbulb,
  Tag,
  Filter,
} from 'lucide-react';
import { getGardenPlants } from '../../lib/garden';
import type { Plant } from '@verdescan/shared';

export interface GrowersCommunityHubProps {
  onClose: () => void;
  onOpenScan?: () => void;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRole: string;
  authorLocation: string;
  cropTag: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  hasLiked?: boolean;
  category: 'tip' | 'question' | 'success_story' | 'remedy';
}

const DEFAULT_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorName: 'Kwesi Mensah',
    authorRole: 'Organic Market Gardener (5 yrs)',
    authorLocation: 'Kumasi, Ashanti',
    cropTag: 'Tomato',
    title: 'How companion African Marigolds eliminated root-knot nematodes in my plots',
    content:
      'Last season I lost 30% of my Roma tomatoes to stunted yellowing from nematodes. This cycle, I planted African Marigolds every 4 feet along the raised bed ridges. Their roots secrete natural alpha-terthienyl which suffocates root nematodes. Zero wilting this harvest!',
    timestamp: '2 hours ago',
    likes: 24,
    commentsCount: 7,
    category: 'remedy',
  },
  {
    id: 'post-2',
    authorName: 'Amina Bello',
    authorRole: 'Vegetable Grower & Cooperative Lead',
    authorLocation: 'Tamale, Northern',
    cropTag: 'Pepper',
    title: 'DIY wood ash barrier to stop cutworms and snails without toxic chemicals',
    content:
      'Sprinkling a dry 2-inch band of cold hardwood ash around young scotch bonnet seedlings creates an alkaline desiccant barrier. Slugs and caterpillars refuse to cross it. Just re-apply after heavy rain showers.',
    timestamp: '5 hours ago',
    likes: 19,
    commentsCount: 4,
    category: 'tip',
  },
  {
    id: 'post-3',
    authorName: 'David Osei',
    authorRole: 'Urban Container Grower',
    authorLocation: 'Accra Coastal Hub',
    cropTag: 'Monstera & Houseplants',
    title: 'Fermented banana peel tea for explosive foliar growth and fenestrations',
    content:
      'Steep 4 organic banana peels in 2 liters of dechlorinated water for 48 hours. The leachate is loaded with potassium, magnesium, and phosphorus. Dilute 1:1 and water your indoor plants once a month. My Monstera produced 3 new leaves with double fenestrations!',
    timestamp: 'Yesterday',
    likes: 31,
    commentsCount: 12,
    category: 'success_story',
  },
  {
    id: 'post-4',
    authorName: 'Grace Antwi',
    authorRole: 'Grain & Legume Farmer',
    authorLocation: 'Sunyani, Bono',
    cropTag: 'Maize',
    title: 'Best time for morning irrigation during dry spells?',
    content:
      'With the current afternoon heat reaching 33°C, is it better to irrigate at 6:00 AM or 5:30 PM? We are aiming to balance root hydration with avoiding fungal spores on leaves.',
    timestamp: '1 day ago',
    likes: 14,
    commentsCount: 9,
    category: 'question',
  },
  {
    id: 'post-5',
    authorName: 'Ibrahim Sani',
    authorRole: 'Horticulturalist',
    authorLocation: 'Ibadan Agri-Zone',
    cropTag: 'Okra',
    title: 'Neem oil emulsification tip: Always add two drops of liquid black soap',
    content:
      'Pure cold-pressed neem oil will separate on top of water if sprayed raw. Whisk 5ml neem oil with 2 drops of gentle soap in warm water first before filling your sprayer. This ensures an even foliar coating against whiteflies!',
    timestamp: '2 days ago',
    likes: 27,
    commentsCount: 5,
    category: 'tip',
  },
];

const STORAGE_POSTS_KEY = 'verdescan_community_posts';

export function GrowersCommunityHub({ onClose }: GrowersCommunityHubProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [userPlants, setUserPlants] = useState<Plant[]>([]);
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [connectSuccessName, setConnectSuccessName] = useState<string | null>(null);

  // New post form state
  const [newPostCrop, setNewPostCrop] = useState('Tomato');
  const [newPostCategory, setNewPostCategory] = useState<'tip' | 'question' | 'remedy'>('tip');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('Local Farm Plot');

  useEffect(() => {
    getGardenPlants().then((plants) => setUserPlants(plants));

    try {
      const stored = localStorage.getItem(STORAGE_POSTS_KEY);
      if (stored) {
        setPosts(JSON.parse(stored));
      } else {
        setPosts(DEFAULT_POSTS);
      }
    } catch {
      setPosts(DEFAULT_POSTS);
    }
  }, []);

  const savePosts = (updated: CommunityPost[]) => {
    setPosts(updated);
    try {
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLike = (id: string) => {
    const updated = posts.map((p) => {
      if (p.id === id) {
        const liked = !p.hasLiked;
        return {
          ...p,
          hasLiked: liked,
          likes: liked ? p.likes + 1 : p.likes - 1,
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: 'You (Farm Member)',
      authorRole: 'Active Grower',
      authorLocation: newPostLocation.trim() || 'My Garden Plot',
      cropTag: newPostCrop,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      timestamp: 'Just now',
      likes: 1,
      commentsCount: 0,
      hasLiked: true,
      category: newPostCategory,
    };

    savePosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setIsShareModalOpen(false);
  };

  const handleConnectWithGrower = (name: string) => {
    setConnectSuccessName(name);
    setTimeout(() => {
      setConnectSuccessName(null);
    }, 3500);
  };

  // Derive user crops list for smart matching
  const userCropNames = userPlants.map((p) => p.nickname || p.cropId).filter(Boolean);
  const matchedCropSummary =
    userCropNames.length > 0 ? userCropNames.slice(0, 3).join(', ') : 'Tomato, Pepper, Okra';

  const filteredPosts = posts.filter((p) => {
    if (selectedCropFilter === 'all') return true;
    return p.cropTag.toLowerCase().includes(selectedCropFilter.toLowerCase());
  });

  return (
    <div className="space-y-4 px-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E6EBE4] flex items-center justify-center text-[#19201D] hover:bg-stone-50 shadow-2xs touch-target"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-[#19201D] tracking-tight leading-none">
              Growers Community
            </h1>
            <p className="text-[11px] text-[#5E6D65] mt-0.5 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#78C441] animate-pulse" />
              <span>Connect, share tips & ideas with nearby farmers</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="touch-target bg-[#78C441] hover:bg-[#6BB536] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs active:scale-95 transition-all min-h-[38px]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Share Tip</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {connectSuccessName && (
        <div className="bg-[#D8F3DC] border border-[#78C441] text-[#1B4332] p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#78C441] shrink-0" />
            <span>Connection request sent to {connectSuccessName}! Grower chat channel opened.</span>
          </div>
          <button
            type="button"
            onClick={() => setConnectSuccessName(null)}
            className="text-stone-500 hover:text-black font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Smart Garden Matching Banner */}
      <div className="bg-gradient-to-r from-[#182635] to-[#25394B] text-white rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#86EFAC] bg-white/10 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>Garden Crop Matching</span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold leading-tight">
            Growers Cultivating {matchedCropSummary}
          </h2>
          <p className="text-xs text-slate-300 max-w-sm">
            42 local farmers and gardeners are currently growing similar crops in your regional zone.
          </p>
        </div>
        <div className="absolute -right-3 -bottom-3 w-28 h-28 opacity-20 pointer-events-none">
          <Users className="w-full h-full" />
        </div>
      </div>

      {/* Crop Filter Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Crops' },
          { id: 'tomato', label: '🍅 Tomato' },
          { id: 'pepper', label: '🌶️ Pepper' },
          { id: 'maize', label: '🌽 Maize' },
          { id: 'okra', label: '🥢 Okra' },
          { id: 'houseplants', label: '🪴 Houseplants' },
          { id: 'cassava', label: '🥔 Cassava' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCropFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCropFilter === tab.id
                ? 'bg-[#78C441] text-white border-[#78C441] shadow-2xs'
                : 'bg-white border-[#E6EBE4] text-[#5E6D65] hover:text-[#19201D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Community Feed */}
      <div className="space-y-3.5">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6EBE4] shadow-xs space-y-3"
          >
            {/* Author Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#D8F3DC] text-[#2D6A4F] flex items-center justify-center font-extrabold text-sm shrink-0">
                  {post.authorName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-xs sm:text-sm text-[#19201D] leading-tight">
                      {post.authorName}
                    </h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#78C441]" />
                  </div>
                  <p className="text-[10px] text-[#5E6D65] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{post.authorLocation}</span>
                    <span>•</span>
                    <span>{post.timestamp}</span>
                  </p>
                </div>
              </div>

              {/* Crop Badge & Connect Button */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold bg-[#F6F8F5] text-[#2D6A4F] border border-[#E6EBE4] px-2 py-0.5 rounded-lg shrink-0">
                  🌱 {post.cropTag}
                </span>
                <button
                  type="button"
                  onClick={() => handleConnectWithGrower(post.authorName)}
                  className="touch-target text-[10px] font-bold text-[#1D4ED8] bg-[#EBF5FF] hover:bg-[#dbeafe] px-2 py-1 rounded-lg transition-colors shrink-0"
                >
                  Connect
                </button>
              </div>
            </div>

            {/* Post Title & Content */}
            <div className="space-y-1">
              <h4 className="font-extrabold text-xs sm:text-sm text-[#19201D] leading-snug">
                {post.title}
              </h4>
              <p className="text-xs text-[#5E6D65] leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Footer with Likes & Comments */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E6EBE4] text-xs">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 font-bold transition-colors touch-target py-1 ${
                    post.hasLiked ? 'text-[#78C441]' : 'text-[#5E6D65] hover:text-[#19201D]'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${post.hasLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes} Helpful</span>
                </button>

                <div className="flex items-center gap-1 text-[#5E6D65] font-semibold">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount} comments</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-[#78C441] bg-[#D8F3DC]/60 px-2 py-0.5 rounded-md uppercase">
                {post.category.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Share Idea / Tip Modal */}
      {isShareModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsShareModalOpen(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer animate-in fade-in"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreatePost}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between border-b border-[#E6EBE4] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#19201D]">Share Idea or Ask Growers</h3>
                <p className="text-[11px] text-[#5E6D65]">
                  Post organic tips, pest solutions, or questions to the network
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#19201D]">Target Crop</label>
                <select
                  value={newPostCrop}
                  onChange={(e) => setNewPostCrop(e.target.value)}
                  className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5"
                >
                  <option value="Tomato">🍅 Tomato</option>
                  <option value="Pepper">🌶️ Pepper</option>
                  <option value="Maize">🌽 Maize</option>
                  <option value="Okra">🥢 Okra</option>
                  <option value="Houseplants">🪴 Monstera & Houseplants</option>
                  <option value="Cassava">🥔 Cassava</option>
                  <option value="General Garden">🌱 General Garden</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#19201D]">Category</label>
                <select
                  value={newPostCategory}
                  onChange={(e) =>
                    setNewPostCategory(e.target.value as typeof newPostCategory)
                  }
                  className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5"
                >
                  <option value="tip">💡 Practical Tip</option>
                  <option value="remedy">🛡️ Organic Remedy</option>
                  <option value="question">❓ Question for Growers</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D]">Post Title</label>
              <input
                type="text"
                required
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="e.g. How I stopped whiteflies using mild soap spray..."
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#78C441]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D]">Details & Advice</label>
              <textarea
                required
                rows={4}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Describe your methods, dosages, weather conditions, or what symptoms you are observing..."
                className="w-full text-xs bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#78C441]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#19201D]">Your Farm Location Tag</label>
              <input
                type="text"
                value={newPostLocation}
                onChange={(e) => setNewPostLocation(e.target.value)}
                placeholder="e.g. Kumasi Ashanti, Urban Garden Accra..."
                className="w-full text-xs font-bold bg-[#F6F8F5] border border-[#E6EBE4] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#78C441]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="touch-target flex-1 bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-xs min-h-[44px]"
              >
                Publish to Community
              </button>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="touch-target px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
