// 管理端登录页面
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/adminApi';
import { PixelCanvas } from '@/components/effects/PixelCanvas';
import { GlassContainer } from '@/components/effects/GlassContainer';
import { ShimmerText } from '@/components/effects/ShimmerText';
import { Input } from '@/components/ui/input';
import { GradientButton } from '@/components/ui/gradient-button';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await adminLogin(username, password);
      localStorage.setItem('admin_token', token);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pixelColors = [
    'rgba(162, 89, 255, 0.5)',
    'rgba(94, 129, 244, 0.5)',
    'rgba(0, 255, 255, 0.4)',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Animated Background */}
      <PixelCanvas colors={pixelColors} gap={5} speed={30} opacity={1} />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)] pointer-events-none opacity-80" />

      {/* Login Card */}
      <GlassContainer variant="card" className="relative z-10 p-8 w-full max-w-md animate-scaleIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <ShimmerText>Blog 管理</ShimmerText>
          </h1>
          <p className="text-sm text-muted-foreground">登录以管理您的博客内容</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <GlassContainer variant="strong" className="bg-destructive/10 border-destructive/20 px-4 py-3">
              <p className="text-destructive text-sm">{error}</p>
            </GlassContainer>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              用户名
            </label>
            <Input
              type="text"
              variant="glass"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              密码
            </label>
            <Input
              type="password"
              variant="glass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </div>

          <GradientButton
            type="submit"
            disabled={loading}
            className="w-full"
            size="md"
          >
            {loading ? '登录中...' : '登 录'}
          </GradientButton>
        </form>
      </GlassContainer>
    </div>
  );
}
