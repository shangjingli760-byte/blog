'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/', label: '首页' },
    { href: '/articles', label: '文章' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[rgba(5,5,8,0.85)] backdrop-blur-xl border-b border-white/[0.05] shadow-[0_1px_0_rgba(255,255,255,0.03)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="select-none">
          <AnimatedGradientText
            colorFrom="#a855f7"
            colorTo="#6366f1"
            speed={1.5}
            className="text-base sm:text-lg font-black tracking-tighter"
          >
            BLOG
          </AnimatedGradientText>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  active
                    ? 'text-white/90'
                    : 'text-white/35 hover:text-white/60'
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg bg-white/[0.06]" />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
