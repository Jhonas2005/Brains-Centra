'use client';

import React, { useState, useEffect, useRef } from 'react';

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

// Define all available modules
const ALL_MODULES = [
  { id: "overview", label: "Command Overview", icon: "🌐" },
  { id: "hms", label: "Frontdesk (HMS)", icon: "🏨" },
  { id: "pms", label: "Landlord (PMS)", icon: "🏢" },
  { id: "hvms", label: "Butler (HVMS)", icon: "📋" },
  { id: "bms", label: "Sekyu (BMS)", icon: "🏗️" },
  { id: "iot", label: "Housekeeper (IoT)", icon: "📡" }
];

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [daysLeft, setDaysLeft] = useState(0);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeModule, setActiveModule] = useState("overview"); 

  useEffect(() => {
    // Simulate fetching the logged-in user's data
    const fetchMyProfile = async () => {
      try {
        setLoading(true);
        
        const mockCreatedDate = new Date();
        mockCreatedDate.setDate(mockCreatedDate.getDate() - 4); 

        const mockData = {
          first_name: "Jane",
          company: "Nexus Properties",
          created_at: mockCreatedDate.toISOString(),
          status: "active",
          subscribed_modules: ["hms", "pms"] 
        };

        setUserData(mockData);

        // --- THE TRIAL CALCULATION LOGIC ---
        const trialLength = 14;
        const createdDate = new Date(mockData.created_at);
        const currentDate = new Date();
        
        const diffTime = Math.abs(currentDate - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const remaining = trialLength - diffDays;
        setDaysLeft(remaining > 0 ? remaining : 0);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  const handleLogout = () => {
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b14]">
        <ParticleBackground />
        <div className="text-lg text-indigo-400 animate-pulse z-10 font-mono tracking-widest">
          INITIALIZING WORKSPACE...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-gray-100 font-sans selection:bg-fuchsia-500/30 py-8">
      <ParticleBackground />

      {/* --- Logout Confirmation Modal --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative w-full max-w-sm bg-[#13172e] border border-indigo-800/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(217,70,239,0.15)] z-10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Sign Out</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Are you sure you want to log out of your workspace?</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-lg active:scale-95"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-[#090b14] border border-indigo-700 hover:border-fuchsia-500 text-indigo-200 font-bold py-2 px-4 rounded-lg transition-all active:scale-95"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGED: max-w-7xl -> max-w-[1600px] and px-6 -> px-8 lg:px-12 */}
      <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-12 mb-8 flex justify-between items-center z-10 relative border-b border-indigo-900/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome, {userData?.first_name}
          </h1>
          <p className="text-indigo-300/80 text-sm font-mono tracking-wide">{userData?.company} • Operator Workspace</p>
        </div>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="px-5 py-2.5 bg-[#13172e]/80 hover:bg-[#1a1f3c]/80 text-indigo-200 text-sm font-semibold rounded-lg border border-indigo-700/50 transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          Sign Out
        </button>
      </div>

      {/* CHANGED: max-w-7xl -> max-w-[1600px] and px-6 -> px-8 lg:px-12 */}
      <div className="relative w-full max-w-[1600px] mx-auto px-8 lg:px-12 z-10 flex flex-col lg:flex-row gap-8">
        
        {/* ========================================= */}
        {/* SIDEBAR START                             */}
        {/* ========================================= */}
        {/* CHANGED: w-64 -> w-72 for a slightly wider, more proportionate sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-2">
          <div className="text-xs font-bold text-indigo-400/60 uppercase tracking-widest mb-2 px-3">
            Navigation
          </div>
          
          {ALL_MODULES.map((module) => {
            const isOverview = module.id === 'overview';
            const isSubscribed = userData?.subscribed_modules?.includes(module.id);
            const isClickable = isOverview || isSubscribed;
            const isActive = activeModule === module.id;

            return (
              <button
                key={module.id}
                onClick={() => isClickable && setActiveModule(module.id)}
                disabled={!isClickable}
                className={`flex items-center text-left w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-fuchsia-900/40 to-blue-900/40 border border-fuchsia-500/50 text-white shadow-[0_0_15px_rgba(217,70,239,0.15)]' 
                    : isClickable
                      ? 'bg-transparent border border-transparent text-indigo-200 hover:bg-[#13172e]/80 hover:border-indigo-700/50'
                      : 'bg-transparent border border-transparent text-indigo-500/40 cursor-not-allowed'
                }`}
              >
                <span className="text-lg mr-3 opacity-90 group-hover:scale-110 transition-transform">{module.icon}</span>
                <span className="flex-1 text-sm font-semibold">{module.label}</span>
                
                {!isClickable && (
                  <svg className="w-4 h-4 text-indigo-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {/* ========================================= */}
        {/* SIDEBAR END                               */}
        {/* ========================================= */}

        {/* ========================================= */}
        {/* MAIN WORKSPACE START                      */}
        {/* ========================================= */}
        <div className="flex-grow flex flex-col gap-6 w-full overflow-hidden">
          
          {/* TRIAL BANNER */}
          <div className="relative overflow-hidden bg-[#13172e]/90 backdrop-blur-md rounded-2xl border border-amber-500/30 shadow-[0_8px_30px_rgba(245,158,11,0.15)] p-6 flex flex-col md:flex-row items-center justify-between group w-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-fuchsia-500 to-blue-500 opacity-70"></div>

            <div className="flex items-center gap-5 mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 flex items-center justify-center bg-[#090b14]/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex-shrink-0">
                <span className="text-2xl font-bold text-amber-400">{daysLeft}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  Free Trial Active
                  {daysLeft <= 3 && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/50 uppercase tracking-widest animate-pulse">Ending Soon</span>}
                </h2>
                <p className="text-sm text-indigo-200/80">
                  You have <span className="font-bold text-amber-400">{daysLeft} days</span> remaining of full platform access.
                </p>
              </div>
            </div>
            <button className="w-full md:w-auto bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(217,70,239,0.4)] active:scale-95 whitespace-nowrap">
              Upgrade to Full Access
            </button>
          </div>

          {/* DYNAMIC CONTENT AREA */}
          <div className="bg-[#13172e]/50 border border-indigo-800/30 rounded-2xl p-6 md:p-8 min-h-[600px] w-full flex flex-col">
            
            {activeModule === 'overview' && (
              <div className="h-full flex flex-col gap-6 w-full">
                
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-indigo-800/50 pb-4 gap-4 w-full">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-2xl">🌐</span> Command Overview
                    </h3>
                    <p className="text-sm text-indigo-300/60 mt-1">System telemetry and aggregate metrics across all active modules</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">All Systems Operational</span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
                  <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-5 shadow-lg">
                    <div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">TOTAL PROPERTIES</div>
                    <div className="text-3xl text-white font-bold">2</div>
                  </div>
                  <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-5 shadow-lg">
                    <div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">ACTIVE LEASES</div>
                    <div className="text-3xl text-white font-bold">128</div>
                  </div>
                  <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-5 shadow-lg">
                    <div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">OPEN ALERTS</div>
                    <div className="text-3xl text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">3</div>
                  </div>
                  <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-5 shadow-lg">
                    <div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">NETWORK I/O</div>
                    <div className="text-3xl text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">99.8%</div>
                  </div>
                </div>

                {/* --- NEW: Split Bottom Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 w-full flex-grow">
                  
                  {/* Left Column: Recent Activity (Spans 2/3 of space) */}
                  <div className="lg:col-span-2 bg-[#090b14]/40 border border-indigo-800/30 rounded-xl p-6 flex flex-col h-full shadow-lg">
                    <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 border-b border-indigo-900/50 pb-2">Live Activity Feed</h4>
                    
                    <div className="flex flex-col gap-5 overflow-y-auto pr-2">
                      {[
                        { time: '10:42 AM', event: 'Frontdesk: VIP Guest Checked In (Room 402)', type: 'info', user: 'Auto' },
                        { time: '10:15 AM', event: 'Landlord: New Maintenance Ticket #8821 Created', type: 'warning', user: 'Tenant App' },
                        { time: '09:30 AM', event: 'Housekeeper: IoT Thermostat Offline (Zone B)', type: 'error', user: 'System' },
                        { time: '08:00 AM', event: 'System: Daily automated database backup completed', type: 'success', user: 'Server' },
                        { time: '07:45 AM', event: 'Frontdesk: Night Audit finalized successfully', type: 'info', user: 'Jane (Admin)' },
                      ].map((log, i) => (
                        <div key={i} className="flex items-start gap-4 hover:bg-indigo-900/10 p-2 -mx-2 rounded transition-colors">
                          <span className="text-xs font-mono text-indigo-400/60 mt-0.5 min-w-[75px]">{log.time}</span>
                          <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                            log.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                            log.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' :
                            log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                            'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                          }`}></span>
                          <div className="flex-1">
                            <p className="text-sm text-indigo-100">{log.event}</p>
                            <p className="text-[10px] text-indigo-400/50 font-mono mt-1">SOURCE: {log.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Quick Actions & Health (Spans 1/3 of space) */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    
                    {/* Quick Actions Panel */}
                    <div className="bg-[#13172e]/60 border border-fuchsia-500/20 rounded-xl p-6 shadow-lg">
                      <h4 className="text-sm font-bold text-fuchsia-300 uppercase tracking-widest mb-4">Quick Actions</h4>
                      <div className="flex flex-col gap-3">
                        <button className="flex items-center justify-between w-full bg-[#090b14] border border-indigo-700/50 hover:border-fuchsia-500/50 text-indigo-200 text-sm py-3 px-4 rounded-lg transition-colors group">
                          <span>🏨 New Reservation</span>
                          <span className="text-indigo-500 group-hover:text-fuchsia-400 transition-colors">→</span>
                        </button>
                        <button className="flex items-center justify-between w-full bg-[#090b14] border border-indigo-700/50 hover:border-fuchsia-500/50 text-indigo-200 text-sm py-3 px-4 rounded-lg transition-colors group">
                          <span>🏢 Create Work Order</span>
                          <span className="text-indigo-500 group-hover:text-fuchsia-400 transition-colors">→</span>
                        </button>
                        <button className="flex items-center justify-between w-full bg-[#090b14] border border-indigo-700/50 hover:border-fuchsia-500/50 text-indigo-200 text-sm py-3 px-4 rounded-lg transition-colors group">
                          <span>📢 Broadcast Message</span>
                          <span className="text-indigo-500 group-hover:text-fuchsia-400 transition-colors">→</span>
                        </button>
                      </div>
                    </div>

                    {/* System Health Panel */}
                    <div className="bg-[#090b14]/40 border border-indigo-800/30 rounded-xl p-6 flex-grow shadow-lg">
                      <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">Module Health</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-indigo-200 font-mono">Database Load</span>
                            <span className="text-emerald-400">12%</span>
                          </div>
                          <div className="w-full bg-indigo-950/50 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-indigo-200 font-mono">API Latency</span>
                            <span className="text-emerald-400">45ms</span>
                          </div>
                          <div className="w-full bg-indigo-950/50 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-indigo-200 font-mono">Storage Used</span>
                            <span className="text-amber-400">78%</span>
                          </div>
                          <div className="w-full bg-indigo-950/50 rounded-full h-1.5">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {activeModule === 'hms' && (
              <div>
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-indigo-800/50 pb-4"><span className="text-2xl">🏨</span> Frontdesk (HMS)</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-6 shadow-lg"><div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">OCCUPANCY</div><div className="text-3xl text-white font-bold">82%</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-6 shadow-lg"><div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">ARRIVALS TODAY</div><div className="text-3xl text-white font-bold">14</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-6 shadow-lg"><div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">PENDING REQUESTS</div><div className="text-3xl text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">3</div></div>
                 </div>
              </div>
            )}

            {activeModule === 'pms' && (
              <div>
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-indigo-800/50 pb-4"><span className="text-2xl">🏢</span> Landlord (PMS)</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-6 shadow-lg"><div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">ACTIVE LEASES</div><div className="text-3xl text-white font-bold">128</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-6 shadow-lg"><div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">OPEN WORK ORDERS</div><div className="text-3xl text-fuchsia-400 font-bold drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">7</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-6 shadow-lg"><div className="text-xs text-indigo-400 font-bold mb-2 tracking-wider">COLLECTION RATE</div><div className="text-3xl text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">94%</div></div>
                 </div>
              </div>
            )}

          </div>

        </div>
        {/* ========================================= */}
        {/* MAIN WORKSPACE END                        */}
        {/* ========================================= */}

      </div>
    </div>
  );
}