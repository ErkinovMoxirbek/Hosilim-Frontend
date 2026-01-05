import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, Bookmark, Search, Plus, Bell, User, Home, Compass, DollarSign, Copy, Check, Zap, Settings, Edit3, Trash2, MoreHorizontal, Filter, TrendingUp, Clock, Star, Award, Users, BookOpen, Send, X } from 'lucide-react';

const IqtibosxonaDemo = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [likedPosts, setLikedPosts] = useState(new Set([1, 3]));
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set([2]));
  const [followedUsers, setFollowedUsers] = useState(new Set(['@einstein_quotes', '@leadership_uz']));
  const [copiedPost, setCopiedPost] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(null);
  const [feedType, setFeedType] = useState('following');
  const [newPost, setNewPost] = useState({
    text: '',
    author: '',
    source: '',
    year: '',
    language: 'uz',
    tags: ''
  });
  const [comments, setComments] = useState({
    1: [
      { id: 1, user: '@physics_lover', text: 'Ajoyib fikr! Einstein haqiqatan ham dahiy edi.', time: '2s oldin' },
      { id: 2, user: '@student_uz', text: 'Bu iqtibos mening hayot qarashimni o\'zgartirdi', time: '5s oldin' }
    ],
    2: [
      { id: 3, user: '@entrepreneur', text: 'Har kun kichik qadamlar - bu mening motto\'m', time: '1s oldin' }
    ]
  });
  const [newComment, setNewComment] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'like', user: '@physics_lover', action: 'sizning iqtibosingizni yoqtirib qoldi', time: '5daq oldin', read: false },
    { id: 2, type: 'comment', user: '@student_uz', action: 'iqtibosingizga izoh qoldirdi', time: '10daq oldin', read: false },
    { id: 3, type: 'follow', user: '@new_reader', action: 'sizni kuzata boshladi', time: '1s oldin', read: true },
    { id: 4, type: 'donate', user: '@supporter', action: 'sizga 25,000 som donat yubordi', time: '2s oldin', read: false },
  ]);

  const samplePosts = [
    {
      id: 1,
      text: "Tasavvur kuchi bilimdan ham muhimroqdir. Chunki bilim bizga hozir mavjud bo'lgan narsalarni beradi, tasavvur esa kelajakda bo'lishi mumkin bo'lgan hamma narsaga yo'l ochadi.",
      author: "Albert Einstein",
      source: "Fizika va falsafa",
      year: "1929",
      tags: ["#Falsafa", "#Ilhom", "#Kelajak"],
      likes: 342,
      comments: 28,
      shares: 15,
      username: "@einstein_quotes",
      verified: true,
      timeAgo: "3s oldin",
      avatar: "AE"
    },
    {
      id: 2,
      text: "Yutuq - har kuni qilinadigan kichik ishlarning yig'indisidir. Bir kunda katta muvaffaqiyat qozonish mumkin emas, lekin har kuni kichik qadamlar tashlash orqali eng baland cho'qqilarga chiqish mumkin.",
      author: "John C. Maxwell",
      source: "15 Qimmatli Qonunlar",
      year: "2007",
      tags: ["#Liderlik", "#Motivatsiya", "#Muvaffaqiyat"],
      likes: 198,
      comments: 12,
      shares: 8,
      username: "@leadership_uz",
      verified: false,
      timeAgo: "1s oldin",
      avatar: "JM"
    },
    {
      id: 3,
      text: "Eng katta xazina - bu vaqt. Uni to'g'ri sarflagan kishi hayotida hech qachon pushaymon bo'lmaydi. Vaqtni isrof qilish - o'z hayotini isrof qilishdir.",
      author: "Ibn Sino",
      source: "Hikmatlar majmuasi",
      year: "1020",
      tags: ["#Hikmat", "#Vaqt", "#Hayat"],
      likes: 756,
      comments: 43,
      shares: 29,
      username: "@avicenna_wisdom",
      verified: true,
      timeAgo: "2s oldin",
      avatar: "IS"
    },
    {
      id: 4,
      text: "O'qish - ruhni oziqlantirishdir. Kitobsiz kun - ovqatsiz kun kabi. Har bir sahifa sizni yangi dunyoga olib boradi.",
      author: "Abdulla Qodiriy",
      source: "O'tkan kunlar",
      year: "1925",
      tags: ["#Kitob", "#Ma'rifat", "#Adabiyot"],
      likes: 523,
      comments: 31,
      shares: 18,
      username: "@uzbek_classics",
      verified: true,
      timeAgo: "4s oldin",
      avatar: "AQ"
    }
  ];

  const trendingTopics = [
    { tag: "#Motivatsiya", posts: 1250, growth: "+12%" },
    { tag: "#Biznes", posts: 892, growth: "+8%" },
    { tag: "#Falsafa", posts: 647, growth: "+15%" },
    { tag: "#Kitob", posts: 431, growth: "+5%" },
    { tag: "#Hayot", posts: 389, growth: "+22%" }
  ];

  const suggestedAuthors = [
    { username: "@rumi_hikmat", name: "Rumiy Hikmatlar", followers: "12.5K", verified: true, avatar: "RH" },
    { username: "@modern_leader", name: "Zamonaviy Lider", followers: "8.2K", verified: false, avatar: "ML" },
    { username: "@startup_quotes", name: "Startup Quotes", followers: "15.1K", verified: true, avatar: "SQ" },
    { username: "@life_wisdom", name: "Hayot Hikmatlari", followers: "6.7K", verified: false, avatar: "HH" }
  ];

  const userProfile = {
    username: "@john_reader",
    fullName: "John O'quvchi",
    bio: "Kitob o'qishni yaxshi ko'raman. Har kuni yangi iqtiboslar bilan o'rtoqlashaman 📚",
    followers: 1247,
    following: 156,
    posts: 89,
    verified: false,
    avatar: "JO",
    joinedDate: "2024 yil mart"
  };

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleBookmark = (postId) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleFollow = (username) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(username)) {
        newSet.delete(username);
      } else {
        newSet.add(username);
      }
      return newSet;
    });
  };

  const copyPost = (post) => {
    const text = `"${post.text}"\n\n— ${post.author}\n\nIqtibosxona orqali ulashildi`;
    navigator.clipboard.writeText(text);
    setCopiedPost(post.id);
    setTimeout(() => setCopiedPost(null), 2000);
  };

  const submitComment = (postId) => {
    if (newComment.trim()) {
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), {
          id: Date.now(),
          user: userProfile.username,
          text: newComment,
          time: 'hozir'
        }]
      }));
      setNewComment('');
    }
  };

  const createPost = () => {
    if (newPost.text.trim() && newPost.author.trim()) {
      // Post yaratish logikasi
      alert('Post muvaffaqiyatli yaratildi!');
      setNewPost({ text: '', author: '', source: '', year: '', language: 'uz', tags: '' });
    }
  };

  const DonateModal = ({ post, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Donat yuborish</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl mx-auto mb-3">
            {post.avatar}
          </div>
          <p className="text-white font-medium">{post.username}</p>
          <p className="text-gray-400 text-sm">{post.author}ni qo'llab-quvvatlang</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[10000, 25000, 50000].map(amount => (
            <button
              key={amount}
              className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-center transition-colors"
            >
              <div className="text-white font-semibold">{amount.toLocaleString()}</div>
              <div className="text-gray-400 text-xs">so'm</div>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <input 
            type="number"
            placeholder="Boshqa summa"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
            Payme
          </button>
          <button className="p-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors">
            Click
          </button>
        </div>

        <button 
          onClick={() => {
            alert('To\'lov amalga oshirildi!');
            onClose();
          }}
          className="w-full p-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all"
        >
          Donat yuborish
        </button>
      </div>
    </div>
  );

  const CommentModal = ({ post, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-semibold text-white">Izohlar</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(comments[post.id] || []).map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {comment.user.slice(1, 3).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">{comment.user}</span>
                  <span className="text-gray-400 text-xs">{comment.time}</span>
                </div>
                <p className="text-gray-200 text-sm">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-800">
          <div className="flex gap-3">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Izoh yozing..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              onKeyPress={(e) => e.key === 'Enter' && submitComment(post.id)}
            />
            <button 
              onClick={() => submitComment(post.id)}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PostCard = ({ post }) => (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-4 hover:bg-gray-900/70 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {post.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{post.username}</span>
              {post.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </div>
            <span className="text-gray-400 text-sm">{post.timeAgo}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => copyPost(post)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-800 rounded-lg"
          >
            {copiedPost === post.id ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} className="text-gray-400" />
            )}
          </button>
          <button 
            onClick={() => toggleBookmark(post.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-800 rounded-lg"
          >
            <Bookmark 
              size={16} 
              className={bookmarkedPosts.has(post.id) ? "text-yellow-500" : "text-gray-400"}
              fill={bookmarkedPosts.has(post.id) ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-100 text-lg leading-relaxed mb-3">
          "{post.text}"
        </p>
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <span>—</span>
          <span className="font-medium">{post.author}</span>
          {post.source && (
            <>
              <span>•</span>
              <span className="italic">{post.source}</span>
              {post.year && <span>({post.year})</span>}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-gray-800 text-blue-400 rounded-full text-sm hover:bg-gray-700 cursor-pointer transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => toggleLike(post.id)}
            className={`flex items-center gap-2 transition-colors ${
              likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart size={18} fill={likedPosts.has(post.id) ? "currentColor" : "none"} />
            <span className="text-sm">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
          </button>
          
          <button 
            onClick={() => setShowCommentModal(post)}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments}</span>
          </button>
          
          <button 
            onClick={() => copyPost(post)}
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
          >
            <Share size={18} />
            <span className="text-sm">{post.shares}</span>
          </button>
        </div>

        <button 
          onClick={() => setShowDonateModal(post)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all transform hover:scale-105"
        >
          <DollarSign size={16} />
          <span className="text-sm">Donat</span>
        </button>
      </div>
    </div>
  );

  const NavButton = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
        active 
          ? 'text-blue-400 bg-blue-500/10' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
      }`}
    >
      <div className="relative">
        <Icon size={20} />
        {badge && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{badge}</span>
          </div>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        const postsToShow = feedType === 'following' 
          ? samplePosts.filter(post => followedUsers.has(post.username))
          : samplePosts;

        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setFeedType('following')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    feedType === 'following' 
                      ? 'text-white bg-gray-800' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Following
                </button>
                <button 
                  onClick={() => setFeedType('for_you')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    feedType === 'for_you' 
                      ? 'text-white bg-gray-800' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  For You
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                  <Filter size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                  <Search size={18} />
                </button>
              </div>
            </div>

            <div>
              {postsToShow.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        );
      
      case 'explore':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Trending Topics */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-orange-500" size={24} />
                <h2 className="text-2xl font-bold text-white">Mashhur mavzular</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:bg-gray-900/70 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 font-medium">{topic.tag}</span>
                      <span className="text-green-400 text-sm">{topic.growth}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{topic.posts} ta post</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Authors */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Users className="text-purple-500" size={24} />
                <h2 className="text-2xl font-bold text-white">Tavsiya qilingan mualliflar</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedAuthors.map((author, index) => (
                  <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/70 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {author.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{author.name}</span>
                          {author.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{author.username}</p>
                        <p className="text-gray-500 text-xs">{author.followers} followers</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleFollow(author.username)}
                      className={`w-full py-2 rounded-xl font-medium transition-colors ${
                        followedUsers.has(author.username)
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {followedUsers.has(author.username) ? 'Kuzatilmoqda' : 'Kuzatish'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'create':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Edit3 size={24} className="text-blue-500" />
                Yangi iqtibos yaratish
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Iqtibos matni</label>
                  <textarea 
                    value={newPost.text}
                    onChange={(e) => setNewPost(prev => ({...prev, text: e.target.value}))}
                    placeholder="Ilhomli iqtibosingizni bu yerga yozing..."
                    className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <div className="text-right text-sm text-gray-400 mt-1">
                    {newPost.text.length} / 1000
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Muallif</label>
                    <input 
                      value={newPost.author}
                      onChange={(e) => setNewPost(prev => ({...prev, author: e.target.value}))}
                      placeholder="Masalan: Albert Einstein"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Asar nomi</label>
                    <input 
                      value={newPost.source}
                      onChange={(e) => setNewPost(prev => ({...prev, source: e.target.value}))}
                      placeholder="Masalan: Fizika va falsafa"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Yil</label>
                    <input 
                      value={newPost.year}
                      onChange={(e) => setNewPost(prev => ({...prev, year: e.target.value}))}
                      placeholder="1929"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Til</label>
                    <select 
                      value={newPost.language}
                      onChange={(e) => setNewPost(prev => ({...prev, language: e.target.value}))}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    >
                      <option value="uz">O'zbek</option>
                      <option value="ru">Rus</option>
                      <option value="en">Ingliz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Teglar</label>
                    <input 
                      value={newPost.tags}
                      onChange={(e) => setNewPost(prev => ({...prev, tags: e.target.value}))}
                      placeholder="#motivatsiya #hayot"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                </div>
                
                {newPost.text && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <Zap size={16} />
                      <span className="font-medium">Plagiat tekshiruvi</span>
                    </div>
                    <p className="text-yellow-300 text-sm">Matn tekshirilmoqda... Hech qanday o'xshashlik topilmadi</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <BookOpen size={16} />
                      <span>Sifat: Yuqori</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setNewPost({ text: '', author: '', source: '', year: '', language: 'uz', tags: '' })}
                      className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Tozalash
                    </button>
                    <button 
                      onClick={createPost}
                      disabled={!newPost.text.trim()}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors"
                    >
                      Nashr qilish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        const unreadCount = notifications.filter(n => !n.read).length;
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bell size={24} className="text-blue-500" />
                Bildirishlar
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Barchasini o'qilgan qilib belgilash
              </button>
            </div>

            <div className="space-y-2">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-xl border transition-colors ${
                    notification.read 
                      ? 'bg-gray-900/30 border-gray-800' 
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {notification.user.slice(1, 3).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">
                        <span className="font-medium">{notification.user}</span>{' '}
                        <span className="text-gray-300">{notification.action}</span>
                      </p>
                      <span className="text-gray-400 text-xs">{notification.time}</span>
                    </div>
                    {notification.type === 'donate' && (
                      <DollarSign size={16} className="text-yellow-500" />
                    )}
                    {notification.type === 'like' && (
                      <Heart size={16} className="text-red-500" />
                    )}
                    {notification.type === 'comment' && (
                      <MessageCircle size={16} className="text-blue-500" />
                    )}
                    {notification.type === 'follow' && (
                      <User size={16} className="text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {userProfile.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-white">{userProfile.fullName}</h1>
                    {userProfile.verified && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 mb-1">{userProfile.username}</p>
                  <p className="text-gray-300 mb-4">{userProfile.bio}</p>
                  
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{userProfile.posts}</div>
                      <div className="text-gray-400 text-sm">Postlar</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{userProfile.followers.toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{userProfile.following}</div>
                      <div className="text-gray-400 text-sm">Following</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                      Profilni tahrirlash
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="text-center">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all transform hover:scale-105 mb-3">
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign size={18} />
                      <span>Donat olish</span>
                    </div>
                  </button>
                  <p className="text-gray-400 text-xs">Mualliflarni qo'llab-quvvatlang</p>
                </div>
              </div>
            </div>

            {/* User Posts */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Mening iqtiboslarim
              </h2>
              <div className="grid gap-4">
                {samplePosts.slice(0, 2).map(post => (
                  <div key={`profile-${post.id}`} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-gray-100 flex-1">"{post.text}"</p>
                      <div className="flex items-center gap-1 ml-4">
                        <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm mb-2">— {post.author}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart size={14} /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} /> {post.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share size={14} /> {post.shares}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs">{post.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl text-white font-medium mb-2">Tez orada</h3>
            <p className="text-gray-400">Bu bo'lim hali ishlab chiqilmoqda</p>
          </div>
        );
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IQ</span>
              </div>
              <h1 className="text-xl font-bold text-white">Iqtibosxona</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{unreadNotifications}</span>
                  </div>
                )}
              </button>
              <div 
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <span className="text-white font-semibold text-sm">{userProfile.avatar}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        {renderContent()}
      </main>

      {/* Modals */}
      {showDonateModal && (
        <DonateModal 
          post={showDonateModal} 
          onClose={() => setShowDonateModal(null)} 
        />
      )}
      
      {showCommentModal && (
        <CommentModal 
          post={showCommentModal} 
          onClose={() => setShowCommentModal(null)} 
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-md border-t border-gray-800">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <NavButton 
              icon={Home} 
              label="Bosh sahifa" 
              active={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
            />
            <NavButton 
              icon={Compass} 
              label="Kashf etish" 
              active={activeTab === 'explore'}
              onClick={() => setActiveTab('explore')}
            />
            <NavButton 
              icon={Plus} 
              label="Yaratish" 
              active={activeTab === 'create'}
              onClick={() => setActiveTab('create')}
            />
            <NavButton 
              icon={Bell} 
              label="Bildirishlar" 
              active={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
              badge={unreadNotifications > 0 ? unreadNotifications : null}
            />
            <NavButton 
              icon={User} 
              label="Profil" 
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default IqtibosxonaDemo