"use client"
import { Search, CalendarCheck, Car } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: Search, step: "01", title: "Choose Your Car", description: "Browse our fleet and pick the perfect vehicle for your trip." },
  { icon: CalendarCheck, step: "02", title: "Book Instantly", description: "Select your dates, confirm your reservation in seconds." },
  { icon: Car, step: "03", title: "Hit the Road", description: "Pick up your keys and enjoy the ride. It's that simple." },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 font-display text-foreground">
            Three Steps to Freedom
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Renting a car has never been this easy. Get on the road in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="absolute w-full hidden md:flex justify-center top-8 left-0 gap-18">
            <div className="bg-border h-px w-[28%]" />
            <div className="bg-border h-px w-[28%]" />
          </div>
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="w-16 h-16    bg-primary/10 flex items-center justify-center mx-auto mb-6 relative z-10">
                <s.icon size={28} className="text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Step {s.step}</span>
              <h3 className="text-xl font-bold mb-2 font-display text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
