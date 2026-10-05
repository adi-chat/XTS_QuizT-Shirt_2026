import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { CharacterProfile, CharacterResult } from '../types/quiz';
import { ORDER_FORM_URL, QUIZ_URL, SOCIETY_INSTAGRAM_HANDLE } from '../constants';
import { Download, Share2, X, Sparkles, Check, Smartphone } from 'lucide-react';

interface StoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CharacterProfile | CharacterResult;
  customName: string;
}

export const StoryShareModal: React.FC<StoryShareModalProps> = ({
  isOpen,
  onClose,
  result,
  customName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const generateCanvas = async () => {
      setIsGenerating(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;

      // Helper for rounded rectangles
      const drawRoundedRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      // Helper to load image safely
      const loadImage = (src: string): Promise<HTMLImageElement | null> => {
        return new Promise(resolve => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      };

      // Helper to draw an image with object-fit: cover (cropping instead of squishing)
      const drawImageCover = (
        img: HTMLImageElement,
        x: number,
        y: number,
        w: number,
        h: number
      ) => {
        ctx.save();
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        const imgRatio = naturalW / naturalH;
        const targetRatio = w / h;
        let sx = 0, sy = 0, sw = naturalW, sh = naturalH;

        if (imgRatio > targetRatio) {
          // Image is wider than container: crop sides equally
          sw = naturalH * targetRatio;
          sx = (naturalW - sw) / 2;
        } else {
          // Image is taller than container: crop top & bottom (focusing 25% from top to prioritize faces)
          sh = naturalW / targetRatio;
          sy = Math.max(0, (naturalH - sh) * 0.25);
        }

        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        ctx.restore();
      };

      // Helper to wrap text with strict width containment and optional max-lines
      // Helper to wrap text with strict width containment and optional max-lines
      const drawWrappedText = (
        text: string,
        x: number,
        startY: number,
        maxWidth: number,
        lineHeight: number,
        align: 'center' | 'left' = 'center',
        maxLines: number = 4
      ): number => {
        ctx.save();
        ctx.textAlign = align;
        ctx.letterSpacing = '0px'; // Crucial: Prevent letterSpacing from stretching body text
        const words = text.split(' ');
        let line = '';
        let currentY = startY;
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          ctx.letterSpacing = '0px';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lineCount++;
            if (lineCount >= maxLines) {
              ctx.letterSpacing = '0px';
              ctx.fillText(line.trim() + '...', x, currentY);
              ctx.letterSpacing = '0px';
              ctx.restore();
              ctx.letterSpacing = '0px';
              return currentY;
            }
            ctx.letterSpacing = '0px';
            ctx.fillText(line.trim(), x, currentY);
            ctx.letterSpacing = '0px';
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.letterSpacing = '0px';
        ctx.fillText(line.trim(), x, currentY);
        ctx.letterSpacing = '0px';
        ctx.restore();
        ctx.letterSpacing = '0px';
        return currentY;
      };

      const charImgSrc = (result as any).image || (result as any).imageSrc || null;
      const [logoImg, hatImg, charImg] = await Promise.all([
        loadImage('/assets/xts_logo.png'),
        loadImage('/assets/hat/hat_4.png'),
        charImgSrc ? loadImage(charImgSrc) : Promise.resolve(null),
      ]);

      // 1. Background: Deep obsidian/mahogany stage atmosphere
      const bgGrad = ctx.createRadialGradient(width / 2, 700, 100, width / 2, 960, 1100);
      bgGrad.addColorStop(0, '#261612');
      bgGrad.addColorStop(0.4, '#150d0a');
      bgGrad.addColorStop(0.75, '#0d0806');
      bgGrad.addColorStop(1, '#060403');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric starlight specks
      ctx.fillStyle = 'rgba(212, 175, 55, 0.05)';
      for (let i = 0; i < 280; i++) {
        const sx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 37) * 0.5 + 0.5) * height;
        const sr = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Ornate Double Gold Framing
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(48, 48, width - 96, height - 96);

      // Corner Ornaments
      const drawCorner = (cx: number, cy: number, rot: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.stroke();

        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(10, 10, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawCorner(60, 60, 0);
      drawCorner(width - 60, 60, Math.PI / 2);
      drawCorner(width - 60, height - 60, Math.PI);
      drawCorner(60, height - 60, -Math.PI / 2);

      // 3. Top Header: Society Logo + Official Crest Title
      ctx.textAlign = 'center';

      if (logoImg) {
        const logoSize = 64;
        const logoX = width / 2 - logoSize / 2;
        const logoY = 70;

        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(width / 2, logoY + logoSize / 2, logoSize / 2 + 1, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#fce8d5';
      ctx.font = 'bold 30px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('XAVERIAN THEATRICAL SOCIETY', width / 2, 170);
      ctx.letterSpacing = '0px';

      // Elegant Center Divider
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 200, 194);
      ctx.lineTo(width / 2 + 200, 194);
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(width / 2, 194, 5, 0, Math.PI * 2);
      ctx.fill();

      // 4. The Sorting Hat Mandate Plaque (Expanded & Prominent)
      const plaqueX = 60;
      const plaqueY = 215;
      const plaqueW = width - 120;
      const plaqueH = 165;

      const plaqueGrad = ctx.createLinearGradient(plaqueX, plaqueY, plaqueX + plaqueW, plaqueY + plaqueH);
      plaqueGrad.addColorStop(0, '#5a1111');
      plaqueGrad.addColorStop(0.5, '#781919');
      plaqueGrad.addColorStop(1, '#440909');

      drawRoundedRect(plaqueX, plaqueY, plaqueW, plaqueH, 22);
      ctx.fillStyle = plaqueGrad;
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Inner subtle gold dashed border
      drawRoundedRect(plaqueX + 8, plaqueY + 8, plaqueW - 16, plaqueH - 16, 16);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sorting Hat inside plaque (left side) with aura
      if (hatImg) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 18;
        ctx.drawImage(hatImg, plaqueX + 25, plaqueY + 16, 132, 132);
        ctx.restore();
      }

      // Decree Text (aligned inside plaque)
      ctx.save();
      ctx.textAlign = 'left';
      const decreeTextX = plaqueX + 175;

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 21px "Cinzel", serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('THE SORTING HAT HAS SPOKEN', decreeTextX, plaqueY + 48);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 35px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('"I NEED THE XTS T-SHIRT!"', decreeTextX, plaqueY + 95);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = '#fce8d5';
      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('Official Society Theatrical Verdict', decreeTextX, plaqueY + 130);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // 5. The Grand Alter Ego Stage Showcase (Tightened Spacing, Zero Squish, Coherent Typography)
      const personalizedName = customName.trim() ? customName.toUpperCase() : null;
      const stageX = 60;
      const stageY = 390;
      const stageW = width - 120;
      const stageH = personalizedName ? 810 : 770;

      drawRoundedRect(stageX, stageY, stageW, stageH, 24);
      ctx.fillStyle = 'rgba(18, 13, 11, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pill: Official Theatrical Alter Ego
      const pillW = 380;
      const pillH = 34;
      drawRoundedRect(width / 2 - pillW / 2, stageY + 16, pillW, pillH, 17);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 13.5px "Cinzel", serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('✦ OFFICIAL THEATRICAL ALTER EGO ✦', width / 2, stageY + 38);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Character Portrait Poster (400x415 portrait, cropped cleanly via drawImageCover - No Squishing!)
      const posterW = 400;
      const posterH = 415;
      const posterX = width / 2 - posterW / 2;
      const posterY = stageY + 58;

      if (charImg) {
        // Shadow behind poster
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(posterX + 6, posterY + 6, posterW, posterH);

        // Poster image cropped symmetrically via drawImageCover (No squishing!)
        drawImageCover(charImg, posterX, posterY, posterW, posterH);

        // Ornate Gold Frame
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(posterX, posterY, posterW, posterH);

        // Inner frame line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(posterX + 4, posterY + 4, posterW - 8, posterH - 8);

        // Badge banner at bottom of poster
        ctx.fillStyle = 'rgba(12, 8, 7, 0.9)';
        ctx.fillRect(posterX, posterY + posterH - 40, posterW, 40);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(posterX, posterY + posterH - 40, posterW, 40);

        const charBadge = ((result as any).badge || (result as any).archetype || 'THEATRICAL ALTER EGO').toUpperCase();
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 15px "Cinzel", serif';
        ctx.letterSpacing = '3px';
        ctx.fillText(charBadge, width / 2, posterY + posterH - 14);
        ctx.letterSpacing = '0px';
        ctx.restore();
      }

      // Character Name (Auto-scales font so long names like DEADPOOL fit comfortably)
      const charName = (result.name || (result as any).character || 'Thespian').toUpperCase();
      let nameFontSize = 32;
      ctx.font = `bold ${nameFontSize}px "Cinzel", serif`;
      while (ctx.measureText(charName).width > stageW - 80 && nameFontSize > 22) {
        nameFontSize -= 2;
        ctx.font = `bold ${nameFontSize}px "Cinzel", serif`;
      }
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.letterSpacing = '2px';
      ctx.fillText(charName, width / 2, stageY + 508);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Archetype Title (Clean Plus Jakarta Sans, NOT italic)
      let titleFontSize = 20;
      ctx.font = `600 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
      while (ctx.measureText(`"${result.title}"`).width > stageW - 80 && titleFontSize > 15) {
        titleFontSize -= 1;
        ctx.font = `600 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
      }
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = (result as any).accentColor || '#ffd700';
      ctx.letterSpacing = '0.5px';
      ctx.fillText(`"${result.title}"`, width / 2, stageY + 534);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Quote (Clean Plus Jakarta Sans, strict 0px letterSpacing)
      const quoteStr = `"${result.quote || (result as any).pitch || ''}"`;
      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#fce8d5';
      const quoteEndY = drawWrappedText(quoteStr, width / 2, stageY + 558, stageW - 80, 22, 'center', 2);

      // Characteristics / Vibe text (Clean Plus Jakarta Sans, strict 0px letterSpacing)
      const charVibe = (result as any).vibe || (result as any).description || '';
      let vibeEndY = quoteEndY;
      if (charVibe) {
        ctx.fillStyle = 'rgba(252, 232, 213, 0.88)';
        ctx.font = '400 14px "Plus Jakarta Sans", sans-serif';
        vibeEndY = drawWrappedText(charVibe, width / 2, quoteEndY + 22, stageW - 80, 20, 'center', 2);
      }

      // Backstage Tell & Rehearsal Habit Callout Box (Safe 26px clearance below description to prevent collision!)
      const tellText = (result as any).stageTell || (result as any).backstageHabit || '';
      let tellEndY = vibeEndY;
      if (tellText) {
        const tellBoxW = stageW - 80; // 880
        const tellBoxH = 74;
        const tellBoxX = width / 2 - tellBoxW / 2; // 100
        const tellBoxY = vibeEndY + 26;

        drawRoundedRect(tellBoxX, tellBoxY, tellBoxW, tellBoxH, 12);
        ctx.fillStyle = 'rgba(10, 7, 6, 0.88)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Left gold accent bar
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(tellBoxX, tellBoxY + 6, 4, tellBoxH - 12);

        // Header label
        ctx.save();
        ctx.textAlign = 'left';
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 10.5px "Cinzel", serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('BACKSTAGE TELL & REHEARSAL HABIT', tellBoxX + 20, tellBoxY + 22);
        ctx.letterSpacing = '0px';
        ctx.restore();

        // Habit quote (Clean Plus Jakarta Sans, strict 0px letterSpacing)
        ctx.fillStyle = '#ffd700';
        ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
        drawWrappedText(`"${tellText}"`, tellBoxX + 20, tellBoxY + 44, tellBoxW - 40, 18, 'left', 2);
        tellEndY = tellBoxY + tellBoxH;
      }

      // Hashtags (Positioned cleanly below the box)
      const tags: string[] = (result as any).tags || ['#XTS2026', '#TheatricalAlterEgo'];
      const tagY = tellEndY + 12;
      const tagH = 26;

      if (tags.length > 0) {
        let tagFontSize = 12;
        ctx.font = `bold ${tagFontSize}px "Cinzel", serif`;
        let tagWidths = tags.map(t => ctx.measureText(t).width + 26);
        let totalTagsWidth = tagWidths.reduce((a, b) => a + b, 0) + (tags.length - 1) * 10;

        if (totalTagsWidth > stageW - 60) {
          tagFontSize = 11;
          ctx.font = `bold ${tagFontSize}px "Cinzel", serif`;
          tagWidths = tags.map(t => ctx.measureText(t).width + 20);
          totalTagsWidth = tagWidths.reduce((a, b) => a + b, 0) + (tags.length - 1) * 8;
        }

        let startX = width / 2 - totalTagsWidth / 2;

        tags.forEach((tag, idx) => {
          const tW = tagWidths[idx];
          drawRoundedRect(startX, tagY, tW, tagH, 13);
          ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.save();
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffd700';
          ctx.font = `bold ${tagFontSize}px "Cinzel", serif`;
          ctx.fillText(tag, startX + tW / 2, tagY + 18);
          ctx.restore();
          startX += tW + 10;
        });
      }

      // Personalized Name Badge if provided
      if (personalizedName) {
        const namePillW = 460;
        const namePillH = 32;
        const namePillY = tagY + tagH + 10;
        drawRoundedRect(width / 2 - namePillW / 2, namePillY, namePillW, namePillH, 16);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px "Cinzel", serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(`🎭 NAME ON T-SHIRT: ${personalizedName}`, width / 2, namePillY + 21);
        ctx.letterSpacing = '0px';
        ctx.restore();
      }

      // 6. Society Merch Highlights Bar
      const merchY = stageY + stageH + 14;
      const merchW = width - 120;
      const merchH = 72;
      drawRoundedRect(60, merchY, merchW, merchH, 16);
      ctx.fillStyle = 'rgba(244, 234, 225, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = 'bold 17px "Cinzel", serif';
      ctx.fillStyle = '#fce8d5';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('✨ 100% BREATHABLE COTTON  •  VINTAGE EMBOSSED BACK PRINT ✨', width / 2, merchY + 29);
      ctx.letterSpacing = '0px';

      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.letterSpacing = '1px';
      ctx.fillText('🎭 Custom Name Printing Available on Official Order Form', width / 2, merchY + 54);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // 7. Dual QR Code Section: Left = Sorting Hat Quiz, Right = Official T-Shirt Order Form
      const dualQrY = merchY + merchH + 14;
      const cardW = 465;
      const leftCardX = 60;
      const rightCardX = 555;
      const leftCenterX = leftCardX + cardW / 2;
      const rightCenterX = rightCardX + cardW / 2;

      let quizQrImg: HTMLImageElement | null = null;
      let formQrImg: HTMLImageElement | null = null;

      try {
        const [quizQrDataUrl, formQrDataUrl] = await Promise.all([
          QRCode.toDataURL(QUIZ_URL, {
            width: 320,
            margin: 1,
            color: {
              dark: '#120f0e',
              light: '#ffffff',
            },
          }),
          QRCode.toDataURL(ORDER_FORM_URL, {
            width: 320,
            margin: 1,
            color: {
              dark: '#120f0e',
              light: '#ffffff',
            },
          }),
        ]);

        [quizQrImg, formQrImg] = await Promise.all([
          loadImage(quizQrDataUrl),
          loadImage(formQrDataUrl),
        ]);
      } catch (err) {
        console.error('Failed to generate dual QR codes', err);
      }

      // Shared card metrics to guarantee perfect alignment & complete space utilization (290px QR box)
      const qrBoxSize = 290;
      const qrBoxY = dualQrY + 54;
      const ctaY = qrBoxY + qrBoxSize + 34;
      const subY = ctaY + 26;
      const plaqueBoxW = cardW - 32; // 433
      const plaqueBoxH = 68;
      const plaqueBoxY = subY + 16;
      const dualQrH = (plaqueBoxY + plaqueBoxH + 22) - dualQrY; // Fits snugly with 22px bottom padding!

      // --- LEFT HALF: SORTING HAT QUIZ ---
      drawRoundedRect(leftCardX, dualQrY, cardW, dualQrH, 20);
      ctx.fillStyle = 'rgba(18, 13, 11, 0.94)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      drawRoundedRect(leftCardX + 6, dualQrY + 6, cardW - 12, dualQrH - 12, 15);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Left Header Pill
      const qrPillW = 310;
      const qrPillH = 30;
      drawRoundedRect(leftCenterX - qrPillW / 2, dualQrY + 14, qrPillW, qrPillH, 15);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12.5px "Cinzel", serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('✦ STEP 1: PLAY THE QUIZ ✦', leftCenterX, dualQrY + 34);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Left White QR Box (Expanded 290x290 with crisp 266x266 QR)
      const leftQrBoxX = leftCenterX - qrBoxSize / 2;
      drawRoundedRect(leftQrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      if (quizQrImg) {
        ctx.drawImage(quizQrImg, leftQrBoxX + 12, qrBoxY + 12, qrBoxSize - 24, qrBoxSize - 24);
      }

      // Left Action Callout (Bold, Prominent Cinzel)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 22px "Cinzel", serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('SCAN TO PLAY QUIZ', leftCenterX, ctaY);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Left Subtitle (Clean Plus Jakarta Sans, NOT italic)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0px';
      ctx.fillStyle = '#fce8d5';
      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Find Your Theatrical Alter Ego', leftCenterX, subY);
      ctx.restore();

      // Left Coherent Plaque Box (Fills the lower card completely, zero dead space!)
      const leftPlaqueX = leftCenterX - plaqueBoxW / 2;
      drawRoundedRect(leftPlaqueX, plaqueBoxY, plaqueBoxW, plaqueBoxH, 12);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 1.3;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0px';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('xts-sortinghat-quiz.vercel.app', leftCenterX, plaqueBoxY + 26);

      ctx.fillStyle = '#ffd700';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Let the Sorting Hat evaluate you', leftCenterX, plaqueBoxY + 49);
      ctx.restore();

      // --- RIGHT HALF: CLAIM OFFICIAL XTS T-SHIRT ---
      drawRoundedRect(rightCardX, dualQrY, cardW, dualQrH, 20);
      ctx.fillStyle = 'rgba(18, 13, 11, 0.94)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      drawRoundedRect(rightCardX + 6, dualQrY + 6, cardW - 12, dualQrH - 12, 15);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Right Header Pill
      drawRoundedRect(rightCenterX - qrPillW / 2, dualQrY + 14, qrPillW, qrPillH, 15);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12.5px "Cinzel", serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('✦ STEP 2: CLAIM T-SHIRT ✦', rightCenterX, dualQrY + 34);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Right White QR Box (Expanded 290x290 with crisp 266x266 QR)
      const rightQrBoxX = rightCenterX - qrBoxSize / 2;
      drawRoundedRect(rightQrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      if (formQrImg) {
        ctx.drawImage(formQrImg, rightQrBoxX + 12, qrBoxY + 12, qrBoxSize - 24, qrBoxSize - 24);
      }

      // Right Action Callout (Bold, Prominent Cinzel)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 22px "Cinzel", serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('SCAN TO CLAIM T-SHIRT', rightCenterX, ctaY);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Right Subtitle (Clean Plus Jakarta Sans, NOT italic - Zero Repetition!)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0px';
      ctx.fillStyle = '#fce8d5';
      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Official Society Merchandise', rightCenterX, subY);
      ctx.restore();

      // Right Coherent Plaque Box (Fills the lower card completely, zero dead space!)
      const rightPlaqueX = rightCenterX - plaqueBoxW / 2;
      drawRoundedRect(rightPlaqueX, plaqueBoxY, plaqueBoxW, plaqueBoxH, 12);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 1.3;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0px';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Official T-Shirt Order Form', rightCenterX, plaqueBoxY + 26);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Custom Name Printing • Limited Edition', rightCenterX, plaqueBoxY + 49);
      ctx.restore();

      // Center Divider between the two halves
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(540, dualQrY + 30);
      ctx.lineTo(540, dualQrY + dualQrH - 30);
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = '16px serif';
      ctx.fillText('✦', 540, dualQrY + dualQrH / 2 + 5);
      ctx.restore();

      // 8. Footer Social Handle
      ctx.textAlign = 'center';
      ctx.fillStyle = '#d4af37';
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '1.5px';
      const footerY = Math.round((dualQrY + dualQrH + 1872) / 2 + 6);
      ctx.fillText(`Tag The Xaverian Theatrical Society ${SOCIETY_INSTAGRAM_HANDLE}`, width / 2, footerY);
      ctx.letterSpacing = '0px';

      const url = canvas.toDataURL('image/png');
      setDataUrl(url);
      setIsGenerating(false);
    };

    generateCanvas();
  }, [isOpen, result, customName]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    const safeCharName = ((result as any).name || (result as any).character || 'verdict').toLowerCase().replace(/\s+/g, '-');
    a.download = `xts-sorting-hat-${safeCharName}-story.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNativeShare = async () => {
    if (!dataUrl) return;
    try {
      const charDisplayName = (result as any).name || (result as any).character || 'Your Alter Ego';
      if (navigator.share) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'xts-verdict-story.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "The Sorting Hat's Verdict (XTS)",
            text: `The Sorting Hat decided: I need the XTS T-shirt! My match: ${charDisplayName}.`,
            files: [file],
          });
          return;
        }
      }

      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Hidden high-res canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1e1715] to-[#120f0e] border-2 border-[#d4af37] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#f4eae1]/60 hover:text-white bg-[#251e1b] p-2 rounded-full border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <h3 className="text-2xl font-cinzel font-bold text-[#f4eae1]">
            Share Your Verdict
          </h3>
          <p className="text-xs text-[#f4eae1]/75 font-sans mt-1.5">
            Download your personalized graphic with alter ego and verdict stamp.
          </p>
        </div>

        {/* Preview of Canvas */}
        <div className="flex justify-center items-center my-2">
          {isGenerating ? (
            <div className="w-[200px] h-[355px] bg-[#1a1310] border border-[#d4af37]/40 rounded-2xl flex flex-col items-center justify-center text-center p-4">
              <Sparkles className="w-8 h-8 text-[#d4af37] animate-spin mb-3" />
              <p className="text-xs font-cinzel text-[#d4af37]">Crafting Story Canvas...</p>
            </div>
          ) : (
            <div className="w-[220px] h-[390px] rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-2xl relative group">
              <img
                src={dataUrl}
                alt="Story Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-xs font-cinzel font-bold text-white bg-black/80 px-3 py-1.5 rounded-full border border-[#d4af37]">
                  Personalized Graphic
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#f5c842] text-[#120f0e] font-cinzel font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Image
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 bg-[#251e1b] hover:bg-[#362a26] text-[#f4eae1] border border-[#d4af37]/50 font-cinzel font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#d4af37]" />
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 sm:hidden" />
                  Share to Story
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
