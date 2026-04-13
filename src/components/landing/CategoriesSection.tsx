"use client"
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import suvImage from "@/assets/suv.jpg";
import luxuryImage from "@/assets/luxury.jpg";
import electricImage from "@/assets/electric.jpg";
import sedanImage from "@/assets/sedan.jpg";

const categories = [
  { name: "SUV", description: "Spacious and powerful for every adventure", price: "From 1,000ETB/day", image: suvImage },
  { name: "Sedan", description: "Comfort and elegance for city driving", price: "From 1,600ETB/day", image: sedanImage },
  { name: "Luxury", description: "Make a statement with premium performance", price: "From 10,000ETB/day", image: luxuryImage },
  { name: "Electric", description: "Sustainable driving, zero compromise", price: "From 1,500ETB/day", image: electricImage },
];

export function CategoriesSection() {
  return (
    <section className="py-16 bg-secondary/30" id="categories">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Fleet</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 font-display text-foreground">
            Find Your Perfect Match
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            From compact city cars to luxury SUVs, we have the right vehicle for every occasion.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="overflow-hidden py-0 group cursor-pointer border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-1 font-display text-card-foreground">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">{cat.price}</span>
                    <Button variant="ghost" onClick={() => window.location.assign("/cars")} size="sm" className="gap-1 text-primary hover:text-primary">
                      View <ArrowRight size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
