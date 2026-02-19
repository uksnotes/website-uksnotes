'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    setIsPending(true);
    await signInWithGoogle();
    setIsPending(false);
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:72px_72px]" />
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_30%,#000_100%)]" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-3 mb-10"
        >
          <Link href="/">
            <motion.div
              whileHover={{ x: -3 }}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-jua)' }}>
                Back
              </span>
            </motion.div>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-px w-12 bg-white/10" />
            <span className="text-white/30 text-[10px] tracking-[0.25em] uppercase" style={{ fontFamily: 'var(--font-jua)' }}>
              Sign in to continue
            </span>
            <div className="h-px w-12 bg-white/10" />
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="border border-white/10 bg-white/[0.03] p-8 flex flex-col gap-6"
        >
          {/* Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl text-white tracking-tight" style={{ fontFamily: 'var(--font-jua)' }}>
              시작하기
            </h1>
            <p className="text-white/35 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-jua)' }}>
              AI YouTube Thumbnail Generator
            </p>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-px bg-white/10 w-full"
          />

          {/* Google Login Button */}
          <motion.button
            onClick={handleGoogleLogin}
            disabled={isPending}
            whileHover={!isPending ? { backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.3)' } : {}}
            whileTap={!isPending ? { scale: 0.98 } : {}}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-white/15 bg-white/[0.04] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              /* Loading spinner */
              <motion.svg
                width="18" height="18" viewBox="0 0 18 18" fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <circle cx="9" cy="9" r="7" stroke="white" strokeOpacity="0.2" strokeWidth="2"/>
                <path d="M9 2A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </motion.svg>
            ) : (
              /* Google SVG */
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            <span className="text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-jua)' }}>
              {isPending ? '로그인 중...' : 'Google로 계속하기'}
            </span>
          </motion.button>

          {/* Terms */}
          <p className="text-center text-white/20 text-[10px] leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-jua)' }}>
            계속 진행하면{' '}
            <span className="underline underline-offset-2 cursor-pointer hover:text-white/40 transition-colors">이용약관</span>
            {' '}및{' '}
            <span className="underline underline-offset-2 cursor-pointer hover:text-white/40 transition-colors">개인정보처리방침</span>
            에 동의하는 것으로 간주됩니다.
          </p>
        </motion.div>

      </div>
    </main>
  );
}
