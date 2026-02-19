'use client';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardNavBar } from '@/app/components/dashboard/NavBar';
import { PromptArea } from '@/app/components/dashboard/PromptArea';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.svg
          width="24" height="24" viewBox="0 0 24 24" fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.15" strokeWidth="2"/>
          <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </motion.svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:72px_72px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,#000_100%)] pointer-events-none" />

      {/* 플로팅 NavBar */}
      <DashboardNavBar />

      {/* 메인: 화면 중앙 정렬 */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <PromptArea />
      </main>
    </div>
  );
}
