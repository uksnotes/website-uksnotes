'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type UploadedImage = {
  file: File;
  preview: string;
};

export function PromptArea() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const preview = URL.createObjectURL(file);
    setImage({ file, preview });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    // 자동 높이 조정
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim() && !image) return;
    // TODO: 실제 생성 로직 연결
    console.log('Submit:', { prompt, image: image?.file.name });
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
  };

  const canSubmit = prompt.trim().length > 0 || !!image;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">

      {/* 안내 텍스트 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <h2 className="text-5xl text-white" style={{ fontFamily: 'var(--font-jua)' }}>
          무엇을 만들어볼까요?
        </h2>
        <p className="text-base text-white/30 tracking-wide" style={{ fontFamily: 'var(--font-jua)' }}>
          이미지를 업로드하고 원하는 썸네일 스타일을 입력하세요
        </p>
      </motion.div>

      {/* 입력 박스 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border transition-colors duration-200 bg-white/[0.03] backdrop-blur-sm
          ${isDragging ? 'border-white/40' : 'border-white/12 hover:border-white/20'}`}
      >
        {/* 드래그 오버레이 */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/[0.04] border-2 border-dashed border-white/30"
            >
              <p className="text-white/50 text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-jua)' }}>
                이미지를 여기에 놓으세요
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-5 pt-5 pb-4 flex flex-col gap-4">

          {/* 업로드된 이미지 미리보기 */}
          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 px-4 py-3 bg-white/[0.05] border border-white/10 w-fit"
              >
                <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden">
                  <Image
                    src={image.preview}
                    alt="uploaded"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white/70 truncate max-w-[200px]" style={{ fontFamily: 'var(--font-jua)' }}>
                    {image.file.name}
                  </p>
                  <p className="text-xs text-white/25 mt-0.5" style={{ fontFamily: 'var(--font-jua)' }}>
                    {(image.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <motion.button
                  whileHover={{ color: '#ffffff' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={removeImage}
                  className="text-white/30 transition-colors flex-shrink-0 ml-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 텍스트 입력 */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="썸네일 스타일, 제목, 분위기를 자유롭게 입력하세요..."
            rows={3}
            className="w-full resize-none bg-transparent text-white placeholder-white/25 text-base leading-relaxed outline-none"
            style={{
              fontFamily: 'var(--font-jua)',
              minHeight: '80px',
              maxHeight: '240px',
            }}
          />

          {/* 하단 액션 바 */}
          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <div className="flex items-center gap-2">
              {/* 이미지 업로드 버튼 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = '';
                }}
              />
              <motion.button
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff' }}
                whileTap={{ scale: 0.93 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-white/35 hover:text-white transition-colors text-xs tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-jua)' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="1.5" stroke="currentColor" strokeWidth="1.1" strokeDasharray="4 3"/>
                  <path d="M8 11V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M5 8L8 5L11 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                이미지 업로드
              </motion.button>

              <span className="text-white/10 text-sm">|</span>

              <span className="text-xs text-white/20 px-1" style={{ fontFamily: 'var(--font-jua)' }}>
                Shift + Enter 줄바꿈
              </span>
            </div>

            {/* 전송 버튼 */}
            <motion.button
              onClick={handleSubmit}
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.04 } : {}}
              whileTap={canSubmit ? { scale: 0.95 } : {}}
              animate={{
                backgroundColor: canSubmit ? '#ffffff' : 'rgba(255,255,255,0.06)',
              }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm tracking-widest uppercase transition-colors
                ${canSubmit ? 'text-black' : 'text-white/20 cursor-not-allowed'}`}
              style={{ fontFamily: 'var(--font-jua)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1.5 12.5L7 1.5L12.5 12.5L7 10L1.5 12.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              Generate
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 예시 프롬프트 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap gap-2.5 justify-center"
      >
        {[
          '강렬한 색감의 게임 썸네일',
          '미니멀 브이로그 스타일',
          '밝고 경쾌한 요리 채널',
          '다크 테마 기술 영상',
        ].map((example) => (
          <motion.button
            key={example}
            whileHover={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setPrompt(example);
              textareaRef.current?.focus();
            }}
            className="px-4 py-2 border border-white/10 text-white/30 text-xs tracking-wide transition-colors bg-white/[0.02]"
            style={{ fontFamily: 'var(--font-jua)' }}
          >
            {example}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
