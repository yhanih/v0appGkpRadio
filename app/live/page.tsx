import { ListenSection } from "@/components/listen-section";
import { LiveCommunityBar } from "@/components/live-community-bar";
import { Radio, Users, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LivePage() {
    return (
        <main className="min-h-screen bg-[#203E3F] flex flex-col">
            {/* Live Status Bar */}
            <div className="pt-24 bg-gray-50">
                <LiveCommunityBar />
            </div>

            {/* Main Player Section */}
            <ListenSection />

            {/* Live Details & Schedule */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left: About Current Program */}
                        <div className="lg:col-span-2">
                            <div className="mb-12">
                                <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-4 block">
                                    On Air Now
                                </span>
                                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
                                    Kingdom Principles with Rev. Sarah Johnson
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                    Discover the profound truths of the Gospel in this daily teaching
                                    series. Rev. Sarah explores how to live out Kingdom values in
                                    today's fast-paced world, focusing on faith, integrity, and grace.
                                </p>
                                <div className="flex gap-4">
                                    <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 px-8 rounded-xl shadow-lg">
                                        Join Live Chat
                                    </Button>
                                    <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-muted px-8 rounded-xl">
                                        View Host Bio
                                    </Button>
                                </div>
                            </div>

                            {/* Interactions Callout */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Interactive Chat</h4>
                                        <p className="text-sm text-muted-foreground">Share your thoughts and connect with listeners worldwide.</p>
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">Group Prayer</h4>
                                        <p className="text-sm text-muted-foreground">Join our periodic live prayer sessions during the broadcast.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Upcoming Schedule */}
                        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-secondary" />
                                Coming Up Next
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { time: "12:00 PM", title: "Worship Hour", host: "Ministry Team" },
                                    { time: "01:00 PM", title: "Afternoon Word", host: "Pastor David" },
                                    { time: "02:30 PM", title: "Youth Voices", host: "Emma & Friends" },
                                    { time: "04:00 PM", title: "Evening Devotion", host: "Rev. Mark" },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="font-bold text-secondary text-sm whitespace-nowrap pt-1">
                                            {item.time}
                                        </div>
                                        <div className="pb-6 border-b border-border/60 flex-1 group-last:border-0 group-last:pb-0">
                                            <h4 className="font-bold text-foreground group-hover:text-secondary transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">with {item.host}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full mt-8 text-secondary font-bold hover:bg-secondary/5">
                                Full Weekly Schedule
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
