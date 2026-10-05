import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { CharacterProfile, CharacterResult } from '../types/quiz';
import { ORDER_FORM_URL } from '../constants';
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

      // Helper to wrap centered text
      const drawCenteredWrappedText = (
        text: string,
        centerX: number,
        startY: number,
        maxWidth: number,
        lineHeight: number
      ): number => {
        const words = text.split(' ');
        let line = '';
        let currentY = startY;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line.trim(), centerX, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), centerX, currentY);
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

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 35px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('"I NEED THE XTS T-SHIRT!"', decreeTextX, plaqueY + 95);

      ctx.fillStyle = '#fce8d5';
      ctx.font = 'italic 500 17px "Playfair Display", serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('Official Society Theatrical Verdict', decreeTextX, plaqueY + 130);
      ctx.restore();

      // 5. The Grand Alter Ego Stage Showcase (CENTERPIECE - Full of rich detail)
      const stageX = 60;
      const stageY = 405;
      const stageW = width - 120;
      const stageH = 885;

      drawRoundedRect(stageX, stageY, stageW, stageH, 26);
      ctx.fillStyle = 'rgba(18, 13, 11, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pill: Official Theatrical Alter Ego
      const pillW = 380;
      const pillH = 36;
      drawRoundedRect(width / 2 - pillW / 2, stageY + 18, pillW, pillH, 18);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 14px "Cinzel", serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('✦ OFFICIAL THEATRICAL ALTER EGO ✦', width / 2, stageY + 41);

      // Character Portrait Poster (Larger, more commanding presence!)
      const posterW = 460;
      const posterH = 390;
      const posterX = width / 2 - posterW / 2;
      const posterY = stageY + 66;

      if (charImg) {
        // Shadow behind poster
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(posterX + 6, posterY + 6, posterW, posterH);

        // Poster image
        ctx.drawImage(charImg, posterX, posterY, posterW, posterH);

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
        ctx.fillRect(posterX, posterY + posterH - 42, posterW, 42);
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(posterX, posterY + posterH - 42, posterW, 42);

        const charBadge = ((result as any).badge || (result as any).archetype || 'THEATRICAL ALTER EGO').toUpperCase();
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px "Cinzel", serif';
        ctx.letterSpacing = '3px';
        ctx.fillText(charBadge, width / 2, posterY + posterH - 15);
      }

      // Character Name
      const charName = (result.name || (result as any).character || 'Thespian').toUpperCase();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(charName, width / 2, stageY + 495);

      // Archetype Title
      ctx.fillStyle = (result as any).accentColor || '#ffd700';
      ctx.font = 'italic 600 22px "Playfair Display", Georgia, serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(`"${result.title}"`, width / 2, stageY + 528);

      // Quote
      ctx.fillStyle = '#fce8d5';
      ctx.font = 'italic 500 18px "Playfair Display", serif';
      ctx.fillText(`"${result.quote || (result as any).pitch || ''}"`, width / 2, stageY + 560);

      // Characteristics / Vibe text (Wrapped, centered, matching screenshot 2!)
      const charVibe = (result as any).vibe || (result as any).description || '';
      if (charVibe) {
        ctx.fillStyle = 'rgba(252, 232, 213, 0.85)';
        ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
        drawCenteredWrappedText(charVibe, width / 2, stageY + 596, stageW - 80, 24);
      }

      // Backstage Tell & Rehearsal Habit Callout Box (Exactly like screenshot 2!)
      const tellText = (result as any).stageTell || (result as any).backstageHabit || '';
      if (tellText) {
        const tellBoxW = stageW - 80;
        const tellBoxH = 75;
        const tellBoxX = width / 2 - tellBoxW / 2;
        const tellBoxY = stageY + 655;

        drawRoundedRect(tellBoxX, tellBoxY, tellBoxW, tellBoxH, 14);
        ctx.fillStyle = 'rgba(10, 7, 6, 0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Left gold accent bar
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(tellBoxX, tellBoxY + 8, 4, tellBoxH - 16);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 12px "Cinzel", serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('BACKSTAGE TELL & REHEARSAL HABIT', tellBoxX + 20, tellBoxY + 24);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'italic 15px "Playfair Display", serif';
        drawCenteredWrappedText(`"${tellText}"`, tellBoxX + tellBoxW / 2, tellBoxY + 50, tellBoxW - 40, 20);
      }

      // Hashtags (Rendered as pills, exactly like screenshot 2!)
      const tags: string[] = (result as any).tags || ['#XTS2026', '#TheatricalAlterEgo'];
      if (tags.length > 0) {
        ctx.font = 'bold 14px "Cinzel", sans-serif';
        const tagWidths = tags.map(t => ctx.measureText(t).width + 32);
        const totalTagsWidth = tagWidths.reduce((a, b) => a + b, 0) + (tags.length - 1) * 12;
        let startX = width / 2 - totalTagsWidth / 2;
        const tagY = stageY + 750;
        const tagH = 32;

        tags.forEach((tag, idx) => {
          const tW = tagWidths[idx];
          drawRoundedRect(startX, tagY, tW, tagH, 16);
          ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffd700';
          ctx.fillText(tag, startX + tW / 2, tagY + 21);
          startX += tW + 12;
        });
      }

      // Personalized Name Badge if provided
      const personalizedName = customName.trim() ? customName.toUpperCase() : null;
      if (personalizedName) {
        const namePillW = 460;
        const namePillH = 38;
        const namePillY = stageY + 800;
        drawRoundedRect(width / 2 - namePillW / 2, namePillY, namePillW, namePillH, 19);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px "Cinzel", serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(`🎭 NAME ON T-SHIRT: ${personalizedName}`, width / 2, namePillY + 24);
      }

      // 6. Society Merch Highlights Bar
      const merchY = 1310;
      const merchW = width - 120;
      const merchH = 95;
      drawRoundedRect(60, merchY, merchW, merchH, 18);
      ctx.fillStyle = 'rgba(244, 234, 225, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 18px "Cinzel", sans-serif';
      ctx.fillStyle = '#fce8d5';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('✨ 100% BREATHABLE COTTON  •  VINTAGE EMBOSSED BACK PRINT ✨', width / 2, merchY + 40);

      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.letterSpacing = '1px';
      ctx.fillText('🎭 Custom Name Printing Available on Official Pre-Order', width / 2, merchY + 72);

      // 7. QR Code Section (Bigger, High Contrast, Generated from ORDER_FORM_URL!)
      const qrY = 1430;
      const qrCardSize = 250;
      const qrCardX = width / 2 - qrCardSize / 2;

      try {
        const qrDataUrl = await QRCode.toDataURL(ORDER_FORM_URL, {
          width: 250,
          margin: 1,
          color: {
            dark: '#120f0e',
            light: '#ffffff',
          },
        });

        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise(resolve => {
          qrImg.onload = resolve;
        });

        // Crisp white card for QR
        drawRoundedRect(qrCardX, qrY, qrCardSize, qrCardSize, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.drawImage(qrImg, qrCardX + 10, qrY + 10, qrCardSize - 20, qrCardSize - 20);
      } catch {
        // Fallback
      }

      // QR Label
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 22px "Cinzel", serif';
      ctx.letterSpacing = '2.5px';
      ctx.fillText('SCAN TO CLAIM YOUR OFFICIAL XTS T-SHIRT', width / 2, qrY + 295);

      // 8. Footer Social Handle
      ctx.textAlign = 'center';
      ctx.fillStyle = '#d4af37';
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('Tag The Xaverian Theatrical Society @xts.sxccal', width / 2, 1845);

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
