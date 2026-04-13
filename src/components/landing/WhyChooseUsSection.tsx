"use client"
import { motion } from "framer-motion";
import { Shield, Award, Clock, ThumbsUp } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import whyPremium from "@/assets/why-premium.jpg";
import whyService from "@/assets/why-service.jpg";
import whyFleet from "@/assets/why-fleet.jpg";
import whyEasy from "@/assets/why-easy.jpg";
import Image from "next/image";

const slides = [
  {
    image: whyPremium,
    icon: Award,
    title: "Premium Quality Vehicles",
    description: "Every car in our fleet is meticulously maintained and inspected before each rental, ensuring you always drive in style and safety.",
    stat: "500+",
    statLabel: "Premium Cars",
  },
  {
    image: whyService,
    icon: ThumbsUp,
    title: "Exceptional Customer Service",
    description: "Our dedicated team goes above and beyond to make your rental experience seamless from pickup to return.",
    stat: "98%",
    statLabel: "Satisfaction Rate",
  },
  {
    image: whyFleet,
    icon: Shield,
    title: "Fully Insured & Protected",
    description: "Drive with complete peace of mind. Every rental includes comprehensive insurance coverage at no extra cost.",
    stat: "100%",
    statLabel: "Insured Fleet",
  },
  {
    image: whyEasy,
    icon: Clock,
    title: "Book in Under 2 Minutes",
    description: "Our streamlined digital platform lets you browse, compare, and book your ideal car faster than ever before.",
    stat: "2 min",
    statLabel: "Avg. Booking Time",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="py-16 bg-background" id="why-us">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-3 font-display text-foreground">
            The Hashiri Difference
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Thousands of happy customers trust us for reliable, premium car rentals. Here's why.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Carousel
            opts={{ loop: true, align: "start" }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {slides.map((slide) => (
                <CarouselItem key={slide.title} className="pl-4 md:basis-1/2">
                  <div className="group relative overflow-hidden    border border-border bg-card h-[420px]">
                    {/* Image */}
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      loading="lazy"
                      width={1024}
                      height={640}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-8">
                      {/* Stat badge */}
                      <div className="absolute top-5 right-5 bg-primary/90 backdrop-blur-sm    px-4 py-2 text-center">
                        <span className="block text-xl font-bold text-primary-foreground font-display">
                          {slide.stat}
                        </span>
                        <span className="text-[11px] text-primary-foreground/80 uppercase tracking-wider">
                          {slide.statLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10   bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                          <slide.icon size={20} className="text-primary-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-white font-display">
                          {slide.title}
                        </h3>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed max-w-md">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-3 mt-6">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" />
              <CarouselNext className="static translate-y-0 h-10 w-10 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
