import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, MessageSquare, BookOpen, Star, Newspaper } from "lucide-react";
import PullToRefresh from "../components/PullToRefresh";
import ForumPostCard from "../components/community/ForumPostCard";
import NewPostDialog from "../components/community/NewPostDialog";

const categoryFilters = [
  { value: "all", label: "All" },
  { value: "question", label: "❓ Questions" },
  { value: "tip", label: "💡 Tips" },
  { value: "guide", label: "📖 Guides" },
  { value: "journal", label: "📔 Journals" },
  { value: "review", label: "⭐ Reviews" },
];

export default function Community() {
  const [showNewPost, setShowNewPost] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["forumPosts"],
    queryFn: () => base44.entities.ForumPost.list("-created_date", 100),
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      setShowNewPost(false);
    },
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
  };

  const filtered = posts.filter(p => {
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase()) ||
      p.strain_name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const questionCount = posts.filter(p => p.category === "question").length;
  const guideCount = posts.filter(p => p.category === "guide").length;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-white flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-emerald-400" />
              Community
            </h1>
            <p className="text-white/40 text-sm mt-1">Forum, grow journals & guides</p>
          </div>
          <Button onClick={() => setShowNewPost(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
            <Plus className="w-4 h-4" /> Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/[0.02] border-white/5 p-3 text-center">
            <div className="text-xl font-semibold text-white">{posts.length}</div>
            <div className="text-white/40 text-xs">Total Posts</div>
          </Card>
          <Card className="bg-white/[0.02] border-white/5 p-3 text-center">
            <div className="text-xl font-semibold text-blue-400">{questionCount}</div>
            <div className="text-white/40 text-xs">Questions</div>
          </Card>
          <Card className="bg-white/[0.02] border-white/5 p-3 text-center">
            <div className="text-xl font-semibold text-purple-400">{guideCount}</div>
            <div className="text-white/40 text-xs">Guides</div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts, topics, strains..."
            className="bg-white/5 border-white/10 text-white pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categoryFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setCategoryFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === f.value
                  ? "bg-emerald-600 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="text-center py-12 text-white/40">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/5 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/40">No posts yet</p>
            <p className="text-white/30 text-sm mt-1">Be the first to share something!</p>
            <Button onClick={() => setShowNewPost(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-500">
              <Plus className="w-4 h-4 mr-2" /> Create Post
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(post => (
              <ForumPostCard key={post.id} post={post} currentUserEmail={user?.email} />
            ))}
          </div>
        )}

        <NewPostDialog
          open={showNewPost}
          onClose={() => setShowNewPost(false)}
          onSubmit={(data) => createPostMutation.mutate(data)}
          user={user}
        />
      </div>
    </PullToRefresh>
  );
}