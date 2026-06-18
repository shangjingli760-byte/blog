"use client";

import React, { useEffect, useRef } from "react";

type Pixel = {
  x: number; y: number; color: string; ctx: CanvasRenderingContext2D;
  speed: number; size: number; sizeStep: number; minSize: number;
  maxSizeInt: number; maxSize: number; delay: number; counter: number;
  counterStep: number; isIdle: boolean; isReverse: boolean; isShimmer: boolean;
  draw: () => void; appear: () => void; disappear: () => void; shimmer: () => void;
};

function createPixel(
  ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement,
  x: number, y: number, color: string, baseSpeed: number, delay: number
): Pixel {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;
  const p: Pixel = {
    x, y, color, ctx,
    speed: rand(0.08, 0.4) * baseSpeed,
    size: 0, sizeStep: rand(0.12, 0.28), minSize: 0.5, maxSizeInt: 2,
    maxSize: rand(0.5, 2), delay, counter: 0,
    counterStep: rand(1.8, 3.2) + (canvas.width + canvas.height) * 0.008,
    isIdle: false, isReverse: false, isShimmer: false,
    draw() {
      const offset = p.maxSizeInt * 0.5 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
    },
    appear() {
      p.isIdle = false;
      if (p.counter <= p.delay) { p.counter += p.counterStep; return; }
      if (p.size >= p.maxSize) p.isShimmer = true;
      if (p.isShimmer) p.shimmer(); else p.size += p.sizeStep;
      p.draw();
    },
    disappear() {
      p.isShimmer = false; p.counter = 0;
      if (p.size <= 0) { p.isIdle = true; return; }
      p.size -= 0.1; p.draw();
    },
    shimmer() {
      if (p.size >= p.maxSize) p.isReverse = true;
      else if (p.size <= p.minSize) p.isReverse = false;
      if (p.isReverse) p.size -= p.speed; else p.size += p.speed;
    },
  };
  return p;
}

type PixelCanvasProps = {
  colors: string[];
  gap?: number;
  speed?: number;
  opacity?: number;
  className?: string;
};

export function PixelCanvas({ colors, gap = 5, speed = 30, opacity = 1, className = "" }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const rafRef = useRef<number>(0);
  // 记录上次初始化时的尺寸，只有宽度真正变化才重建
  const lastSizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || colors.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── 初始化像素 ──────────────────────────────────────────────────
    function init() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
      if (!ctx) return;

      const w = Math.floor(window.innerWidth);
      const h = Math.floor(window.innerHeight);
      const dpr = window.devicePixelRatio || 1;

      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      lastSizeRef.current = { w, h };

      const effectiveSpeed = reducedMotion ? 0 : Math.min(speed, 100) * 0.001;
      const pixels: Pixel[] = [];

      for (let x = 0; x < w; x += gap) {
        for (let y = 0; y < h; y += gap) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const dx = x - w / 2, dy = y - h / 2;
          const delay = reducedMotion ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.65;
          pixels.push(createPixel(ctx, canvas, x, y, color, effectiveSpeed, delay));
        }
      }
      pixelsRef.current = pixels;
    }

    // ── RAF 循环 ─────────────────────────────────────────────────────
    function startLoop(mode: "appear" | "disappear") {
      cancelAnimationFrame(rafRef.current);
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;

      const loop = () => {
        rafRef.current = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        const pixels = pixelsRef.current;
        for (const p of pixels) p[mode]();
        if (pixels.every((p) => p.isIdle)) cancelAnimationFrame(rafRef.current);
      };

      rafRef.current = requestAnimationFrame(loop);
    }

    init();
    startLoop("appear");

    // ── resize：只响应真实窗口宽度变化（忽略移动端地址栏高度抖动）─────
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newW = Math.floor(window.innerWidth);
        // 宽度没变（只是移动端地址栏收起导致高度微变）→ 跳过重建
        if (newW === lastSizeRef.current.w) return;
        init();
        startLoop("appear");
      }, 250);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(rafRef.current);
    };
    // colors / gap / speed 变化才真正需要重建；故意不把 init/startLoop 列入依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, gap, speed]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} style={{ opacity }}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ willChange: "contents", transform: "translateZ(0)" }}
      />
    </div>
  );
}
