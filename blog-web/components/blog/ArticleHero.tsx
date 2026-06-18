import React from "react";
import { ShimmerText } from "@/components/effects/ShimmerText";
import { Badge } from "@/components/ui/badge";

interface ArticleHeroProps {
  title: string;
  date: string;
  tags?: string;
  summary?: string;
}

export function ArticleHero({ title, date, tags, summary }: ArticleHeroProps) {
  const tagArray = tags ? tags.split(",").map((t) => t.trim()) : [];

  return (
    <header className="mb-8 md:mb-12">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
          <ShimmerText as="span">{title}</ShimmerText>
        </h1>
        {summary && (
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {summary}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base">
        <time className="text-muted-foreground">{date}</time>

        {tagArray.length > 0 && (
          <>
            <span className="text-muted-foreground/50">·</span>
            <div className="flex flex-wrap gap-2">
              {tagArray.map((tag) => (
                <Badge key={tag} variant="glow">
                  {tag}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Gradient Divider */}
      <div className="mt-6 md:mt-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </header>
  );
}
