'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export type HistoryItem = {
  id: string;
  imageUrl: string;
  text: string;
  prompt: string;
};

interface Props {
  history: HistoryItem[];
}

export function HistorySidebar({ history }: Props) {
  const [modalItem, setModalItem] = useState<HistoryItem | null>(null);

  return (
    <>
      {/* ── 사이드바 ── */}
      <aside className="w-64 shrink-0 border-r border-white/[0.06] bg-black/40 backdrop-blur-sm">
        <div className="sticky top-0 h-screen overflow-y-auto flex flex-col pt-20 pb-6 scrollbar-hide">

          {/* 헤더 */}
          <div className="px-4 pb-4 flex items-center gap-2 border-b border-white/[0.05]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
              <rect x="7" y="1" width="4" height="4" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
              <rect x="1" y="7" width="4" height="4" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
              <rect x="7" y="7" width="4" height="4" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
            </svg>
            <span
              className="text-[10px] text-white/25 tracking-[0.25em] uppercase flex-1"
              style={{ fontFamily: 'var(--font-jua)' }}
            >
              Gallery
            </span>
            {history.length > 0 && (
              <span
                className="text-[10px] text-white/15 tabular-nums px-1.5 py-0.5 border border-white/10"
                style={{ fontFamily: 'var(--font-jua)' }}
              >
                {history.length}
              </span>
            )}
          </div>

          {/* 빈 상태 */}
          <AnimatePresence>
            {history.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center flex-1 gap-4 px-4 py-12"
              >
                {/* 플레이스홀더 그리드 */}
                <div className="grid grid-cols-2 gap-1.5 opacity-20">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-[52px] h-[52px] border border-dashed border-white/30 bg-white/[0.02]"
                    />
                  ))}
                </div>
                <p
                  className="text-[11px] text-white/20 text-center leading-relaxed"
                  style={{ fontFamily: 'var(--font-jua)' }}
                >
                  생성한 이미지가<br />갤러리에 쌓여요
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2열 그리드 갤러리 */}
          {history.length > 0 && (
            <div className="px-3 pt-4 grid grid-cols-2 gap-2">
              <AnimatePresence initial={false}>
                {history.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.25, delay: idx === 0 ? 0.05 : 0 }}
                    onClick={() => setModalItem(item)}
                    className="group relative aspect-square overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-white/25 transition-colors"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.prompt || 'generated'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7H12M7 2L12 7L7 12" stroke="white" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span
                        className="text-[8px] text-white/70 tracking-widest uppercase text-center leading-tight line-clamp-2 px-1"
                        style={{ fontFamily: 'var(--font-jua)' }}
                      >
                        {item.prompt || '사진 업로드'}
                      </span>
                    </div>

                    {/* 최신 배지 */}
                    {idx === 0 && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/60" />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </aside>

      {/* ── 모달 ── */}
      <AnimatePresence>
        {modalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setModalItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-lg w-full flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 버튼 */}
              <div className="flex items-center justify-between">
                <p
                  className="text-[10px] text-white/30 tracking-widest uppercase"
                  style={{ fontFamily: 'var(--font-jua)' }}
                >
                  {modalItem.prompt || 'Generated Portrait'}
                </p>
                <motion.button
                  whileHover={{ color: '#ffffff' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setModalItem(null)}
                  className="text-white/30 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </motion.button>
              </div>

              {/* 이미지 */}
              <div className="relative w-full border border-white/10 overflow-hidden bg-white/[0.02]">
                <Image
                  src={modalItem.imageUrl}
                  alt={modalItem.prompt || 'generated'}
                  width={1024}
                  height={1024}
                  className="w-full h-auto max-h-[70vh] object-contain"
                  unoptimized
                />
              </div>

              {/* 응답 텍스트 */}
              {modalItem.text && (
                <div className="flex items-start gap-3 px-4 py-3 border border-white/10 bg-white/[0.03]">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="3.5" r="2" stroke="white" strokeOpacity="0.5" strokeWidth="1"/>
                      <path d="M1 9C1 7.3 2.8 6 5 6C7.2 6 9 7.3 9 9" stroke="white" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p
                    className="text-white/60 text-xs leading-relaxed whitespace-pre-line"
                    style={{ fontFamily: 'var(--font-jua)' }}
                  >
                    {modalItem.text}
                  </p>
                </div>
              )}

              {/* 다운로드 버튼 */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = modalItem.imageUrl;
                  a.download = 'lunchchat-couple.png';
                  a.click();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/15 text-white/40 text-xs tracking-widest uppercase transition-colors"
                style={{ fontFamily: 'var(--font-jua)' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1V8M6 8L3 5.5M6 8L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 10H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Download
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
