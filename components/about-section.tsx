import { Heart, BookOpen, Users, Globe } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Faith-Centered",
    description:
      "Every broadcast is rooted in biblical principles and designed to strengthen your relationship with God.",
  },
  {
    icon: BookOpen,
    title: "Biblical Teaching",
    description:
      "In-depth studies and expository teachings that help you understand and apply God's Word.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join a global family of believers united in faith, prayer, and the pursuit of God's kingdom.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Broadcasting to listeners worldwide, bringing the message of hope to every corner of the earth.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-sm font-medium text-secondary uppercase tracking-wider">
            Our Mission
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Spreading the Gospel Through the Airwaves
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            God Kingdom Principles Radio is dedicated to proclaiming the
            transformative message of Jesus Christ to listeners around the
            world. Through powerful teaching, uplifting music, and
            Spirit-filled programming, we aim to equip believers and reach the
            lost.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-xl p-6 border border-border hover:border-secondary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-12">
          {[
            { value: "24/7", label: "Broadcasting" },
            { value: "150+", label: "Countries Reached" },
            { value: "1M+", label: "Monthly Listeners" },
            { value: "10+", label: "Years of Ministry" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-secondary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
