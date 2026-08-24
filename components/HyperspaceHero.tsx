"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";

export function HyperspaceHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.offsetWidth);
    let height = (canvas.height = container.offsetHeight);

    const stars: {
      x: number;
      y: number;
      z: number;
      color: string;
    }[] = [];
    const numStars = 120;
    const warpSpeed = 8;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        color: Math.random() > 0.4 ? "#6ff163" : "#cbd5e1",
      });
    }

    const resize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
    };

    const animate = () => {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        star.z -= warpSpeed;

        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          continue;
        }

        const x = (star.x / star.z) * (width / 2) + centerX;
        const y = (star.y / star.z) * (height / 2) + centerY;
        const prevZ = star.z + warpSpeed * 6.5;
        const px = (star.x / prevZ) * (width / 2) + centerX;
        const py = (star.y / prevZ) * (height / 2) + centerY;

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
          ctx.beginPath();
          ctx.strokeStyle = star.color;
          ctx.lineWidth = Math.min(1.5, (1 - star.z / width) * 2.5);
          ctx.lineCap = "round";
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative isolate w-full min-h-[85svh] md:h-screen bg-slate-50 flex flex-col items-center justify-center overflow-hidden border-b border-slate-100 pt-20 md:pt-0"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 -z-20 pointer-events-none block"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent -z-10 pointer-events-none" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl flex flex-col items-center select-none pointer-events-auto">
        <div
          className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-[11px] font-bold text-green-600 tracking-wider uppercase"
        >
          Figurines & Sculptures
        </div>

        <h1
          className="text-[2.75rem] sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none mb-6 sm:mb-8 text-slate-900"
        >
          FIGURI
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-green-900">
            NUM
          </span>
        </h1>

        <p
          className="text-sm sm:text-lg text-slate-600 max-w-xl mb-8 sm:mb-10 leading-relaxed font-normal"
        >
          Plongez dans la pureté des formes. Découvrez des pièces d&apos;art
          contemporain et des sculptures d&apos;avant-garde au design céramique
          minimaliste.
        </p>

        <a
          href="#shop"
          className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-sm sm:text-base text-white font-semibold tracking-wider transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-lg"
        >
          Découvrir la Collection
        </a>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <ArrowDown className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer" size={20} />
      </div>
    </div>
  );
}
