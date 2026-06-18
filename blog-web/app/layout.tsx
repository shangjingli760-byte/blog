import type { Metadata } from 'next';
import '@/app/globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'My Blog - 技术博客',
  description: '精心打造的技术博客，分享开发经验、技术见解和最佳实践',
};

// 根布局组件
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={cn("dark", "font-sans", inter.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
