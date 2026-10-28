'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

// --- Particle Background ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); };
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1; this.vy = (Math.random() - 0.5) * 1;
        this.radius = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.6)'; ctx.fill();
      }
    }
    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 15000), 120);
      for (let i = 0; i < numParticles; i++) particles.push(new Particle());
    };
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath(); const opacity = 1 - distance / 150;
            ctx.strokeStyle = `rgba(129, 140, 248, ${opacity * 0.4})`; ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); }); drawLines();
      animationFrameId = window.requestAnimationFrame(animate);
    };
    window.addEventListener('resize', resizeCanvas); resizeCanvas(); animate();
    return () => { window.removeEventListener('resize', resizeCanvas); window.cancelAnimationFrame(animationFrameId); };
  }, []);
  return (
    <div className="fixed inset-0 z-[-1] bg-[#090b14] overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
    </div>
  );
};

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let cancelled = false;

    // Supabase parses the recovery token out of the URL hash asynchronously,
    // so a session may appear a moment after the page mounts.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && !cancelled) {
        setUser(session.user);
        setChecking(false);
      }
    });

    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (session?.user) {
        setUser(session.user);
      } else {
        setSessionError(
          'This reset link is invalid or has expired. Request a new code from the sign-in screen.'
        );
      }
      setChecking(false);
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Confirmation email is generated server-side from the verified session
      const { data: { session } } = await supabase.auth.getSession();

      await fetch('/api/auth/password-changed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      setMessage('Password updated securely! Redirecting to your dashboard...');
      
      setTimeout(() => {
        router.replace('/user-dashboard');
      }, 2000);

    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#090b14] flex items-center justify-center p-4 font-sans">
        {checking ? (
          <div className="text-indigo-400 animate-pulse font-mono tracking-widest text-sm">Verifying secure token...</div>
        ) : (
          <div className="w-full max-w-md bg-[#13172e]/80 backdrop-blur-xl border border-indigo-800/50 rounded-2xl p-8 text-center relative z-10">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-black text-white mb-2 tracking-tight">Link no longer valid</h2>
            <p className="text-xs text-indigo-300/80 leading-relaxed mb-6">{sessionError}</p>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-gray-100 selection:bg-fuchsia-500/30">
      <ParticleBackground />
      
      <div className="w-full max-w-md bg-[#13172e]/80 backdrop-blur-xl border border-indigo-800/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(79,70,229,0.15)] relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-fuchsia-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Secure Password Reset</h2>
          <p className="text-xs text-indigo-300/80">Enter a new password for <span className="font-bold text-white">{user.email}</span></p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">New Password</label>
            <input 
              type="password" 
              required 
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#090b14] border border-indigo-800/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all shadow-inner" 
              placeholder="••••••••" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
            <input 
              type="password" 
              required 
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#090b14] border border-indigo-800/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all shadow-inner" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(217,70,239,0.3)] active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Securing Account...' : 'Update & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}