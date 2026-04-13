"use client"
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Sarah M.", role: "Business Traveler", text: "Incredibly smooth experience. The car was spotless and the booking took less than a minute. Will definitely use again.", rating: 5 },
  { name: "James K.", role: "Weekend Explorer", text: "Best rental service I've ever used. The luxury fleet is unmatched, and the prices are surprisingly fair.", rating: 5 },
  { name: "Priya L.", role: "Daily Commuter", text: "Their electric vehicles are fantastic. Clean, quiet, and the charging network makes it stress-free.", rating: 5 },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 font-display text-foreground">
            Loved by Thousands
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Don't just take our word for it — hear from our satisfied customers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="   border border-border bg-card p-8"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="text-card-foreground mb-6 leading-relaxed text-sm">"{t.text}"</p>
              <div>
                <p className="font-semibold text-card-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
