"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  User,
  Mail,
  Lock,
  Settings,
  LogOut,
  Save,
  X,
  Camera,
  Bell,
  Shield,
  Heart,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileData {
  fullname: string | null;
  bio: string | null;
  avatarurl: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const { user, signOut, updatePassword, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences">("profile");

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications: true,
    push_notifications: true,
    community_updates: true,
    prayer_requests: true,
    new_content: true,
    ministry_updates: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    posts: 0,
    comments: 0,
    prayers: 0,
    bookmarks: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/?auth=login&redirect=/profile");
    } else if (user) {
      fetchProfile();
      fetchStats();
      fetchNotificationPreferences();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("users")
        .select("fullname, bio, avatarurl, created_at")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFullName(data.fullname || "");
        setBio(data.bio || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      // Fetch user stats
      const [postsResult, commentsResult, prayersResult] = await Promise.all([
        supabase
          .from("communitythreads")
          .select("id", { count: "exact", head: true })
          .eq("userid", user.id),
        supabase
          .from("communitycomments")
          .select("id", { count: "exact", head: true })
          .eq("userid", user.id),
        supabase
          .from("thread_prayers")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setStats({
        posts: postsResult.count || 0,
        comments: commentsResult.count || 0,
        prayers: prayersResult.count || 0,
        bookmarks: 0, // TODO: Implement bookmarks
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchNotificationPreferences = async () => {
    if (!user) return;

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" - we'll create defaults
        console.error("Error fetching notification preferences:", error);
        return;
      }

      if (data) {
        setNotificationPrefs({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
          community_updates: data.community_updates ?? true,
          prayer_requests: data.prayer_requests ?? true,
          new_content: data.new_content ?? true,
          ministry_updates: data.ministry_updates ?? true,
        });
      } else {
        // Create default preferences
        const { data: newPrefs } = await supabase
          .from("notification_preferences")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (newPrefs) {
          setNotificationPrefs({
            email_notifications: newPrefs.email_notifications ?? true,
            push_notifications: newPrefs.push_notifications ?? true,
            community_updates: newPrefs.community_updates ?? true,
            prayer_requests: newPrefs.prayer_requests ?? true,
            new_content: newPrefs.new_content ?? true,
            ministry_updates: newPrefs.ministry_updates ?? true,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Delete old avatar if exists
      if (profile?.avatarurl) {
        const oldPath = profile.avatarurl.split("/").slice(-2).join("/");
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatarurl: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Refresh profile
      fetchProfile();
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveNotificationPreferences = async () => {
    if (!user) return;

    try {
      setSavingPrefs(true);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...notificationPrefs,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          fullname: fullName.trim() || null,
          bio: bio.trim() || null,
        });

      if (error) throw error;

      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFullName(profile?.fullname || "");
    setBio(profile?.bio || "");
    setEditing(false);
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return;
    }

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordError(error.message || "Failed to update password");
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message || "An unexpected error occurred");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-2">
            My Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-8 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-4 relative overflow-hidden">
                  {avatarPreview || profile?.avatarurl ? (
                    <img
                      src={avatarPreview || profile?.avatarurl || ""}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-secondary" />
                  )}
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-2 border-card cursor-pointer hover:bg-secondary/90 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <h2 className="font-bold text-xl text-foreground mb-1">
                  {profile?.fullname || user.user_metadata?.full_name || user.email?.split("@")[0]}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-border">
                <div className="text-center">
                  <div className="font-bold text-2xl text-foreground">{stats.posts}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-foreground">{stats.comments}</div>
                  <div className="text-xs text-muted-foreground">Comments</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-foreground">{stats.prayers}</div>
                  <div className="text-xs text-muted-foreground">Prayers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-foreground">{stats.bookmarks}</div>
                  <div className="text-xs text-muted-foreground">Saved</div>
                </div>
              </div>

              {/* Member Since */}
              <div className="pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Member Since
                </p>
                <p className="text-sm font-medium text-foreground">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Recently"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-card border border-border rounded-2xl p-2 flex gap-2">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "security", label: "Security", icon: Shield },
                { id: "preferences", label: "Preferences", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-secondary text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-card border border-border rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-foreground">Profile Information</h3>
                  {!editing && (
                    <Button
                      onClick={() => setEditing(true)}
                      variant="outline"
                      className="rounded-xl gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name
                      </label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-muted/30 border-border rounded-xl"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <Input
                        value={user.email || ""}
                        disabled
                        className="bg-muted/30 border-border rounded-xl opacity-60"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-muted/30 border-border rounded-xl min-h-[120px]"
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{bio.length}/500 characters</p>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-6 h-11 font-bold gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="rounded-xl px-6 h-11 font-bold gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Full Name
                      </label>
                      <p className="text-foreground font-medium">
                        {profile?.fullname || user.user_metadata?.full_name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Email Address
                      </label>
                      <p className="text-foreground font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Bio</label>
                      <p className="text-foreground">
                        {profile?.bio || "No bio added yet. Click Edit Profile to add one."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-card border border-border rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-8">Security Settings</h3>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-muted/30 border-border rounded-xl"
                      placeholder="Enter new password"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-muted/30 border-border rounded-xl"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  {passwordError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                      <p className="text-sm text-destructive font-medium">{passwordError}</p>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="rounded-xl border border-secondary/30 bg-secondary/5 px-4 py-3">
                      <p className="text-sm text-secondary font-medium">
                        Password updated successfully!
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-6 h-11 font-bold gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Update Password
                  </Button>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="bg-card border border-border rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-foreground">Notification Preferences</h3>
                  <Button
                    onClick={handleSaveNotificationPreferences}
                    disabled={savingPrefs}
                    className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-6 h-11 font-bold gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {savingPrefs ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-bold text-foreground">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about community activity and ministry news via email
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.email_notifications}
                          onChange={(e) =>
                            setNotificationPrefs({
                              ...notificationPrefs,
                              email_notifications: e.target.checked,
                            })
                          }
                        />
                        <div className="w-14 h-8 bg-muted-foreground/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-bold text-foreground">Push Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Get notified about new content and community updates via push notifications
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.push_notifications}
                          onChange={(e) =>
                            setNotificationPrefs({
                              ...notificationPrefs,
                              push_notifications: e.target.checked,
                            })
                          }
                        />
                        <div className="w-14 h-8 bg-muted-foreground/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-bold text-foreground">Community Updates</h4>
                          <p className="text-sm text-muted-foreground">
                            Notifications about new posts, comments, and community activity
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.community_updates}
                          onChange={(e) =>
                            setNotificationPrefs({
                              ...notificationPrefs,
                              community_updates: e.target.checked,
                            })
                          }
                        />
                        <div className="w-14 h-8 bg-muted-foreground/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-bold text-foreground">Prayer Requests</h4>
                          <p className="text-sm text-muted-foreground">
                            Notifications when someone prays for your requests or new requests are posted
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.prayer_requests}
                          onChange={(e) =>
                            setNotificationPrefs({
                              ...notificationPrefs,
                              prayer_requests: e.target.checked,
                            })
                          }
                        />
                        <div className="w-14 h-8 bg-muted-foreground/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bookmark className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-bold text-foreground">New Content</h4>
                          <p className="text-sm text-muted-foreground">
                            Notifications about new episodes, videos, and programs
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.new_content}
                          onChange={(e) =>
                            setNotificationPrefs({
                              ...notificationPrefs,
                              new_content: e.target.checked,
                            })
                          }
                        />
                        <div className="w-14 h-8 bg-muted-foreground/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-bold text-foreground">Ministry Updates</h4>
                          <p className="text-sm text-muted-foreground">
                            Important announcements and updates from the ministry
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationPrefs.ministry_updates}
                          onChange={(e) =>
                            setNotificationPrefs({
                              ...notificationPrefs,
                              ministry_updates: e.target.checked,
                            })
                          }
                        />
                        <div className="w-14 h-8 bg-muted-foreground/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sign Out Button */}
            <div className="bg-card border border-border rounded-3xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground mb-1">Sign Out</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="rounded-xl px-6 h-11 font-bold gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
