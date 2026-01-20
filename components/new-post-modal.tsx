"use client";

import { useState } from "react";
import {
    X,
    Send,
    EyeOff,
    Info,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMMUNITY_CATEGORIES } from "./community-feed";

interface NewPostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
    const [selectedCategory, setSelectedCategory] = useState("Prayers");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
            // Reset form
            setTitle("");
            setContent("");
            setIsAnonymous(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-card border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-serif">Create Global Post</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Sharing with the Kingdom</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {/* Category Selection */}
                    <section>
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Select Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {COMMUNITY_CATEGORIES.filter(c => c.id !== "all").map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 relative overflow-hidden group ${selectedCategory === cat.id
                                            ? "border-secondary bg-secondary/5 ring-4 ring-secondary/5"
                                            : "border-border bg-muted/30 hover:border-muted-foreground/30"
                                        }`}
                                >
                                    <cat.icon className={`w-6 h-6 ${selectedCategory === cat.id ? "text-secondary" : "text-muted-foreground"}`} />
                                    <span className={`text-xs font-bold ${selectedCategory === cat.id ? "text-secondary" : "text-muted-foreground"}`}>
                                        {cat.label}
                                    </span>
                                    {selectedCategory === cat.id && (
                                        <div className="absolute top-1 right-1">
                                            <Check className="w-3 h-3 text-secondary" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Title & Content */}
                    <section className="space-y-6">
                        <div>
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Title</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Give your post a title..."
                                className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                                required
                            />
                            <div className="text-[10px] text-right mt-2 font-bold text-muted-foreground uppercase">{title.length}/100</div>
                        </div>

                        <div>
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Details</label>
                            <textarea
                                placeholder="What would you like to share today?"
                                className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all min-h-[200px] resize-none leading-relaxed"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                maxLength={1000}
                                required
                            />
                            <div className="text-[10px] text-right mt-2 font-bold text-muted-foreground uppercase">{content.length}/1000</div>
                        </div>
                    </section>

                    {/* Anonymity & Info */}
                    <section className="space-y-4">
                        <div
                            className={`flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer ${isAnonymous
                                    ? "bg-secondary/5 border-secondary/30 ring-4 ring-secondary/5"
                                    : "bg-muted/30 border-border"
                                }`}
                            onClick={() => setIsAnonymous(!isAnonymous)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isAnonymous ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                                    }`}>
                                    <EyeOff className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Post Anonymously</h4>
                                    <p className="text-sm text-muted-foreground">Your identity will be hidden from everyone.</p>
                                </div>
                            </div>
                            <div className={`w-14 h-8 rounded-full p-1 transition-colors ${isAnonymous ? "bg-secondary" : "bg-muted-foreground/30"}`}>
                                <div className={`w-6 h-6 bg-white rounded-full transition-transform transform ${isAnonymous ? "translate-x-6" : "translate-x-0"}`} />
                            </div>
                        </div>

                        <div className="flex gap-4 p-6 bg-primary/5 border border-primary/10 rounded-3xl">
                            <Info className="w-6 h-6 text-primary flex-shrink-0" />
                            <p className="text-sm text-primary/80 leading-relaxed italic">
                                {isAnonymous
                                    ? "Your post will be shared without your profile details. Privacy is strictly maintained."
                                    : "Visible to the whole community. Others can interact, support, and pray with you."
                                }
                            </p>
                        </div>
                    </section>
                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-border bg-muted/30 flex items-center justify-between gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl px-6 h-12 font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title || !content}
                        className="flex-1 bg-secondary text-white hover:bg-secondary/90 h-12 rounded-xl gap-2 font-bold shadow-lg disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Sharing with Community...</span>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Post {selectedCategory}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
