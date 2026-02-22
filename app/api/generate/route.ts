import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const DEFAULT_RESPONSE =
  '데이터사이언스파트에서 근무하는 이창욱 선임과 점심 챗은 어때요? 🍱';

const REFERENCE_IMAGES = [
  { file: 'uksnote1.jpeg', mimeType: 'image/jpeg' },
  { file: 'uksnote2.jpeg', mimeType: 'image/jpeg' },
];

const FOOD_KEYWORDS = [
  '쌀국수', '국밥', '한정식', '삼겹살', '갈비', '갈비탕', '설렁탕', '곰탕',
  '냉면', '칼국수', '순대', '떡볶이', '김밥', '비빔밥', '된장찌개', '김치찌개',
  '순두부', '부대찌개', '감자탕', '해장국', '추어탕', '삼계탕',
  '족발', '보쌈', '낙지', '해물', '조개', '꽃게', '굴',
  '라멘', '우동', '소바', '돈까스', '초밥', '회', '오마카세',
  '치킨', '피자', '파스타', '스테이크', '햄버거', '샐러드',
  '마라탕', '마라', '샤브샤브', '훠궈', '짜장면', '짬뽕', '탕수육', '볶음밥',
  '쌀밥', '덮밥', '카레', '규동', '라면', '만두', '교자',
  '베트남', '태국', '인도', '멕시칸', '이탈리안', '프렌치',
  '불고기', '제육', '오겹살', '목살', '항정살',
];

function readReferenceImage(filename: string): string {
  const filePath = path.join(process.cwd(), 'public', 'image', filename);
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('base64');
}

function extractFoodFromPrompt(prompt: string): string | null {
  for (const keyword of FOOD_KEYWORDS) {
    if (prompt.includes(keyword)) return keyword;
  }
  return null;
}

async function findRestaurantsNearGwanghwamun(
  food: string
): Promise<Array<{ name: string; address: string }>> {
  try {
    const query =
      `서울 광화문역 근처 "${food}" 맛집 3곳을 구글에서 검색해주세요.\n` +
      `반드시 아래 형식으로만 3줄 답해주세요 (다른 설명 없이):\n` +
      `식당이름 | 도로명주소\n` +
      `식당이름 | 도로명주소\n` +
      `식당이름 | 도로명주소`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: query,
      config: { tools: [{ googleSearch: {} }] } as any,
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const raw = parts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any) => !p.thought && p.text)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => p.text as string)
      .join('\n');

    console.log('[식당 검색 raw]', raw);

    const restaurants: Array<{ name: string; address: string }> = [];
    for (const line of raw.split('\n')) {
      const clean = line.replace(/^\d+[\.\)]\s*/, '').replace(/\*+/g, '').trim();
      const idx = clean.indexOf('|');
      if (idx > 0) {
        const name = clean.slice(0, idx).trim();
        const address = clean.slice(idx + 1).trim();
        if (name && address) restaurants.push({ name, address });
      }
      if (restaurants.length === 3) break;
    }
    return restaurants;
  } catch (err) {
    console.error('Restaurant search error:', err);
  }
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, imageData, mimeType } = body as {
      prompt?: string;
      imageData?: string;
      mimeType?: string;
    };

    // ── 음식 감지 + 식당 검색 ──────────────────────────────
    const detectedFood = prompt ? extractFoodFromPrompt(prompt) : null;
    let responseText = DEFAULT_RESPONSE;

    if (detectedFood) {
      const restaurants = await findRestaurantsNearGwanghwamun(detectedFood);
      if (restaurants.length > 0) {
        const list = restaurants
          .map((r, i) => `${i + 1}. ${r.name}\n   📍 ${r.address}`)
          .join('\n');
        responseText =
          `이창욱님과 음식 취향이 같습니다! 🍱\n` +
          `광화문역 근처 ${detectedFood} 맛집 추천이에요:\n\n${list}\n\n` +
          `함께 점심 어떨까요?`;
      } else {
        responseText =
          `이창욱님도 ${detectedFood}을(를) 좋아하세요! 🍱\n` +
          `광화문역 근처에서 함께 드셔보는 건 어떨까요?`;
      }
    }

    // ── 레퍼런스 이미지 선택 ───────────────────────────────
    const ref = REFERENCE_IMAGES[Math.floor(Math.random() * REFERENCE_IMAGES.length)];
    const refBase64 = readReferenceImage(ref.file);

    // ── 이미지 생성 프롬프트 ───────────────────────────────
    const couplePrompt =
      'I am providing two portrait photos: Person A (first image) and Person B (second image).\n\n' +

      '⚠️ ABSOLUTE RULE — Person A\'s face must be copied pixel-perfectly into the output. ' +
      'Do NOT alter Person A\'s face in any way: no smoothing, no reshaping, no beautification, no stylization. ' +
      'Person A must look identical to their photo. This is non-negotiable.\n\n' +

      'STEP 1 — FACES: ' +
      'Use Person A\'s face exactly as-is from the first photo (zero modification allowed). ' +
      'Use Person B\'s face from the second photo with high fidelity, preserving their eye shape, nose, lips, skin tone, and hair.\n\n' +

      'STEP 2 — OUTFITS: ' +
      'Discard the original clothing and background from both photos. ' +
      'Dress Person A and Person B in new stylish couple outfits that complement each other. ' +
      'Choose coordinated colors and a casual-chic fashion style appropriate for each person.\n\n' +

      'STEP 3 — FINAL OUTPUT: ' +
      'Generate a single photorealistic photo of Person A and Person B standing side by side, ' +
      'wearing their new couple outfits, smiling naturally. ' +
      'Soft blurred background (café or outdoor park), warm natural lighting. ' +
      'The output must look like a real photograph — ultra-high detail, sharp focus on both faces, professional DSLR quality. ' +
      'No illustration, no painting, no cartoon, no anime.';

    const contents: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
      { text: couplePrompt },
    ];

    if (imageData && mimeType) {
      contents.push({ inlineData: { mimeType, data: imageData } });
    }

    contents.push({ inlineData: { mimeType: ref.mimeType, data: refBase64 } });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '1K',
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    let generatedImageBase64 = '';
    let generatedMimeType = 'image/png';

    for (const part of parts) {
      if (part.thought) continue;
      if (part.inlineData) {
        generatedImageBase64 = part.inlineData.data ?? '';
        generatedMimeType = part.inlineData.mimeType ?? 'image/png';
        break;
      }
    }

    if (!generatedImageBase64) {
      return NextResponse.json(
        { error: '이미지를 생성하지 못했습니다. 다시 시도해 주세요.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: generatedImageBase64,
      mimeType: generatedMimeType,
      text: responseText,
    });
  } catch (err: unknown) {
    console.error('Gemini generate error:', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
