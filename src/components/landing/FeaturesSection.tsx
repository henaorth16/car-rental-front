"use client"
import { Shield, Clock, DollarSign, MapPin, Headphones, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Clock, title: "Instant Booking", description: "Reserve your car in under 2 minutes with our streamlined booking process." },
  { icon: Shield, title: "Fully Insured", description: "Every rental includes comprehensive insurance for complete peace of mind." },
  { icon: DollarSign, title: "Best Pricing", description: "Transparent pricing with no hidden fees. What you see is what you pay." },
  { icon: MapPin, title: "50+ Locations", description: "Pick up and drop off at any of our convenient city-center locations." },
  { icon: Headphones, title: "24/7 Support", description: "Our dedicated support team is always ready to assist you on the road." },
  { icon: Zap, title: "Flexible Plans", description: "Hourly, daily, or weekly — choose the plan that fits your journey." },
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-background" id="about">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Why Choose Us</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 font-display text-foreground">
            Everything You Need for a Perfect Ride
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We've designed every aspect of our service to deliver a seamless, premium car rental experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group    border border-border bg-card p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12    bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground font-display">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
