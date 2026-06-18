"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShimmerText } from "@/components/effects/ShimmerText";
import { GlassContainer } from "@/components/effects/GlassContainer";
import { GradientButton } from "@/components/ui/gradient-button";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export function HeroSection({
  title = "Modern",
  subtitle = "Blog.",
  description = "精心打造的技术博客，分享开发经验、技术见解和最佳实践。探索前沿技术，提升开发技能。",
  ctaText = "浏览文章",
  ctaLink = "#articles",
  secondaryCtaText = "关于我",
  secondaryCtaLink = "/about",
}: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToArticles = (e: React.MouseEvent) => {
    if (ctaLink.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(ctaLink);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full min-h-[80vh] md:min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 py-16 md:py-24">
      {/* Hero Title */}
      <div
        className={`text-center mb-8 md:mb-12 transition-all duration-1000 transform ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1 className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 lg:gap-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-none mb-4">
          <ShimmerText as="span" className="font-serif italic font-medium">
            {title}
          </ShimmerText>
          <ShimmerText as="span" className="font-sans font-extrabold tracking-tighter">
            {subtitle}
          </ShimmerText>
        </h1>
      </div>

      {/* Description */}
      <div
        className={`text-center mb-10 md:mb-14 transition-all duration-1000 transform ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        <GlassContainer variant="default" className="max-w-[95%] sm:max-w-md md:max-w-2xl mx-auto px-6 py-4 md:px-8 md:py-6">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-foreground/90 leading-relaxed">
            {description}
          </p>
        </GlassContainer>
      </div>

      {/* CTA Buttons */}
      <div
        className={`flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 transition-all duration-1000 transform ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transitionDelay: "400ms" }}
      >
        <GradientButton size="lg" onClick={scrollToArticles} asChild={ctaLink.startsWith("/")}>
          {ctaLink.startsWith("/") ? (
            <Link href={ctaLink}>
              {ctaText}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          ) : (
            <>
              {ctaText}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </>
          )}
        </GradientButton>

        {secondaryCtaText && secondaryCtaLink && (
          <GlassContainer
            variant="strong"
            glow
            className="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            as="div"
          >
            <Link
              href={secondaryCtaLink}
              className="inline-flex h-12 md:h-14 items-center justify-center gap-2 px-6 md:px-10 text-sm md:text-base font-semibold text-foreground"
            >
              {secondaryCtaText}
            </Link>
          </GlassContainer>
        )}
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
          isLoaded ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "600ms" }}
      >
        <div className="animate-float">
          <svg
            className="w-6 h-6 text-foreground/60"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
