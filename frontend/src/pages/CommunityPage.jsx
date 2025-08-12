import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import Navbar from "../components/Navbar";
import { 
  UsersIcon,
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  EyeIcon,
  BookmarkIcon
} from "lucide-react";
import toast from "react-hot-toast";

const CommunityPage = () => {
  const { authUser } = useAuthUser();
  const [posts, setPosts] = useState([]);
  const [selectedTab, setSelectedTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    destination: "",
    tags: [],
    tripId: ""
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    // Load community posts from localStorage
    const savedPosts = JSON.parse(localStorage.getItem("gt_community_posts") || "[]");
    
    // Add some sample posts if none exist
    if (savedPosts.length === 0) {
      const samplePosts = [
        {
          id: 1,
          title: "Amazing 2-week Japan Adventure",
          content: "Just completed an incredible journey through Japan! From Tokyo's bustling streets to Kyoto's serene temples. The cherry blossoms were absolutely stunning!",
          author: "TravelEnthusiast23",
          authorAvatar: "https://avatar.iran.liara.run/public/45.png",
          destination: "Japan",
          tags: ["adventure", "culture", "food"],
          likes: 156,
          comments: 23,
          views: 1200,
          createdAt: "2024-01-15",
          isLiked: false,
          isBookmarked: false
        },
        {
          id: 2,
          title: "Budget Backpacking through Southeast Asia",
          content: "Spent only $30/day traveling through Thailand, Vietnam, and Cambodia. Here's my complete breakdown and tips for fellow budget travelers!",
          author: "BudgetNomad",
          authorAvatar: "https://avatar.iran.liara.run/public/67.png",
          destination: "Southeast Asia",
          tags: ["budget", "backpacking", "tips"],
          likes: 89,
          comments: 15,
          views: 890,
          createdAt: "2024-01-10",
          isLiked: false,
          isBookmarked: true
        },
        {
          id: 3,
          title: "European Christmas Markets Tour",
          content: "Visited 8 countries in 12 days to experience the magic of European Christmas markets. Germany and Austria were the highlights!",
          author: "HolidayExplorer",
          authorAvatar: "https://avatar.iran.liara.run/public/32.png",
          destination: "Europe",
          tags: ["christmas", "winter", "markets"],
          likes: 67,
          comments: 8,
          views: 567,
          createdAt: "2024-01-05",
          isLiked: true,
          isBookmarked: false
        }
      ];
      localStorage.setItem("gt_community_posts", JSON.stringify(samplePosts));
      setPosts(samplePosts);
    } else {
      setPosts(savedPosts);
    }
  };

  const createPost = () => {
    if (!newPost.title || !newPost.content) {
      toast.error("Please fill in title and content");
      return;
    }

    const post = {
      id: Date.now(),
      ...newPost,
      author: authUser?.fullName || "Anonymous",
      authorAvatar: authUser?.profilePic || `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100)}.png`,
      likes: 0,
      comments: 0,
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isLiked: false,
      isBookmarked: false
    };

    const updatedPosts = [post, ...posts];
    localStorage.setItem("gt_community_posts", JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
    
    setNewPost({ title: "", content: "", destination: "", tags: [], tripId: "" });
    setIsCreatePostOpen(false);
    toast.success("Post shared with the community!");
  };

  const toggleLike = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem("gt_community_posts", JSON.stringify(updatedPosts));
  };

  const toggleBookmark = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, isBookmarked: !post.isBookmarked };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem("gt_community_posts", JSON.stringify(updatedPosts));
    
    const post = posts.find(p => p.id === postId);
    toast.success(post.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.destination.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedFilter !== "all") {
      if (selectedFilter === "liked") {
        filtered = filtered.filter(post => post.isLiked);
      } else if (selectedFilter === "bookmarked") {
        filtered = filtered.filter(post => post.isBookmarked);
      } else {
        filtered = filtered.filter(post => post.tags.includes(selectedFilter));
      }
    }

    return filtered;
  };

  const addTag = (tag) => {
    if (tag && !newPost.tags.includes(tag)) {
      setNewPost({ ...newPost, tags: [...newPost.tags, tag] });
    }
  };

  const removeTag = (tagToRemove) => {
    setNewPost({ 
      ...newPost, 
      tags: newPost.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  if (!authUser) {
    return (
      <div className="min-h-screen" data-theme="retro">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg opacity-70">Please log in to access the community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <UsersIcon className="w-8 h-8" />
                Community
              </h1>
              <p className="text-lg opacity-70">Share experiences and discover inspiration</p>
            </div>
            <button 
              onClick={() => setIsCreatePostOpen(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Share Experience
            </button>
          </div>

          {/* Search and Filters */}
          <div className="card bg-base-100 border border-primary/20">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="form-control flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10"
                      placeholder="Search posts, destinations, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <select
                    className="select select-bordered"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option value="all">All Posts</option>
                    <option value="liked">Liked Posts</option>
                    <option value="bookmarked">Bookmarked</option>
                    <option value="adventure">Adventure</option>
                    <option value="budget">Budget Travel</option>
                    <option value="culture">Culture</option>
                    <option value="food">Food</option>
                    <option value="tips">Tips</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {getFilteredPosts().map((post) => (
              <div key={post.id} className="card bg-base-100 border border-primary/20">
                <div className="card-body">
                  
                  {/* Post Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={post.authorAvatar} alt={post.author} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{post.author}</h3>
                        <span className="badge badge-outline badge-sm">{post.destination}</span>
                      </div>
                      <div className="text-sm opacity-70 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-3 h-3" />
                          {post.views} views
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                    <p className="text-base leading-relaxed">{post.content}</p>
                    
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="badge badge-primary badge-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-base-300">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`btn btn-ghost btn-sm ${post.isLiked ? 'text-error' : ''}`}
                      >
                        <HeartIcon className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </button>
                      <button className="btn btn-ghost btn-sm">
                        <MessageCircleIcon className="w-4 h-4 mr-1" />
                        {post.comments}
                      </button>
                      <button className="btn btn-ghost btn-sm">
                        <ShareIcon className="w-4 h-4 mr-1" />
                        Share
                      </button>
                    </div>
                    <button
                      onClick={() => toggleBookmark(post.id)}
                      className={`btn btn-ghost btn-sm ${post.isBookmarked ? 'text-warning' : ''}`}
                    >
                      <BookmarkIcon className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {getFilteredPosts().length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 mx-auto opacity-30 mb-4" />
                <p className="text-xl opacity-70 mb-4">
                  {searchQuery || selectedFilter !== "all" 
                    ? "No posts match your search criteria" 
                    : "No community posts yet"
                  }
                </p>
                <button 
                  onClick={() => setIsCreatePostOpen(true)}
                  className="btn btn-primary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Share Your First Experience
                </button>
              </div>
            )}
          </div>

          {/* Create Post Modal */}
          {isCreatePostOpen && (
            <div className="modal modal-open">
              <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Share Your Travel Experience</h3>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Title *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      placeholder="Give your post an engaging title..."
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Destination</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={newPost.destination}
                      onChange={(e) => setNewPost({...newPost, destination: e.target.value})}
                      placeholder="e.g., Paris, France"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Content *</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-32"
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      placeholder="Share your experience, tips, and insights..."
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Tags</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newPost.tags.map((tag, index) => (
                        <span key={index} className="badge badge-primary gap-2">
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="new-tag"
                        type="text"
                        className="input input-bordered flex-1"
                        placeholder="Add tags (adventure, food, budget, etc.)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addTag(e.target.value.trim().toLowerCase());
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('new-tag');
                          addTag(input.value.trim().toLowerCase());
                          input.value = '';
                        }}
                        className="btn btn-outline"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary" onClick={createPost}>
                    Share Experience
                  </button>
                  <button className="btn" onClick={() => setIsCreatePostOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
