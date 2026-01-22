"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth-context";

interface ReportModalProps {
    contentId: string;
    contentType: 'thread' | 'comment';
    isOpen: boolean;
    onClose: () => void;
    contentTitle?: string;
}

const REPORT_REASONS = [
    "Inappropriate content",
    "Hate speech or harassment",
    "Spam or misleading",
    "Incorrect kingdom principles",
    "Privacy violation",
    "Other"
];

export function ReportModal({ contentId, contentType, isOpen, onClose, contentTitle }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const handleSubmit = async () => {
        if (!user) {
            setError("Please sign in to report content");
            return;
        }
        if (!selectedReason) {
            setError("Please select a reason for your report");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            setError("Failed to connect to database");
            setIsSubmitting(false);
            return;
        }

        try {
            const { error: insertError } = await supabase
                .from('reports')
                .insert({
                    reporter_id: user.id,
                    content_id: contentId,
                    content_type: contentType,
                    reason: selectedReason,
                    details: details.trim() || null,
                });

            if (insertError) {
                if (insertError.code === '42P01') {
                    throw new Error("The reporting system is currently being set up. Please try again later.");
                }
                throw insertError;
            }

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setSelectedReason("");
                setDetails("");
            }, 2000);
        } catch (err: any) {
            console.error('Error submitting report:', err);
            setError(err.message || "Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2 text-foreground font-bold">
                        <AlertTriangle className="w-5 h-5 text-secondary" />
                        Report {contentType === 'thread' ? 'Discussion' : 'Comment'}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isSuccess ? (
                        <div className="text-center py-12 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Report Received</h3>
                                <p className="text-muted-foreground mt-2">
                                    Thank you for helping keep our community safe. Our team will review this shortly.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {contentTitle && (
                                <div className="bg-muted/50 rounded-xl p-3 border border-border">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Target</p>
                                    <p className="text-sm font-medium text-foreground line-clamp-1">{contentTitle}</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground">Why are you reporting this?</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {REPORT_REASONS.map((reason) => (
                                        <button
                                            key={reason}
                                            onClick={() => setSelectedReason(reason)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left border ${selectedReason === reason
                                                    ? "bg-secondary/10 border-secondary text-secondary"
                                                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedReason === reason ? "border-secondary" : "border-muted-foreground/30"
                                                }`}>
                                                {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-secondary" />}
                                            </div>
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground">Additional details (optional)</label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Provide more context..."
                                    className="w-full min-h-[100px] p-4 bg-muted/30 border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:bg-muted/50 transition-all resize-none"
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 rounded-xl h-12 font-bold"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !selectedReason}
                                    className="flex-1 bg-secondary text-white hover:bg-secondary/90 rounded-xl h-12 font-bold shadow-lg"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Submit Report"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
