import Link from "next/link";
import { MessageCircle, Users, Heart, Clock, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const discussions = [
  {
    id: 1,
    category: "Prayer Requests",
    categoryColor: "#7F5A53", // Terracotta/Coral
    title: "Prayer Request: Healing for My Mother",
    excerpt: "Join us in Prayer: My mother undergoes surgery this week. Your prayers strengthen our family.",
    author: "Sarah@NashvilleUSA",
    time: "2 hours ago",
    replies: 18,
  },
  {
    id: 2,
    category: "Testimonies",
    categoryColor: "#AC9258", // Gold
    title: "Testimony: God's Provision in Hard Times",
    excerpt: "We Never Went Hungry: How God provided when I lost my job. His faithfulness never fails.",
    author: "Michael@AtlantaUSA",
    time: "4 hours ago",
    replies: 32,
  },
  {
    id: 3,
    category: "Youth Voices",
    categoryColor: "#2DA072", // Emerald
    title: "Youth Discussion: Faith in College",
    excerpt: "How do you maintain your faith while navigating college life and peer pressure?",
    author: "Emma@DallasUSA",
    time: "6 hours ago",
    replies: 25,
  },
];

const stats = [
  {
    icon: Users,
    value: "2.5K+",
    label: "Community Members",
    color: "#2DA072",
  },
  {
    icon: MessageCircle,
    value: "8.2K",
    label: "Discussions",
    color: "#AC9258",
  },
  {
    icon: Heart,
    value: "45K",
    label: "Prayer Requests",
    color: "#7F5A53",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Community Support",
    color: "#203E3F",
  },
];

export function MinistryFieldsSection() {
  return (
    <section className="py-24 bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
            <Users className="w-3 h-3" />
            Ministry Fields
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Share Stories, Request Prayers & Grow Together
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join 2,500+ believers sharing authentic testimonies, lifting prayers, and building community.
            Your voice is a vital part of our fellowship.
          </p>
        </div>

        {/* Featured Discussions Header */}
        <div className="flex items-center justify-between mb-10 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-secondary" />
            <h3 className="text-2xl font-bold text-foreground">Featured Discussions</h3>
          </div>
          <Button variant="ghost" asChild className="gap-2 text-secondary hover:text-secondary hover:bg-secondary/5 font-bold">
            <Link href="/community?category=all">
              See More discussions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </Button>
        </div>

        {/* Discussion Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {discussions.map((discussion) => (
            <Link
              key={discussion.id}
              href={`/community?category=${discussion.category === 'Prayer Requests' ? 'Prayers' : discussion.category}`}
              className="group bg-card border border-border/60 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
            >
              {/* Category */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="text-[10px] font-bold uppercase px-3 py-1 rounded-full border bg-opacity-5"
                  style={{
                    borderColor: `${discussion.categoryColor}40`,
                    color: discussion.categoryColor,
                    backgroundColor: `${discussion.categoryColor}10`,
                  }}
                >
                  {discussion.category}
                </span>
                <Sparkles className="w-4 h-4 text-accent/30 group-hover:text-accent transition-colors" />
              </div>

              {/* Title */}
              <h4 className="font-serif text-2xl font-bold text-foreground mb-4 line-clamp-2 leading-tight group-hover:text-secondary transition-colors">
                {discussion.title}
              </h4>

              {/* Excerpt */}
              <p className="text-muted-foreground text-base mb-6 line-clamp-3 leading-relaxed">
                {discussion.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-6 pt-6 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                    {discussion.author[0]}
                  </div>
                  <span className="font-semibold text-foreground">{discussion.author}</span>
                </div>
                <span>{discussion.time}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{discussion.replies} replies</span>
                </div>
                <div className="text-sm font-bold text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 group/btn">
                  Join Discussion
                  <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-card border border-border/40 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${stat.color}10` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-secondary/5 rounded-3xl p-12 border border-secondary/10">
          <Button asChild size="lg" className="bg-secondary text-white hover:bg-secondary/90 gap-3 px-10 py-7 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <Link href="/community?category=all">
              <Users className="w-6 h-6" />
              Join our Community
            </Link>
          </Button>
          <p className="text-base text-muted-foreground mt-6 font-medium">
            Share your story, ask for prayer, and connect with fellow believers worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
