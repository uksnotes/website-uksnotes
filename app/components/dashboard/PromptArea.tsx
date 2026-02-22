'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createClient } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/context/AuthContext';

type UploadedImage = {
  file: File;
  preview: string;
};

type GeneratedResult = {
  imageUrl: string;
  text: string;
};

interface Props {
  onResult?: (imageUrl: string, text: string, prompt: string) => void;
}

export function PromptArea({ onResult }: Props) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const preview = URL.createObjectURL(file);
    setImage({ file, preview });
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
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

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        resolve(data.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    if (!prompt.trim() && !image) return;
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      let imageData: string | undefined;
      let mimeType: string | undefined;

      if (image) {
        imageData = await toBase64(image.file);
        mimeType = image.file.type;
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageData, mimeType }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      // base64 → Supabase Storage 업로드 → public URL
      let finalImageUrl = `data:${data.mimeType};base64,${data.image}`;
      try {
        if (user) {
          const supabase = createClient();
          const binary = atob(data.image);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: data.mimeType });
          const ext = data.mimeType === 'image/png' ? 'png' : 'jpg';
          const filePath = `${user.id}/${Date.now()}.${ext}`;

          const { error: uploadErr } = await supabase.storage
            .from('thumbnails')
            .upload(filePath, blob, { contentType: data.mimeType });

          if (!uploadErr) {
            const { data: urlData } = supabase.storage
              .from('thumbnails')
              .getPublicUrl(filePath);
            finalImageUrl = urlData.publicUrl;

            await supabase.from('chats').insert({
              user_id: user.id,
              prompt: prompt || null,
              image_url: finalImageUrl,
              response_text: data.text || null,
            });
          }
        }
      } catch (saveErr) {
        console.error('Supabase save error:', saveErr);
      }

      setResult({ imageUrl: finalImageUrl, text: data.text });
      onResult?.(finalImageUrl, data.text, prompt);
    } catch {
      setError('Failed to connect. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
  };

  const resetAll = () => {
    setResult(null);
    setError(null);
    setPrompt('');
    removeImage();
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.imageUrl;
    a.download = 'lunchchat-couple.png';
    a.click();
  };

  const canSubmit = (prompt.trim().length > 0 || !!image) && !isGenerating;
  const hasResult = !!result;

  return (
    <motion.div layout className="w-full max-w-3xl mx-auto flex flex-col gap-6">

      {/* ── 결과: 항상 최상단 ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            layout
            key="result"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col gap-4"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <p className="text-white/30 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-jua)' }}>
                Lunch Mate Found ✨
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/15 text-white/40 text-xs tracking-widest uppercase transition-colors"
                  style={{ fontFamily: 'var(--font-jua)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1V8M6 8L3 5.5M6 8L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 10H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Download
                </motion.button>
                <motion.button
                  whileHover={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/15 text-white/40 text-xs tracking-widest uppercase transition-colors"
                  style={{ fontFamily: 'var(--font-jua)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M10 2L2 10M2 2L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  New
                </motion.button>
              </div>
            </div>

            {/* 생성 이미지 */}
            <div className="relative border border-white/10 overflow-hidden bg-white/[0.02]">
              <Image
                src={result.imageUrl}
                alt="Generated portrait"
                width={1024}
                height={1024}
                className="w-full object-contain max-h-72"
                unoptimized
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"
                initial={{ x: 0 }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            </div>

            {/* 응답 말풍선 */}
            {result.text && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="flex items-center gap-3 px-5 py-4 border border-white/15 bg-white/[0.04]"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="5" r="3" stroke="white" strokeOpacity="0.5" strokeWidth="1.2"/>
                    <path d="M2 12C2 9.8 4.2 8 7 8C9.8 8 12 9.8 12 12" stroke="white" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-jua)' }}>
                  {result.text}
                </p>
              </motion.div>
            )}

            {/* 구분선 */}
            <div className="border-t border-white/8 pt-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 로딩 ── */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            layout
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-10"
          >
            <div className="relative w-16 h-16">
              <motion.div
                className="absolute inset-0 border border-white/10 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 border border-white/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L12.2 7.2L18 8.2L14 12.1L15 18L10 15.3L5 18L6 12.1L2 8.2L7.8 7.2L10 2Z"
                      stroke="white" strokeOpacity="0.6" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>
            </div>
            <p className="text-white/30 text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-jua)' }}>
              점심 메이트 찾는 중...
            </p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-white/25"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 에러 ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            layout
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-5 py-4 border border-white/10 bg-white/[0.02]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-white/40">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="8" cy="11" r="0.7" fill="currentColor"/>
            </svg>
            <p className="text-white/40 text-sm flex-1" style={{ fontFamily: 'var(--font-jua)' }}>{error}</p>
            <button onClick={() => setError(null)} className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 제목: 결과 없을 때만 ── */}
      <AnimatePresence>
        {!hasResult && (
          <motion.div
            layout
            key="title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-3"
          >
            <h2 className="text-5xl text-white" style={{ fontFamily: 'var(--font-jua)' }}>
              오늘 점심 같이 먹을까요?
            </h2>
            <p className="text-base text-white/30 tracking-wide" style={{ fontFamily: 'var(--font-jua)' }}>
              사진을 올리면 AI가 찰떡 점심 메이트를 찾아드려요
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 입력 박스: 항상 표시, 결과 생기면 아래로 내려감 ── */}
      <motion.div
        layout
        key="input"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
                Drop a photo here
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
                  <Image src={image.preview} alt="uploaded" fill className="object-cover" />
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
            placeholder="오늘은 뭐가 드시고 싶나요? (예: 쌀국수, 국밥, 한정식)"
            rows={3}
            disabled={isGenerating}
            className="w-full resize-none bg-transparent text-white placeholder-white/25 text-base leading-relaxed outline-none disabled:opacity-50"
            style={{ fontFamily: 'var(--font-jua)', minHeight: '80px', maxHeight: '240px' }}
          />

          {/* 하단 액션 바 */}
          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <div className="flex items-center gap-2">
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
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-2 text-white/35 hover:text-white transition-colors text-xs tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-jua)' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="1.5" stroke="currentColor" strokeWidth="1.1" strokeDasharray="4 3"/>
                  <path d="M8 11V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M5 8L8 5L11 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Upload Photo
              </motion.button>

              <span className="text-white/10 text-sm">|</span>

              <span className="text-xs text-white/20 px-1" style={{ fontFamily: 'var(--font-jua)' }}>
                Shift + Enter for new line
              </span>
            </div>

            {/* 전송 버튼 */}
            <motion.button
              onClick={handleSubmit}
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.04 } : {}}
              whileTap={canSubmit ? { scale: 0.95 } : {}}
              animate={{ backgroundColor: canSubmit ? '#ffffff' : 'rgba(255,255,255,0.06)' }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm tracking-widest uppercase transition-colors
                ${canSubmit ? 'text-black' : 'text-white/20 cursor-not-allowed'}`}
              style={{ fontFamily: 'var(--font-jua)' }}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.5 12.5L7 1.5L12.5 12.5L7 10L1.5 12.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                  Generate
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── 예시 프롬프트: 결과·로딩 없을 때만 ── */}
      <AnimatePresence>
        {!result && !isGenerating && (
          <motion.div
            layout
            key="examples"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-2.5 justify-center"
          >
            {['쌀국수', '국밥', '한정식', '삼겹살', '냉면'].map((example) => (
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
        )}
      </AnimatePresence>

    </motion.div>
  );
}
