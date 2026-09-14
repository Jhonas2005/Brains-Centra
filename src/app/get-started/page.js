"use client";

import React, { useEffect, useRef, useState } from 'react';

// --- Particle Network Background Component ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.radius = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.6)';
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 15000), 120);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            const opacity = 1 - distance / 150;
            ctx.strokeStyle = `rgba(129, 140, 248, ${opacity * 0.4})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      animationFrameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] bg-[#090b14] overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
    </div>
  );
};

export default function GetStarted() {
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("Creating account...");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("Account created successfully! You can now sign in.");
        e.target.reset();
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen text-gray-100 font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-100 flex flex-col items-center justify-center p-6">
      <ParticleBackground />

      <a href="/" className="absolute top-8 left-8 flex items-center text-indigo-300 hover:text-fuchsia-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Platform
      </a>

      <div className="w-full max-w-lg bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl p-8 md:p-10 shadow-[0_0_40px_rgba(217,70,239,0.15)] z-10">
        
        <div className="text-center mb-8">
          <img src="/brains-logo.png" alt="Brains Logo" className="h-10 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-bold text-white mb-2">Deploy Central Command</h1>
          <p className="text-sm text-indigo-300/80">Create your operator account to get started.</p>
        </div>

        {message && <p className="text-center text-sm font-semibold text-fuchsia-400 mb-4">{message}</p>}

        <form className="space-y-5" onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">First Name</label>
              <input name="firstName" type="text" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all" placeholder="Jane" />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Last Name</label>
              <input name="lastName" type="text" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all" placeholder="Doe" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Work Email</label>
            <input name="email" type="email" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all" placeholder="jane@company.com" />
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Company / Property Name</label>
            <input name="company" type="text" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all" placeholder="Nexus Properties" />
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Password</label>
            <input name="password" type="password" required minLength="6" className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(217,70,239,0.4)] active:scale-95 mt-4">
            Create Account
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-indigo-300/80">
            By registering, you agree to the <a href="#" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Terms of Service</a> and <a href="#" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}