"use client"
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import heroImage from "@/assets/hero.webp";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Luxury car on the road"
          fill
          priority
          className="object-cover"
        />
        {/* Modern dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight text-white/80 mb-6 font-display"
          >
            <span className="text-primary font-mono p-0 m-0">
              Hashiri.
            </span>
            <br />
            <span className="">Feel the Drive</span>
            <br />
            
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-lg text-white/70 max-w-md mb-10 leading-relaxed font-body"
          >
            Experience the freedom of the open road with our curated fleet of premium vehicles. Fast booking, transparent pricing, zero hassle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          >
            <Button size="lg" className="   px-8 gap-2 text-base">
              Browse Cars <ArrowRight size={18} />
            </Button>

          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex gap-10 mt-16"
          >
            {[
              { value: "500+", label: "Vehicles" },
              { value: "10k+", label: "Happy Clients" },
              { value: "50+", label: "Locations" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white font-display">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
