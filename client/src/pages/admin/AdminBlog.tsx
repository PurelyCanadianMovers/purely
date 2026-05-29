import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Sparkles, PenLine, Trash2, Eye, EyeOff, LogOut, Loader2,
  BookOpen, Plus, ArrowLeft, CheckCircle, Clock, Image as ImageIcon,
  Users, ShieldCheck, ShieldOff
} from "lucide-react";
import { Streamdown } from "streamdown";

export default function AdminBlogPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  // AI Generator state
  const [topic, setTopic] = useState("");
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"list" | "generate" | "edit" | "users">("list");
  const [editPost, setEditPost] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: posts, refetch: refetchPosts, isLoading: postsLoading } = trpc.blog.listAll.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: allUsers, refetch: refetchUsers, isLoading: usersLoading } = trpc.users.list.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" && activeTab === "users" }
  );

  const setRoleMutation = trpc.users.setRole.useMutation({
    onSuccess: () => refetchUsers(),
  });

  const generatePost = trpc.blog.generate.useMutation({
    onSuccess: (data) => setGeneratedPost(data),
  });

  const savePost = trpc.blog.publish.useMutation({
    onSuccess: () => refetchPosts(),
  });

  const updatePost = trpc.blog.update.useMutation({
    onSuccess: () => {
      refetchPosts();
      setEditPost(null);
      setActiveTab("list");
    },
  });

  const deletePost = trpc.blog.delete.useMutation({
    onSuccess: () => {
      refetchPosts();
      setDeleteConfirm(null);
    },
  });

  const publishPost = trpc.blog.publish.useMutation({
    onSuccess: () => refetchPosts(),
  });

  const unpublishPost = trpc.blog.unpublish.useMutation({
    onSuccess: () => refetchPosts(),
  });

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#CC1A1A]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="font-body text-gray-400 mb-6">You must be signed in to access the admin panel.</p>
          <Button asChild className="bg-[#CC1A1A] hover:bg-[#A31515] text-white font-body font-semibold">
            <Link href="/admin/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="font-body text-gray-400 mb-6">Your account does not have admin privileges.</p>
          <Button asChild variant="outline" className="border-gray-700 text-gray-300 font-body font-semibold">
            <Link href="/">Back to Site</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerate = () => {
    if (!topic.trim()) return;
    generatePost.mutate({ idea: topic.trim() });
  };

  const handleSaveDraft = () => {
    // Post was already saved as draft by the generate mutation — just navigate to list
    refetchPosts();
    setGeneratedPost(null);
    setTopic("");
    setActiveTab("list");
  };

  const handleSavePublish = () => {
    if (!generatedPost?.id) return;
    // Publish the already-saved draft post
    savePost.mutate(
      { id: generatedPost.id },
      {
        onSuccess: () => {
          refetchPosts();
          setGeneratedPost(null);
          setTopic("");
          setActiveTab("list");
        },
      }
    );
  };

  const handleUpdateSave = () => {
    if (!editPost) return;
    updatePost.mutate({ id: editPost.id, ...editPost });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SEO title="Admin Blog Panel | Purely Canadian Movers" description="Admin blog management" canonical="/admin/blog" />

      {/* Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-[#CC1A1A] flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <div className="font-heading font-bold text-white text-sm">PCM Admin</div>
            <div className="font-body text-xs text-gray-400">Blog Management</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-body text-sm text-gray-400 hidden sm:block">{user.name}</span>
          <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white font-body">
            <Link href="/"><ArrowLeft size={14} className="mr-1" />View Site</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => logout()} className="text-gray-400 hover:text-red-400 font-body">
            <LogOut size={14} className="mr-1" />Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Nav Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab("list")}
            variant={activeTab === "list" ? "default" : "ghost"}
            className={activeTab === "list" ? "bg-[#CC1A1A] text-white font-body font-semibold" : "text-gray-400 font-body font-semibold hover:text-white"}
          >
            <BookOpen size={15} className="mr-2" />All Posts
          </Button>
          <Button
            onClick={() => { setActiveTab("generate"); setGeneratedPost(null); }}
            variant={activeTab === "generate" ? "default" : "ghost"}
            className={activeTab === "generate" ? "bg-[#CC1A1A] text-white font-body font-semibold" : "text-gray-400 font-body font-semibold hover:text-white"}
          >
            <Sparkles size={15} className="mr-2" />AI Generator
          </Button>
          <Button
            onClick={() => setActiveTab("users")}
            variant={activeTab === "users" ? "default" : "ghost"}
            className={activeTab === "users" ? "bg-[#CC1A1A] text-white font-body font-semibold" : "text-gray-400 font-body font-semibold hover:text-white"}
          >
            <Users size={15} className="mr-2" />Users
          </Button>
        </div>

        {/* Posts List */}
        {activeTab === "list" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-heading text-2xl font-bold text-white">Blog Posts</h1>
              <Button onClick={() => { setActiveTab("generate"); setGeneratedPost(null); }} className="bg-[#CC1A1A] hover:bg-[#A31515] text-white font-body font-semibold">
                <Plus size={15} className="mr-2" />New Post
              </Button>
            </div>
            {postsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}
              </div>
            ) : !posts || posts.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
                <BookOpen size={40} className="mx-auto text-gray-600 mb-3" />
                <p className="font-body text-gray-400 mb-4">No blog posts yet. Use the AI Generator to create your first post.</p>
                <Button onClick={() => setActiveTab("generate")} className="bg-[#CC1A1A] hover:bg-[#A31515] text-white font-body font-semibold">
                  <Sparkles size={15} className="mr-2" />Generate First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                    {post.coverImageUrl && (
                      <img src={post.coverImageUrl} alt={post.title} className="w-16 h-16 object-cover rounded-lg shrink-0 hidden sm:block" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold text-white text-sm truncate">{post.title}</h3>
                        <Badge variant={post.status === "published" ? "default" : "secondary"} className={post.status === "published" ? "bg-green-700 text-white text-xs" : "bg-gray-700 text-gray-300 text-xs"}>
                          {post.status}
                        </Badge>
                      </div>
                      <p className="font-body text-xs text-gray-400 truncate">{post.metaDescription}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-body">
                        <span className="flex items-center gap-1"><Clock size={11} />{post.readTimeMinutes} min</span>
                        <span>/{post.slug}/</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {post.status === "draft" ? (
                        <Button size="sm" onClick={() => publishPost.mutate({ id: post.id })} className="bg-green-700 hover:bg-green-600 text-white font-body text-xs h-8">
                          <Eye size={12} className="mr-1" />Publish
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => unpublishPost.mutate({ id: post.id })} className="text-gray-400 hover:text-white font-body text-xs h-8">
                          <EyeOff size={12} className="mr-1" />Unpublish
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { setEditPost({ ...post }); setActiveTab("edit"); }} className="text-gray-400 hover:text-white font-body text-xs h-8">
                        <PenLine size={12} className="mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(post.id)} className="text-gray-400 hover:text-red-400 font-body text-xs h-8">
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Generator */}
        {activeTab === "generate" && (
          <div>
            <h1 className="font-heading text-2xl font-bold text-white mb-6">AI Blog Generator</h1>
            {!generatedPost ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#CC1A1A]/20 flex items-center justify-center">
                        <Sparkles size={20} className="text-[#CC1A1A]" />
                      </div>
                      <div>
                        <h2 className="font-heading font-bold text-white">Generate a Blog Post</h2>
                        <p className="font-body text-xs text-gray-400">Enter a topic and our AI will create a full SEO-optimised post</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="topic" className="font-body font-semibold text-gray-300">Blog Topic</Label>
                        <Input
                          id="topic"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g. How to pack fragile items for a long-distance move"
                          className="mt-1 font-body bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                        />
                      </div>
                      <p className="font-body text-xs text-gray-500">The AI will generate: SEO title, H1, meta description, slug, full content (800–1500 words), focus keywords, read time, and a cover image.</p>
                      <Button
                        onClick={handleGenerate}
                        disabled={!topic.trim() || generatePost.isPending}
                        className="bg-[#CC1A1A] hover:bg-[#A31515] text-white font-body font-semibold"
                      >
                        {generatePost.isPending ? (
                          <><Loader2 size={15} className="mr-2 animate-spin" />Generating Post...</>
                        ) : (
                          <><Sparkles size={15} className="mr-2" />Generate Post</>
                        )}
                      </Button>
                      {generatePost.isError && (
                        <p className="font-body text-xs text-red-400">Generation failed. Please try again.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-400" />
                    <span className="font-body font-semibold text-green-400">Post Generated Successfully</span>
                  </div>
                  <Button variant="ghost" onClick={() => setGeneratedPost(null)} className="text-gray-400 hover:text-white font-body text-sm">
                    Generate Another
                  </Button>
                </div>

                {/* Preview */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <Tabs defaultValue="preview">
                      <TabsList className="bg-gray-800 mb-4">
                        <TabsTrigger value="preview" className="font-body text-sm">Preview</TabsTrigger>
                        <TabsTrigger value="meta" className="font-body text-sm">SEO Meta</TabsTrigger>
                      </TabsList>
                      <TabsContent value="preview">
                        {generatedPost.coverImageUrl && (
                          <img src={generatedPost.coverImageUrl} alt={generatedPost.title} className="w-full h-48 object-cover rounded-xl mb-4" />
                        )}
                        <h2 className="font-heading text-xl font-bold text-white mb-2">{generatedPost.title}</h2>
                        <div className="flex items-center gap-3 text-xs text-gray-400 font-body mb-4">
                          <span className="flex items-center gap-1"><Clock size={12} />{generatedPost.readTimeMinutes} min read</span>
                          <span>/{generatedPost.slug}/</span>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none font-body max-h-80 overflow-y-auto">
                          <Streamdown>{generatedPost.content}</Streamdown>
                        </div>
                      </TabsContent>
                      <TabsContent value="meta">
                        <div className="space-y-3 text-sm font-body">
                          <div><span className="text-gray-400">Title:</span> <span className="text-white">{generatedPost.title}</span></div>
                          <div><span className="text-gray-400">Slug:</span> <span className="text-white">/{generatedPost.slug}/</span></div>
                          <div><span className="text-gray-400">Meta Description:</span> <span className="text-white">{generatedPost.metaDescription}</span></div>
                          <div><span className="text-gray-400">Focus Keywords:</span> <span className="text-white">{generatedPost.focusKeywords}</span></div>
                          <div><span className="text-gray-400">Read Time:</span> <span className="text-white">{generatedPost.readTimeMinutes} minutes</span></div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <p className="font-body text-xs text-gray-500 mb-1">Post has been auto-saved as a draft. You can publish it now or find it in the posts list.</p>
                <div className="flex gap-3">
                  <Button onClick={handleSaveDraft} disabled={savePost.isPending} variant="outline" className="border-gray-700 text-gray-300 hover:text-white font-body font-semibold">
                    Keep as Draft
                  </Button>
                  <Button onClick={handleSavePublish} disabled={savePost.isPending} className="bg-green-700 hover:bg-green-600 text-white font-body font-semibold">
                    {savePost.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Eye size={14} className="mr-2" />}
                    Save & Publish
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Management */}
        {activeTab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-heading text-2xl font-bold text-white">User Management</h1>
              <p className="font-body text-xs text-gray-400">Promote users to admin or revoke admin access</p>
            </div>
            {usersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />)}
              </div>
            ) : !allUsers || allUsers.length === 0 ? (
              <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
                <Users size={40} className="mx-auto text-gray-600 mb-3" />
                <p className="font-body text-gray-400">No users have signed in yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allUsers.map((u) => (
                  <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                      <span className="font-heading font-bold text-white text-sm">{(u.name ?? u.email ?? "?")[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-white text-sm truncate">{u.name ?? "—"}</span>
                        {u.role === "admin" && (
                          <span className="text-xs bg-[#CC1A1A]/20 text-[#CC1A1A] px-2 py-0.5 rounded-full font-body font-semibold">Admin</span>
                        )}
                        {u.id === user.id && (
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full font-body">You</span>
                        )}
                      </div>
                      <p className="font-body text-xs text-gray-400 truncate">{u.email ?? "No email"}</p>
                    </div>
                    <div className="shrink-0">
                      {u.id !== user.id && (
                        u.role === "admin" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRoleMutation.mutate({ id: u.id, role: "user" })}
                            disabled={setRoleMutation.isPending}
                            className="text-gray-400 hover:text-red-400 font-body text-xs h-8"
                          >
                            <ShieldOff size={12} className="mr-1" />Revoke Admin
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setRoleMutation.mutate({ id: u.id, role: "admin" })}
                            disabled={setRoleMutation.isPending}
                            className="bg-[#CC1A1A] hover:bg-[#A31515] text-white font-body text-xs h-8"
                          >
                            <ShieldCheck size={12} className="mr-1" />Make Admin
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Post */}
        {activeTab === "edit" && editPost && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" onClick={() => setActiveTab("list")} className="text-gray-400 hover:text-white font-body text-sm">
                <ArrowLeft size={14} className="mr-1" />Back
              </Button>
              <h1 className="font-heading text-2xl font-bold text-white">Edit Post</h1>
            </div>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="font-body font-semibold text-gray-300">Title</Label>
                  <Input value={editPost.title} onChange={(e) => setEditPost({ ...editPost, title: e.target.value })} className="mt-1 font-body bg-gray-800 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="font-body font-semibold text-gray-300">Slug</Label>
                  <Input value={editPost.slug} onChange={(e) => setEditPost({ ...editPost, slug: e.target.value })} className="mt-1 font-body bg-gray-800 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="font-body font-semibold text-gray-300">Meta Description</Label>
                  <Textarea value={editPost.metaDescription || ""} onChange={(e) => setEditPost({ ...editPost, metaDescription: e.target.value })} className="mt-1 font-body bg-gray-800 border-gray-700 text-white min-h-[80px]" />
                </div>
                <div>
                  <Label className="font-body font-semibold text-gray-300">Content (Markdown)</Label>
                  <Textarea value={editPost.content} onChange={(e) => setEditPost({ ...editPost, content: e.target.value })} className="mt-1 font-body bg-gray-800 border-gray-700 text-white min-h-[300px] font-mono text-sm" />
                </div>
                <div>
                  <Label className="font-body font-semibold text-gray-300">Cover Image URL</Label>
                  <Input value={editPost.coverImageUrl || ""} onChange={(e) => setEditPost({ ...editPost, coverImageUrl: e.target.value })} className="mt-1 font-body bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleUpdateSave} disabled={updatePost.isPending} className="bg-[#CC1A1A] hover:bg-[#A31515] text-white font-body font-semibold">
                    {updatePost.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
                    Save Changes
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveTab("list")} className="text-gray-400 hover:text-white font-body font-semibold">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="font-heading text-white">Delete Post?</DialogTitle>
          </DialogHeader>
          <p className="font-body text-gray-400 text-sm">This action cannot be undone. The post will be permanently deleted.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-gray-400 font-body font-semibold">Cancel</Button>
            <Button
              onClick={() => deleteConfirm !== null && deletePost.mutate({ id: deleteConfirm })}
              disabled={deletePost.isPending}
              className="bg-red-700 hover:bg-red-600 text-white font-body font-semibold"
            >
              {deletePost.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Trash2 size={14} className="mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
