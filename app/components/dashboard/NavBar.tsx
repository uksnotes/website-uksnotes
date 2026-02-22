'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export function DashboardNavBar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name ?? user?.email ?? 'User';
  const email = user?.email ?? '';
  const initial = name[0].toUpperCase();

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push('/');
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-5 pointer-events-none">

      {/* 왼쪽: 로고 버튼 */}
      <Link href="/">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          whileTap={{ scale: 0.96 }}
          className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 bg-white/[0.04] border border-white/10 backdrop-blur-md cursor-pointer transition-colors"
        >
          <Image
            src="/uksnote.png"
            alt="uksnote"
            width={22}
            height={22}
            className="invert object-contain"
          />
          <span
            className="text-white text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-jua)' }}
          >
            LunchChat.
          </span>
        </motion.div>
      </Link>

      {/* 오른쪽: 프로필 팝오버 */}
      <div ref={popoverRef} className="pointer-events-auto relative">
        {/* 트리거 버튼 */}
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.04] border border-white/10 backdrop-blur-md cursor-pointer transition-colors"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-white/15 flex items-center justify-center text-[10px] text-white rounded-full">
              {initial}
            </div>
          )}
          <span
            className="text-white/70 text-xs tracking-widest max-w-[120px] truncate hidden sm:block"
            style={{ fontFamily: 'var(--font-jua)' }}
          >
            {name.split(' ')[0]}
          </span>
          <motion.svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/30"
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </motion.button>

        {/* 팝오버 드롭다운 */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full mt-2 w-56 bg-black border border-white/10 backdrop-blur-md overflow-hidden"
            >
              {/* 유저 정보 */}
              <div className="px-4 py-3.5 border-b border-white/8">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={name} width={32} height={32} className="rounded-full flex-shrink-0"/>
                  ) : (
                    <div className="w-8 h-8 bg-white/10 flex items-center justify-center text-xs text-white flex-shrink-0">
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate" style={{ fontFamily: 'var(--font-jua)' }}>{name}</p>
                    <p className="text-[10px] text-white/30 truncate">{email}</p>
                  </div>
                </div>
              </div>

              {/* 메뉴 항목 */}
              <div className="py-1">
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <motion.div
                    whileHover={{ backgroundColor: '#ffffff0a' }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <rect x="1" y="1" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.1"/>
                      <rect x="7.5" y="1" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.1"/>
                      <rect x="1" y="7.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.1"/>
                      <rect x="7.5" y="7.5" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.1"/>
                    </svg>
                    <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-jua)' }}>Dashboard</span>
                  </motion.div>
                </Link>

                <div className="mx-4 my-1 h-px bg-white/8" />

                <motion.button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  whileHover={{ backgroundColor: '#ffffff0a' }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-white/40 hover:text-white transition-colors disabled:opacity-40"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M8 6.5H2M2 6.5L4 4.5M2 6.5L4 8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.5 3.5V2.5C5.5 1.95 5.95 1.5 6.5 1.5H10.5C11.05 1.5 11.5 1.95 11.5 2.5V10.5C11.5 11.05 11.05 11.5 10.5 11.5H6.5C5.95 11.5 5.5 11.05 5.5 10.5V9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-jua)' }}>
                    {isSigningOut ? '로그아웃 중...' : 'Sign Out'}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
