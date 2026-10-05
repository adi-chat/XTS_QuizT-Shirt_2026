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
        ctx.letterSpacing = '0px'; // Crucial: Prevent letterSpacing from stretching body texthttps://127.0.0.1:54659/static/artifacts/89c515e8-5e2b-4719-a6f3-c2802ad8578e/.user_uploaded/media_1791174444260.png?csrf=3b32f319-96ea-44bd-82b4-355326f18a2e
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
      const plaqueY = 212;
      const plaqueW = width - 120;
      const plaqueH = 158;

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
        ctx.drawImage(hatImg, plaqueX + 24, plaqueY + 16, 126, 126);
        ctx.restore();
      }

      // Decree Text (aligned inside plaque)
      ctx.save();
      ctx.textAlign = 'left';
      const decreeTextX = plaqueX + 172;

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 20px "Cinzel", serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('THE SORTING HAT HAS SPOKEN', decreeTextX, plaqueY + 46);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 34px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('"I NEED THE XTS T-SHIRT!"', decreeTextX, plaqueY + 92);
      ctx.letterSpacing = '0px';

      ctx.fillStyle = '#fce8d5';
      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('Official Society Theatrical Verdict', decreeTextX, plaqueY + 126);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // 5. The Grand Alter Ego Stage Showcase (Scaled & Tightly Padded - Zero Empty Voids!)
      const personalizedName = customName.trim() ? customName.toUpperCase() : null;
      const stageX = 60;
      const stageY = plaqueY + plaqueH + 24; // 394px - exactly below mandate plaque with clean 24px gap!
      const stageW = width - 120; // 960

      // Pill: Official Theatrical Alter Ego
      const pillW = 380;
      const pillH = 32;

      // Character Portrait Poster (390x400 portrait - Large, Dramatic, Perfectly Proportionate)
      const posterW = 390;
      const posterH = 400;
      const posterX = width / 2 - posterW / 2;
      const posterY = stageY + 64; // Shifted 10px lower as requested

      // Name & Quote coordinates
      const nameY = posterY + posterH + 30;
      const titleY = nameY + 30;
      const quoteY = titleY + 30;

      // Calculate exact stage height so bottom padding is precisely 24px with zero dead space
      const quoteStr = `"${result.quote || (result as any).pitch || ''}"`;
      ctx.font = 'italic 17px "Playfair Display", Georgia, serif';
      const estimatedLines = ctx.measureText(quoteStr).width > stageW - 100 ? 2 : 1;
      const quoteEndY = quoteY + (estimatedLines - 1) * 24;

      const namePillY = quoteEndY + 20;
      const lastContentY = personalizedName ? namePillY + 34 : quoteEndY;
      const stageH = (lastContentY + 24) - stageY;

      // Draw Alter Ego Card
      drawRoundedRect(stageX, stageY, stageW, stageH, 22);
      ctx.fillStyle = 'rgba(18, 13, 11, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Top Pill
      drawRoundedRect(width / 2 - pillW / 2, stageY + 14, pillW, pillH, 16);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 13px "Cinzel", serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('✦ OFFICIAL THEATRICAL ALTER EGO ✦', width / 2, stageY + 35);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Draw Poster
      if (charImg) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(posterX + 6, posterY + 6, posterW, posterH);

        drawImageCover(charImg, posterX, posterY, posterW, posterH);

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(posterX, posterY, posterW, posterH);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(posterX + 4, posterY + 4, posterW - 8, posterH - 8);

        // Archetype Badge banner at bottom of poster
        ctx.fillStyle = 'rgba(12, 8, 7, 0.92)';
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

      // Character Name
      const charName = (result.name || (result as any).character || 'Thespian').toUpperCase();
      let nameFontSize = 34;
      ctx.font = `bold ${nameFontSize}px "Cinzel", serif`;
      while (ctx.measureText(charName).width > stageW - 80 && nameFontSize > 22) {
        nameFontSize -= 2;
        ctx.font = `bold ${nameFontSize}px "Cinzel", serif`;
      }
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.letterSpacing = '2px';
      ctx.fillText(charName, width / 2, nameY);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Archetype Title
      let titleFontSize = 21;
      ctx.font = `600 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
      while (ctx.measureText(`"${result.title}"`).width > stageW - 80 && titleFontSize > 15) {
        titleFontSize -= 1;
        ctx.font = `600 ${titleFontSize}px "Plus Jakarta Sans", sans-serif`;
      }
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = (result as any).accentColor || '#ffd700';
      ctx.letterSpacing = '0.5px';
      ctx.fillText(`"${result.title}"`, width / 2, titleY);
      ctx.letterSpacing = '0px';
      ctx.restore();

      // Quote (Playfair italic, max 2 lines)
      ctx.font = 'italic 17px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#fce8d5';
      drawWrappedText(quoteStr, width / 2, quoteY, stageW - 100, 24, 'center', 2);

      // Personalized Name Badge if provided
      if (personalizedName) {
        const namePillW = 460;
        const namePillH = 34;
        drawRoundedRect(width / 2 - namePillW / 2, namePillY, namePillW, namePillH, 17);
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
        ctx.fillText(`🎭 NAME ON T-SHIRT: ${personalizedName}`, width / 2, namePillY + 22);
        ctx.letterSpacing = '0px';
        ctx.restore();
      }

      // Generate both QR Codes
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
            width: 400,
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

      // 6. HERO SECTION: T-SHIRT ORDER (Enlarged 320x320 QR + Right-Side Claim Header & 3 Pointers)
      const tshirtCardX = 60;
      const tshirtCardY = stageY + stageH + 24;
      const tshirtCardW = width - 120; // 960

      const tQrBoxSize = 320;
      const tshirtCardH = tQrBoxSize + 52; // 372px

      // Rich wine/crimson gradient with glowing border
      const tshirtGrad = ctx.createLinearGradient(tshirtCardX, tshirtCardY, tshirtCardX + tshirtCardW, tshirtCardY + tshirtCardH);
      tshirtGrad.addColorStop(0, '#561416');
      tshirtGrad.addColorStop(0.5, '#3b0d0f');
      tshirtGrad.addColorStop(1, '#200708');

      ctx.save();
      ctx.shadowColor = 'rgba(212, 175, 55, 0.45)';
      ctx.shadowBlur = 24;
      drawRoundedRect(tshirtCardX, tshirtCardY, tshirtCardW, tshirtCardH, 22);
      ctx.fillStyle = tshirtGrad;
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();

      // Inner gold border
      drawRoundedRect(tshirtCardX + 8, tshirtCardY + 8, tshirtCardW - 16, tshirtCardH - 16, 16);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Left Column: Enlarged 320x320 QR Box (Fills card height symmetrically - no bottom button!)
      const tQrBoxX = tshirtCardX + 28;
      const tQrBoxY = tshirtCardY + 26;

      drawRoundedRect(tQrBoxX, tQrBoxY, tQrBoxSize, tQrBoxSize, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.stroke();

      if (formQrImg) {
        ctx.drawImage(formQrImg, tQrBoxX + 14, tQrBoxY + 14, tQrBoxSize - 28, tQrBoxSize - 28);
      }

      // Right Column: Claim T-Shirt Header ON THIS SIDE above the pointers! (THE MAIN SHOWCASE)
      const tTextX = tQrBoxX + tQrBoxSize + 36;
      const tHeaderW = tshirtCardW - (tQrBoxSize + 92);
      const tHeaderH = 50;

      // Solid gold action banner on top of the pointers
      drawRoundedRect(tTextX, tQrBoxY + 4, tHeaderW, tHeaderH, 14);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#100c0a';
      ctx.font = '900 22px "Cinzel", serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('★ SCAN TO CLAIM T-SHIRT ★', tTextX + tHeaderW / 2, tQrBoxY + 36);
      ctx.restore();

      // Exactly the 3 Pointers below the header
      const perks = [
        '100% Breathable Cotton',
        'Vintage Embossed Back Print',
        'Custom Name Printing Available',
      ];

      ctx.save();
      ctx.textAlign = 'left';
      perks.forEach((perk, idx) => {
        const itemY = tQrBoxY + 116 + idx * 64;

        // Gold star bullet
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px serif';
        ctx.fillText('✦', tTextX + 4, itemY);

        // Point text (Large, bold, crisp 22px!)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(perk, tTextX + 38, itemY);
      });

      // Bottom subtle hallmark note to balance vertical space
      ctx.fillStyle = 'rgba(252, 232, 213, 0.75)';
      ctx.font = 'italic 15px "Playfair Display", Georgia, serif';
      ctx.fillText('Official Society Polo • Screen-printed name on back', tTextX + 4, tQrBoxY + 304);
      ctx.restore();

      // 7. COMPANION SECTION: THEATRICAL ALTER EGO QUIZ (Enlarged QR + Teaser Lines + Link)
      const quizCardX = 60;
      const quizCardY = tshirtCardY + tshirtCardH + 24;
      const quizCardW = width - 120; // 960

      const qQrBoxSize = 245;
      const quizCardH = qQrBoxSize + 52; // 297px

      drawRoundedRect(quizCardX, quizCardY, quizCardW, quizCardH, 20);
      ctx.fillStyle = 'rgba(16, 12, 11, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Inner subtle border
      drawRoundedRect(quizCardX + 6, quizCardY + 6, quizCardW - 12, quizCardH - 12, 15);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Left Column: Enlarged 245x245 QR Box
      const qQrBoxX = quizCardX + 28;
      const qQrBoxY = quizCardY + 26;

      drawRoundedRect(qQrBoxX, qQrBoxY, qQrBoxSize, qQrBoxSize, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (quizQrImg) {
        ctx.drawImage(quizQrImg, qQrBoxX + 14, qQrBoxY + 14, qQrBoxSize - 28, qQrBoxSize - 28);
      }

      // Right Column: Matching Action Header ("CHECK YOUR THEATRICAL ALTER EGO") + Teaser Copy + Link
      const qTextX = qQrBoxX + qQrBoxSize + 36;
      const qHeaderW = quizCardW - (qQrBoxSize + 92);
      const qHeaderH = 50;

      // Matching action banner for Quiz: "CHECK YOUR THEATRICAL ALTER EGO" (Eliminates dead empty space!)
      drawRoundedRect(qTextX, qQrBoxY + 4, qHeaderW, qHeaderH, 14);
      ctx.fillStyle = '#d4af37';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#100c0a';
      ctx.font = 'bold 17px "Cinzel", serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('★ CHECK YOUR THEATRICAL ALTER EGO ★', qTextX + qHeaderW / 2, qQrBoxY + 36);
      ctx.restore();

      // Line 1: Quote teaser
      ctx.save();
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'italic 16.5px "Playfair Display", Georgia, serif';
      ctx.fillText('"Let\'s see what theatrical madness you harbor..."', qTextX + 4, qQrBoxY + 84);

      // Lines 2-4: Fast-paced questions & fate
      const quizPerks = [
        '10 fast-paced questions.',
        'Brutally honest commentary.',
        'One unavoidable theatrical fate.',
      ];
      quizPerks.forEach((perk, idx) => {
        const itemY = qQrBoxY + 114 + idx * 26;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px serif';
        ctx.fillText('✦', qTextX + 4, itemY);

        ctx.fillStyle = '#fce8d5';
        ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(perk, qTextX + 28, itemY);
      });

      // Link badge: Full width to match header perfectly and eliminate dead space!
      const urlBoxW = qHeaderW;
      const urlBoxH = 44;
      const urlBoxY = qQrBoxY + 198;
      drawRoundedRect(qTextX, urlBoxY, urlBoxW, urlBoxH, 12);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.16)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('xts-sortinghat-quiz.vercel.app', qTextX + urlBoxW / 2, urlBoxY + 28);
      ctx.restore();

      // 8. Footer Social Handle & Hallmark (Balanced vertical placement - NO giant bottom void!)
      // Decorative divider flourish
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 160, 1770);
      ctx.lineTo(width / 2 + 160, 1770);
      ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦   ✦   ✦', width / 2, 1774);

      // Primary Tag Handle
      ctx.fillStyle = '#d4af37';
      ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText(`Tag The Xaverian Theatrical Society ${SOCIETY_INSTAGRAM_HANDLE}`, width / 2, 1814);
      ctx.letterSpacing = '0px';

      // College & Production Subtitle
      ctx.fillStyle = 'rgba(252, 232, 213, 0.6)';
      ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText("St. Xavier's College (Autonomous), Kolkata • Production Merch 2026", width / 2, 1842);
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
