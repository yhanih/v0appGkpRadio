"use client";

import { useState, useEffect, useRef } from "react";
import { ListenSection } from "@/components/listen-section";
import { Radio, Users, MessageCircle, Calendar, Video, Headphones, Clock, Loader2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth-context";

interface ScheduleItem {
    id: string;
    show_title: string;
    hosts: string | null;
    start_time: string;
    end_time: string;
    day_of_week: string;
    is_live: boolean;
}

interface ChatMessage {
    id: string;
    username: string;
    message: string;
    timestamp: string;
    isverified: boolean;
    userid: string | null;
}

export default function LivePage() {
    const [activeMode, setActiveMode] = useState<'audio' | 'video'>('audio');
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Chat state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    
    // Live event state
    const [viewerCount, setViewerCount] = useState(0);
    const [currentEvent, setCurrentEvent] = useState<any>(null);

    // Fetch schedule from Supabase
    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            setError(null);
            const supabase = getSupabaseBrowserClient();
            
            if (!supabase) {
                setError("Failed to connect to database");
                setLoading(false);
                return;
            }

            try {
                // Get current time to filter upcoming shows
                const now = new Date();
                const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
                const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });

                // Fetch schedule items
                const { data, error: fetchError } = await supabase
                    .from('schedule')
                    .select('id, show_title, hosts, start_time, end_time, day_of_week, is_live')
                    .order('start_time', { ascending: true });

                if (fetchError) throw fetchError;

                // Filter for today's shows and upcoming shows
                const filteredSchedule = (data || []).filter((item: ScheduleItem) => {
                    // Check if the show is for today based on day_of_week
                    const dayMatch = item.day_of_week === 'Daily' || 
                                   item.day_of_week.includes(currentDay) ||
                                   item.day_of_week === 'Mon-Fri' && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(currentDay);
                    
                    if (!dayMatch) return false;

                    // Check if show hasn't ended yet
                    return item.start_time >= currentTime || item.end_time >= currentTime;
                });

                // Get next 4 upcoming shows
                setSchedule(filteredSchedule.slice(0, 4));
            } catch (err: any) {
                console.error('Error fetching schedule:', err);
                setError(err.message || 'Failed to load schedule');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
        
        // Refresh schedule every minute
        const interval = setInterval(fetchSchedule, 60000);
        return () => clearInterval(interval);
    }, []);

    // Fetch and subscribe to live chat messages
    useEffect(() => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('livechatmessages')
                .select('id, username, message, timestamp, isverified, userid')
                .eq('roomid', 'main')
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching chat messages:', error);
                return;
            }

            if (data) {
                setChatMessages(data.reverse()); // Reverse to show oldest first
            }
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('live-chat')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'livechatmessages',
                    filter: 'roomid=eq.main',
                },
                (payload) => {
                    const newMessage = payload.new as ChatMessage;
                    setChatMessages((prev) => [...prev, newMessage]);
                    // Scroll to bottom
                    setTimeout(() => {
                        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Fetch current live event and viewer count
    useEffect(() => {
        const fetchLiveEvent = async () => {
            const supabase = getSupabaseBrowserClient();
            if (!supabase) return;

            try {
                // Get current live event
                const { data, error } = await supabase
                    .from('live_events')
                    .select('id, title, description, viewer_count, status, is_featured')
                    .eq('status', 'live')
                    .order('scheduled_start', { ascending: false })
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                    console.error('Error fetching live event:', error);
                    return;
                }

                if (data) {
                    setCurrentEvent(data);
                    setViewerCount(data.viewer_count || 0);
                } else {
                    // If no live event, use a default count or fetch from schedule
                    setViewerCount(0);
                }
            } catch (err) {
                console.error('Error fetching live event:', err);
            }
        };

        fetchLiveEvent();
        
        // Update viewer count periodically (simulate real-time updates)
        const interval = setInterval(() => {
            // In a real app, this would be updated via Realtime or a separate API
            // For now, we'll just refresh the event data
            fetchLiveEvent();
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Format time from HH:MM:SS to readable format
    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Format timestamp for chat messages
    const formatChatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const hours = Math.floor(diffInMinutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        return date.toLocaleDateString();
    };

    // Send chat message
    const sendMessage = async () => {
        if (!chatInput.trim() || sendingMessage) return;
        if (!user) {
            alert('Please sign in to send messages');
            return;
        }

        setSendingMessage(true);
        const supabase = getSupabaseBrowserClient();
        
        if (!supabase) {
            setSendingMessage(false);
            return;
        }

        try {
            const username = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';
            
            const { error } = await supabase
                .from('livechatmessages')
                .insert({
                    userid: user.id,
                    username: username,
                    message: chatInput.trim(),
                    roomid: 'main',
                    isverified: false, // Can be verified by admin later
                });

            if (error) throw error;

            setChatInput('');
        } catch (err: any) {
            console.error('Error sending message:', err);
            alert('Failed to send message. Please try again.');
        } finally {
            setSendingMessage(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#203E3F] to-background flex flex-col pt-24">

            {/* Enhanced Header Section with Toggle */}
            <section className="bg-transparent py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Live Indicator & Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Live Now</span>
                        </div>
                        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-3">
                            Kingdom Principles
                        </h1>
                        <p className="text-white/70 text-lg">with Rev. Sarah Johnson</p>
                    </div>

                    {/* Modern Segmented Toggle */}
                    <div className="flex justify-center">
                        <div className="inline-flex bg-white/5 backdrop-blur-md rounded-2xl p-1 gap-1 border border-white/10 shadow-xl">
                            <button
                                onClick={() => setActiveMode('audio')}
                                className={`flex items-center gap-3 px-10 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                                    activeMode === 'audio'
                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/20 scale-[1.02]'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Headphones className="w-5 h-5" />
                                <span>Audio Stream</span>
                            </button>
                            <button
                                onClick={() => setActiveMode('video')}
                                className={`flex items-center gap-3 px-10 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                                    activeMode === 'video'
                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/20 scale-[1.02]'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Video className="w-5 h-5" />
                                <span>Video Stream</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Unified Content Section - Same structure, different content */}
            <section className="py-12 bg-background flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        
                        {/* Main Content Area - Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Media Player Area with smooth transition */}
                            <div className="relative">
                                {activeMode === 'audio' ? (
                                    <div className="animate-in fade-in duration-500">
                                        <ListenSection />
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-500">
                                        {/* Video Player */}
                                        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl relative border border-white/5">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                                        <Video className="w-10 h-10 text-white/70" />
                                                    </div>
                                                    <p className="text-white/90 text-xl font-semibold mb-2">Live Video Stream</p>
                                                    <p className="text-white/50 text-sm">Video player will be embedded here</p>
                                                </div>
                                            </div>
                                            {/* Live Badge Overlay */}
                                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 rounded-full flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                                <span className="text-white text-xs font-bold uppercase">Live</span>
                                            </div>
                                            {/* Viewer Count */}
                                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-white" />
                                                <span className="text-white text-xs font-semibold">
                                                    {viewerCount > 0 ? `${viewerCount.toLocaleString()} watching` : 'Live'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Program Details - Consistent for both modes */}
                            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                                <h3 className="text-2xl font-bold text-foreground mb-4">
                                    {activeMode === 'audio' ? 'About This Program' : 'About This Broadcast'}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    Discover the profound truths of the Gospel in this daily teaching series. 
                                    Rev. Sarah explores how to live out Kingdom values in today's fast-paced world, 
                                    focusing on faith, integrity, and grace.
                                    {activeMode === 'video' && ' Interactive Q&A session follows the main teaching.'}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 rounded-xl shadow-md">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Join Live Chat
                                    </Button>
                                    <Button variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary/10 rounded-xl">
                                        View Host Bio
                                    </Button>
                                </div>
                            </div>

                            {/* Interactive Features - Audio mode only */}
                            {activeMode === 'audio' && (
                                <div className="grid sm:grid-cols-2 gap-6 animate-in fade-in duration-500">
                                    <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-all cursor-pointer group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                                <MessageCircle className="w-6 h-6 text-secondary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-1 text-foreground">Interactive Chat</h4>
                                                <p className="text-sm text-muted-foreground">Share your thoughts and connect with listeners worldwide.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-all cursor-pointer group">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center flex-shrink-0 transition-colors">
                                                <Users className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-1 text-foreground">Group Prayer</h4>
                                                <p className="text-sm text-muted-foreground">Join our periodic live prayer sessions during the broadcast.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Right Column (adapts based on mode) */}
                        <div className="space-y-6">
                            
                            {activeMode === 'audio' ? (
                                /* Schedule for Audio Mode */
                                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm sticky top-24 animate-in fade-in duration-500">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-secondary" />
                                        Coming Up Next
                                    </h3>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-secondary animate-spin" />
                                        </div>
                                    ) : error ? (
                                        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-destructive" />
                                                <p className="text-sm text-destructive">{error}</p>
                                            </div>
                                        </div>
                                    ) : schedule.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No upcoming shows scheduled
                                        </p>
                                    ) : (
                                        <div className="space-y-5">
                                            {schedule.map((item, i) => (
                                                <div key={item.id} className="flex gap-4 group cursor-pointer">
                                                    <div className="flex items-center gap-2 text-secondary text-sm font-bold whitespace-nowrap pt-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatTime(item.start_time)}
                                                    </div>
                                                    <div className={`pb-5 border-b border-border/60 flex-1 ${i === schedule.length - 1 ? 'border-0 pb-0' : ''}`}>
                                                        <h4 className="font-bold text-foreground group-hover:text-secondary transition-colors">
                                                            {item.show_title}
                                                        </h4>
                                                        {item.hosts && (
                                                            <p className="text-sm text-muted-foreground">with {item.hosts}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <Button variant="ghost" className="w-full mt-8 text-secondary font-bold hover:bg-secondary/10 rounded-xl">
                                        Full Weekly Schedule
                                    </Button>
                                </div>
                            ) : (
                                /* Live Chat for Video Mode */
                                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-[600px] sticky top-24 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <MessageCircle className="w-5 h-5 text-secondary" />
                                            Live Chat
                                        </h3>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                            {onlineCount > 0 ? `${onlineCount} online` : 'Chat'}
                                        </span>
                                    </div>
                                    
                                    {/* Chat Messages Area */}
                                    <div className="flex-1 bg-muted/30 rounded-xl p-4 mb-4 overflow-y-auto">
                                        {chatMessages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-xs text-center text-muted-foreground">
                                                    No messages yet. Be the first to say something!
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {chatMessages.map((msg) => (
                                                    <div key={msg.id} className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            msg.isverified 
                                                                ? 'bg-secondary/20' 
                                                                : 'bg-muted'
                                                        }`}>
                                                            <span className={`text-xs font-bold ${
                                                                msg.isverified 
                                                                    ? 'text-secondary' 
                                                                    : 'text-muted-foreground'
                                                            }`}>
                                                                {msg.username.substring(0, 2).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm">
                                                                <span className="font-semibold">{msg.username}</span>
                                                                {msg.isverified && (
                                                                    <span className="ml-1 text-xs text-secondary">✓</span>
                                                                )}
                                                                <span className="text-muted-foreground text-xs ml-2">
                                                                    {formatChatTime(msg.timestamp)}
                                                                </span>
                                                            </p>
                                                            <p className="text-sm text-muted-foreground break-words">
                                                                {msg.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div ref={chatEndRef} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Chat Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder={user ? "Type your message..." : "Sign in to chat"}
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            disabled={!user || sendingMessage}
                                            className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <Button 
                                            size="sm" 
                                            className="bg-secondary text-white hover:bg-secondary/90 px-6 rounded-xl disabled:opacity-50"
                                            onClick={sendMessage}
                                            disabled={!user || sendingMessage || !chatInput.trim()}
                                        >
                                            {sendingMessage ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
