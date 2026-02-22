'use client';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardNavBar } from '@/app/components/dashboard/NavBar';
import { PromptArea } from '@/app/components/dashboard/PromptArea';
import { HistorySidebar, HistoryItem } from '@/app/components/dashboard/HistorySidebar';
import { createClient } from '@/app/lib/supabase/client';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // 로그인 후 Supabase에서 과거 생성 기록 로드
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('chats')
      .select('id, prompt, image_url, response_text, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          setHistory(
            data.map((row) => ({
              id: row.id as string,
              imageUrl: row.image_url as string,
              text: (row.response_text as string) ?? '',
              prompt: (row.prompt as string) ?? '',
            }))
          );
        }
      });
  }, [user]);

  const handleResult = (imageUrl: string, text: string, prompt: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      imageUrl,
      text,
      prompt,
    };
    setHistory((prev) => [newItem, ...prev]);
  };

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

      {/* 레이아웃: 사이드바 + 메인 */}
      <div className="relative z-10 flex min-h-screen">

        {/* 왼쪽 히스토리 사이드바 */}
        <HistorySidebar history={history} />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 flex items-center justify-center px-6 py-12 min-h-screen">
          <PromptArea onResult={handleResult} />
        </main>

      </div>
    </div>
  );
}
