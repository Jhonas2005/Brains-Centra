"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function FreeTrial() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  // NEW: State for missing account verification
  const [showNoAccountModal, setShowNoAccountModal] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      // Pointing to our new validation endpoint instead of register
      const res = await fetch('/api/request-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      // Trigger missing account modal if 404 is returned
      if (res.status === 404) {
        setShowNoAccountModal(true);
      } 
      // Trigger success sequence
      else if (res.ok) {
        setShowVerificationModal(true);
        e.target.reset();
        setTimeout(() => {
          router.push('/');
        }, 4000);
      } 
      // Handle standard errors
      else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen text-gray-100 font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-100 flex flex-col items-center justify-center p-6">
      <ParticleBackground />

      {/* --- ACCOUNT NOT FOUND MODAL --- */}
      {showNoAccountModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm"></div>
          
          <div className="relative w-full max-w-md bg-[#13172e] border border-red-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(239,68,68,0.25)] z-10 text-center animate-pulse">
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 border border-red-500/50 mb-6">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Account Not Found</h3>
            <p className="text-sm text-indigo-200 mb-8">
              We couldn't find an existing Central Command account with that email. You must create an account before requesting a free trial.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => router.push('/get-started')}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg active:scale-95"
              >
                Create an Account
              </button>
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-[#090b14] border border-indigo-700 hover:border-fuchsia-500 text-indigo-200 font-bold py-3 px-4 rounded-lg transition-all active:scale-95"
              >
                Sign In Instead
              </button>
              <button 
                onClick={() => setShowNoAccountModal(false)}
                className="w-full text-xs text-indigo-400 hover:text-white mt-2 transition-colors"
              >
                Close and try a different email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUCCESS VERIFICATION MODAL --- */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm"></div>
          
          <div className="relative w-full max-w-md bg-[#13172e] border border-amber-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.25)] z-10 text-center animate-pulse">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 border border-amber-500/50 mb-6">
              <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Verification Required</h3>
            <p className="text-sm text-indigo-200 mb-2">
              Your free trial account has been successfully verified and is now <span className="font-bold text-amber-400">pending approval</span>.
            </p>
            <p className="text-xs text-indigo-300/80 mb-8">
              An administrator must approve your request before you can access the dashboard. You will receive an email once your account is active.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-fuchsia-400 text-sm font-mono tracking-widest">
              <svg className="animate-spin h-4 w-4 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>REDIRECTING TO LOGIN...</span>
            </div>
          </div>
        </div>
      )}

      <a href="/" className="absolute top-8 left-8 flex items-center text-indigo-300 hover:text-fuchsia-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Platform
      </a>

      <div className="w-full max-w-lg bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl p-8 md:p-10 shadow-[0_0_40px_rgba(217,70,239,0.15)] z-10">
        
        <div className="text-center mb-8">
          <img src="/brains-logo.png" alt="Brains Logo" className="h-10 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-bold text-white mb-2">Request 14-day free trial</h1>
          <p className="text-sm text-indigo-300/80">Create an account before requesting. Existing operators can request platform access here.</p>
        </div>

        {errorMessage && <p className="text-center text-sm font-semibold text-red-400 mb-4">{errorMessage}</p>}

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
            <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Company Name</label>
            <input name="company" type="text" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all" placeholder="Nexus Properties" />
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Password</label>
            <input name="password" type="password" required minLength="6" className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all" placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Primary Module of Interest</label>
            <select name="moduleInterest" className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all appearance-none cursor-pointer">
              <option value="hms">Hotel Management System (Frontdesk)</option>
              <option value="pms">Property Management System (Landlord)</option>
              <option value="hvms">Hotel-Visitor Management System (Butler)</option>
              <option value="bms">Building Management System (Sekyu)</option>
              <option value="iot">Internet of Things (Housekeeper)</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(217,70,239,0.4)] active:scale-95 mt-4">
            Request Free Trial
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-indigo-300/80">
            Already verified? <a href="/" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-semibold">Sign in here</a>.
          </p>
        </div>
      </div>
    </div>
  );
}