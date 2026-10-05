import { useEffect, useRef, type RefObject } from 'react';

interface SpotlightDustProps {
  containerRef: RefObject<HTMLDivElement | null>;
  spotlightRadius?: number;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  color: string;
  speedMultiplier: number;
  swayAmplitude: number;
  swaySpeed: number;
  phase: number;
}

export default function SpotlightDust({ containerRef, spotlightRadius = 310 }: SpotlightDustProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: -2000, y: -2000 });

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(parent);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePosRef.current = { x, y };
    };

    const handleMouseLeave = () => {
      mousePosRef.current = { x: -2000, y: -2000 };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = parent.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        mousePosRef.current = { x, y };
      }
    };

    parent.addEventListener('mousemove', handleMouseMove, { passive: true });
    parent.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    parent.addEventListener('touchmove', handleTouchMove, { passive: true });
    parent.addEventListener('touchend', handleMouseLeave, { passive: true });

    // Initialize 105 ambient theatrical gold dust particles (balanced midway)
    const particleCount = 105;
    const particles: DustParticle[] = [];

    const particleColors = [
      'rgba(255, 223, 120, ', // Soft Gold
      'rgba(248, 245, 240, ', // Warm Ivory
      'rgba(253, 186, 116, ', // Vibrant Amber
      'rgba(212, 175, 55, ',  // Classic Theatre Gold
      'rgba(254, 240, 138, ', // Sunbeam Yellow
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -0.15 - Math.random() * 0.2, // Drift gently upwards
        radius: 0.7 + Math.random() * 1.8,
        baseAlpha: 0.05 + Math.random() * 0.08,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        speedMultiplier: 0.6 + Math.random() * 0.8,
        swayAmplitude: 0.15 + Math.random() * 0.35,
        swaySpeed: 0.001 + Math.random() * 0.002,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(time - lastTime, 50);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.phase += p.swaySpeed * delta;
        const sway = Math.sin(p.phase) * p.swayAmplitude;

        p.x += (p.vx + sway) * p.speedMultiplier;
        p.y += p.vy * p.speedMultiplier;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = canvas.height;

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let finalAlpha = p.baseAlpha;
        let isIlluminated = false;

        if (distance < spotlightRadius) {
          isIlluminated = true;
          const illuminationIntensity = 1 - distance / spotlightRadius;
          const glowAlpha = p.baseAlpha + illuminationIntensity * 0.8;
          finalAlpha = Math.min(glowAlpha, 0.9);
        }

        ctx.beginPath();
        if (isIlluminated && p.radius > 1.1) {
          const glowRadius = p.radius * (2 + (1 - distance / spotlightRadius) * 2.5);
          const gradient = ctx.createRadialGradient(p.x, p.y, p.radius * 0.1, p.x, p.y, glowRadius);
          gradient.addColorStop(0, `${p.color}${finalAlpha})`);
          gradient.addColorStop(0.35, `${p.color}${finalAlpha * 0.45})`);
          gradient.addColorStop(1, `${p.color}0)`);
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = `${p.color}${finalAlpha})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      parent.removeEventListener('touchmove', handleTouchMove);
      parent.removeEventListener('touchend', handleMouseLeave);
    };
  }, [containerRef, spotlightRadius]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-15 mix-blend-screen"
      style={{ opacity: 0.95 }}
    />
  );
}
