"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  speed: number;
};

function createStars(count: number, width: number, height: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random(),
    speed: 0.12 + Math.random() * 0.55,
  }));
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const getStarCount = () => {
      if (reducedMotion) return width < 768 ? 50 : 80;
      if (width < 640) return 85;
      if (width < 1024) return 130;
      return 185;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const starCount = getStarCount();
    let stars = createStars(starCount, width, height);

    let rafId = 0;
    const render = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(255,255,255,0.8)";

      stars.forEach((star) => {
        const radius = 0.3 + star.z * 1.6;
        context.globalAlpha = 0.2 + star.z * 0.65;
        context.beginPath();
        context.arc(star.x, star.y, radius, 0, Math.PI * 2);
        context.fill();

        if (!reducedMotion) {
          star.y += star.speed * (0.35 + star.z);
          star.x += Math.sin(star.y * 0.004 + star.z * 9) * 0.08;
        }

        if (star.y > height + 8) {
          star.y = -8;
          star.x = Math.random() * width;
        }
      });

      context.globalAlpha = 1;
      rafId = window.requestAnimationFrame(render);
    };

    render();

    const onResize = () => {
      resize();
      stars = createStars(getStarCount(), width, height);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-70"
    />
  );
}
