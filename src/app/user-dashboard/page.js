'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // <-- Connects to Supabase!

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

// --- UPDATED: Module Prices in PHP ---
const ALL_MODULES = [
  { id: "overview", label: "Command Overview", shortName: "HOME", icon: "🌐" },
  { id: "hms", label: "Frontdesk (HMS)", shortName: "HMS", icon: "🏨", price: 8500 },
  { id: "pms", label: "Landlord (PMS)", shortName: "PMS", icon: "🏢", price: 11500 },
  { id: "hvms", label: "Butler (HVMS)", shortName: "HVMS", icon: "📋", price: 5500 },
  { id: "bms", label: "Sekyu (BMS)", shortName: "BMS", icon: "🏗️", price: 14500 },
  { id: "iot", label: "Housekeeper (IoT)", shortName: "IoT", icon: "📡", price: 17000 },
  { id: "subscription", label: "Subscription", shortName: "SUBS", icon: "💳" }
];

// Helper formatting function for Philippine Pesos
const formatPHP = (amount) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [billingData, setBillingData] = useState({ payment_methods: [], invoices: [] });
  const [daysLeft, setDaysLeft] = useState(0);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeModule, setActiveModule] = useState("overview"); 

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradeModules, setSelectedUpgradeModules] = useState([]);
  const [cardNumber, setCardNumber] = useState('');
  const [upgradeProcessing, setUpgradeProcessing] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [moduleToCancel, setModuleToCancel] = useState(null); 
  const [cancelProcessing, setCancelProcessing] = useState(false);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  // --- LIVE DATA FETCHING ---
  const fetchMyProfileAndBilling = async () => {
    try {
      setLoading(true);

      // 1. Get the currently logged-in user from Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.getUser();

      // If nobody is logged in, redirect to login
      if (authError || !authData?.user) {
        window.location.href = '/';
        return;
      }

      const realUserId = authData.user.id;

      // 2. Fetch their actual profile from the database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', realUserId)
        .single();

      if (profileError) throw profileError;

      // Ensure subscribed_modules is an array
      const safeProfile = {
        ...profile,
        subscribed_modules: profile.subscribed_modules || []
      };

      setUserData(safeProfile);

      // 3. Fetch Billing details from API endpoint
      const res = await fetch(`/api/user/billing?userId=${realUserId}`);
      if (res.ok) {
        const billingJson = await res.json();
        setBillingData(billingJson);
        if (billingJson.subscribed_modules) {
          setUserData(prev => ({ ...prev, subscribed_modules: billingJson.subscribed_modules }));
        }
      }

      // 4. Calculate trial days
      const trialLength = 14;
      const createdDate = new Date(safeProfile.created_at);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const remaining = trialLength - diffDays;
      setDaysLeft(remaining > 0 ? remaining : 0);

    } catch (err) {
      console.error("Error loading profile:", err);
      showNotification("Failed to load user profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfileAndBilling();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleUpgradeSubmit = async () => {
    if (selectedUpgradeModules.length === 0) return;
    setUpgradeProcessing(true);

    try {
      const updatedModules = [...userData.subscribed_modules, ...selectedUpgradeModules];

      const totalPrice = selectedUpgradeModules.reduce((sum, modId) => {
        const modObj = ALL_MODULES.find(m => m.id === modId);
        return sum + (modObj?.price || 0);
      }, 0);

      const paymentInfo = cardNumber ? { brand: 'Visa', last4: cardNumber.slice(-4) || '4242', expMonth: 12, expYear: 2028 } : null;

      const res = await fetch('/api/user/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userData.id, 
          newModules: updatedModules,
          paymentDetails: paymentInfo,
          amountCharged: totalPrice,
          description: `Purchased modules: ${selectedUpgradeModules.join(', ').toUpperCase()}`
        })
      });

      if (!res.ok) throw new Error("Failed to process payment update");

      setUserData(prev => ({ ...prev, subscribed_modules: updatedModules }));
      setSelectedUpgradeModules([]);
      setShowUpgradeModal(false);
      setCardNumber('');
      showNotification("Upgrade successful! Payment recorded and modules unlocked.", "success");

      fetchMyProfileAndBilling(); 

    } catch (error) {
      console.error(error);
      showNotification("An error occurred while processing your upgrade.", "error");
    } finally {
      setUpgradeProcessing(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!moduleToCancel) return;
    setCancelProcessing(true);

    try {
      let updatedModules = userData.subscribed_modules;

      if (moduleToCancel === 'all') {
        updatedModules = [];
      } else {
        updatedModules = userData.subscribed_modules.filter(id => id !== moduleToCancel);
      }

      const res = await fetch('/api/user/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userData.id, 
          newModules: updatedModules
        })
      });

      if (!res.ok) throw new Error("Failed to update subscription");

      setUserData(prev => ({ ...prev, subscribed_modules: updatedModules }));
      showNotification("Subscription updated successfully.", "success");

      if (moduleToCancel === 'all' || activeModule === moduleToCancel) {
        setActiveModule("overview");
      }

      setShowCancelModal(false);
      setModuleToCancel(null);
      fetchMyProfileAndBilling();

    } catch (error) {
      console.error(error);
      showNotification("An error occurred while processing your cancellation.", "error");
    } finally {
      setCancelProcessing(false);
    }
  };

  const availableModulesToBuy = ALL_MODULES.filter(m => 
    !['overview', 'subscription'].includes(m.id) && 
    !userData?.subscribed_modules?.includes(m.id)
  );

  // Total price dynamically updating in the modal
  const upgradeTotal = selectedUpgradeModules.reduce((sum, modId) => {
    const modObj = ALL_MODULES.find(m => m.id === modId);
    return sum + (modObj?.price || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b14]">
        <ParticleBackground />
        <div className="text-lg text-indigo-400 animate-pulse z-10 font-mono tracking-widest">
          ESTABLISHING SECURE CONNECTION...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-gray-100 font-sans selection:bg-fuchsia-500/30 py-6 md:py-8">
      <ParticleBackground />

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setNotification({ ...notification, show: false })}></div>
          <div className={`relative w-full max-w-sm bg-[#13172e] border rounded-2xl p-6 md:p-8 shadow-2xl z-10 text-center ${notification.type === 'error' ? 'border-red-500/50' : 'border-emerald-500/50'}`}>
            <h3 className="text-xl font-bold text-white mb-2">{notification.type === 'error' ? 'Action Failed' : 'Success'}</h3>
            <p className="text-sm text-indigo-300/80 mb-6">{notification.message}</p>
            <button onClick={() => setNotification({ ...notification, show: false })} className="w-full bg-[#090b14] border border-indigo-700 text-white font-bold py-3 rounded-lg">Okay</button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setShowCancelModal(false)}></div>
          <div className="relative w-full max-w-sm bg-[#13172e] border border-red-500/50 rounded-2xl p-6 md:p-8 z-10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Cancel {moduleToCancel === 'all' ? 'Subscription' : 'Module'}</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Are you sure you want to cancel? You will lose access immediately.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleCancelSubmit} disabled={cancelProcessing} className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg">Yes, Cancel</button>
              <button onClick={() => setShowCancelModal(false)} className="flex-1 bg-[#090b14] border border-indigo-700 text-indigo-200 font-bold py-2 rounded-lg">Go Back</button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal - UPDATED WITH PHP */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setShowUpgradeModal(false)}></div>
          <div className="relative w-full max-w-md bg-[#13172e] border border-fuchsia-500/50 rounded-2xl p-6 md:p-8 z-10">
            <h3 className="text-xl font-bold text-white mb-2">Upgrade Subscription</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Select additional modules to add to your Command Center.</p>

            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
              {availableModulesToBuy.length > 0 ? (
                availableModulesToBuy.map(module => (
                  <label key={module.id} className="flex items-center justify-between p-3 rounded-lg border border-indigo-800/50 bg-[#090b14]/50 cursor-pointer hover:border-fuchsia-500/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        value={module.id} 
                        checked={selectedUpgradeModules.includes(module.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedUpgradeModules([...selectedUpgradeModules, module.id]);
                          else setSelectedUpgradeModules(selectedUpgradeModules.filter(id => id !== module.id));
                        }} 
                        className="accent-fuchsia-500 w-4 h-4 rounded" 
                      />
                      <span className="text-xl">{module.icon}</span>
                      <span className="text-sm font-semibold text-white">{module.label}</span>
                    </div>
                    {/* FORMATTED AS PHP */}
                    <span className="text-xs font-bold text-emerald-400">{formatPHP(module.price)}/mo</span>
                  </label>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-emerald-400 font-semibold border border-emerald-500/30 rounded-lg bg-emerald-500/10">
                  You have unlocked all available modules!
                </div>
              )}
            </div>

            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Payment Information</h4>
            <div className="space-y-3 mb-8">
              <input 
                type="text" 
                placeholder="Card Number (e.g., 4242 4242...)" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full bg-[#090b14] border border-indigo-700/50 rounded-lg px-4 py-3 text-sm text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50" 
              />
            </div>

            <div className="flex gap-4 items-center">
              <button onClick={handleUpgradeSubmit} disabled={upgradeProcessing || selectedUpgradeModules.length === 0} className="flex-1 bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                {upgradeProcessing ? 'Processing...' : `Pay ${formatPHP(upgradeTotal)}`}
              </button>
              <button onClick={() => setShowUpgradeModal(false)} className="flex-1 bg-[#090b14] border border-indigo-700 text-indigo-200 font-bold py-3 rounded-lg hover:bg-[#13172e]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative w-full max-w-sm bg-[#13172e] border border-indigo-800/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(217,70,239,0.15)] z-10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Sign Out</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Are you sure you want to log out of your workspace?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleLogout} className="flex-1 bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white font-bold py-2 rounded-lg hover:opacity-90">Yes</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-[#090b14] border border-indigo-700 text-indigo-200 font-bold py-2 rounded-lg hover:bg-[#13172e]">No</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header & Workspace Layout */}
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 mb-6 md:mb-8 flex flex-row justify-between items-center z-10 relative border-b border-indigo-900/50 pb-4 md:pb-6">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-white mb-1">Welcome, {userData?.first_name}</h1>
          <p className="text-indigo-300/80 text-[10px] md:text-sm font-mono tracking-wide">{userData?.company} • Operator Workspace</p>
        </div>
        <button onClick={() => setShowLogoutConfirm(true)} className="px-4 md:px-5 py-2 bg-[#13172e]/80 text-indigo-200 text-xs md:text-sm font-semibold rounded-lg border border-indigo-700/50 hover:bg-[#1a1f3c]/80 transition-colors">Sign Out</button>
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-2 md:px-4 lg:px-12 z-10 flex flex-row gap-3 md:gap-6 lg:gap-8">
        
        {/* Sidebar */}
        <div className="w-[70px] sm:w-20 lg:w-72 flex-shrink-0 flex flex-col gap-2 pt-2 md:pt-0">
          <div className="flex flex-col gap-2 w-full">
            {ALL_MODULES.map((module) => {
              const isAlwaysAccessible = module.id === 'overview' || module.id === 'subscription';
              const isSubscribed = userData?.subscribed_modules?.includes(module.id);
              const isClickable = isAlwaysAccessible || isSubscribed;
              const isActive = activeModule === module.id;

              return (
                <button
                  key={module.id}
                  onClick={() => isClickable && setActiveModule(module.id)}
                  disabled={!isClickable}
                  className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start w-full px-2 lg:px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-gradient-to-r from-fuchsia-900/40 to-blue-900/40 border border-fuchsia-500/50 text-white' : isClickable ? 'text-indigo-200 hover:bg-[#13172e]/80' : 'text-indigo-500/40 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xl lg:mr-3 group-hover:scale-110 transition-transform">{module.icon}</span>
                  <span className="flex-1 text-[9px] lg:text-sm font-semibold text-center lg:text-left">{module.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-grow flex flex-col gap-4 md:gap-6 w-full overflow-hidden min-w-0">
          
          <div className="bg-[#13172e]/50 border border-indigo-800/30 rounded-2xl p-4 md:p-8 min-h-[600px] w-full flex flex-col mb-10">
            
            {/* OVERVIEW MODULE */}
            {activeModule === 'overview' && (
              <div className="h-full flex flex-col gap-4 md:gap-6 w-full">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-indigo-800/50 pb-4 gap-4 w-full">
                  <div>
                    <h3 className="text-base md:text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-xl md:text-2xl">🌐</span> Command Overview
                    </h3>
                    <p className="text-[10px] md:text-sm text-indigo-300/60 mt-1">System telemetry and aggregate metrics across all active modules</p>
                  </div>
                  
                  <div className="flex items-center gap-3 self-start lg:self-auto">
                    <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                      <span className="text-[9px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest hidden sm:inline">All Systems Operational</span>
                      <span className="text-[9px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest sm:hidden">Operational</span>
                    </div>
                    <button 
                      onClick={() => setShowUpgradeModal(true)} 
                      className="bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white text-[10px] md:text-xs font-bold py-1.5 md:py-2 px-4 rounded-full transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] active:scale-95 whitespace-nowrap"
                    >
                      + Upgrade
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 w-full">
                  <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-3 md:p-5 shadow-lg">
                    <div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">PROPERTIES</div>
                    <div className="text-xl md:text-3xl text-white font-bold">2</div>
                  </div>
                  <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-3 md:p-5 shadow-lg">
                    <div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">LEASES</div>
                    <div className="text-xl md:text-3xl text-white font-bold">128</div>
                  </div>
                  <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-3 md:p-5 shadow-lg">
                    <div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">OPEN ALERTS</div>
                    <div className="text-xl md:text-3xl text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">3</div>
                  </div>
                  <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-3 md:p-5 shadow-lg">
                    <div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">NETWORK</div>
                    <div className="text-xl md:text-3xl text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">99%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-2 w-full flex-grow">
                  <div className="lg:col-span-2 bg-[#090b14]/40 border border-indigo-800/30 rounded-xl p-4 md:p-6 flex flex-col h-full shadow-lg">
                    <h4 className="text-xs md:text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4 border-b border-indigo-900/50 pb-2">Live Activity Feed</h4>
                    <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                      {[
                        { time: '10:42 AM', event: 'Frontdesk: VIP Guest Checked In (Room 402)', type: 'info', user: 'Auto' },
                        { time: '10:15 AM', event: 'Landlord: New Maintenance Ticket #8821 Created', type: 'warning', user: 'Tenant App' },
                        { time: '09:30 AM', event: 'Housekeeper: IoT Thermostat Offline (Zone B)', type: 'error', user: 'System' },
                        { time: '08:00 AM', event: 'System: Daily automated database backup completed', type: 'success', user: 'Server' },
                        { time: '07:45 AM', event: 'Frontdesk: Night Audit finalized successfully', type: 'info', user: 'Jane (Admin)' },
                      ].map((log, i) => (
                        <div key={i} className="flex items-start gap-2 md:gap-4 hover:bg-indigo-900/10 p-2 -mx-2 rounded transition-colors">
                          <span className="text-[9px] md:text-xs font-mono text-indigo-400/60 mt-0.5 min-w-[55px] md:min-w-[75px]">{log.time}</span>
                          <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full mt-1 flex-shrink-0 ${
                            log.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                            log.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' :
                            log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                            'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                          }`}></span>
                          <div className="flex-1">
                            <p className="text-xs md:text-sm text-indigo-100">{log.event}</p>
                            <p className="text-[8px] md:text-[10px] text-indigo-400/50 font-mono mt-1">SOURCE: {log.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
                    <div className="bg-[#13172e]/60 border border-fuchsia-500/20 rounded-xl p-4 md:p-6 shadow-lg">
                      <h4 className="text-xs md:text-sm font-bold text-fuchsia-300 uppercase tracking-widest mb-4">Quick Actions</h4>
                      <div className="flex flex-col gap-2 md:gap-3">
                        <button className="flex items-center justify-between w-full bg-[#090b14] border border-indigo-700/50 hover:border-fuchsia-500/50 text-indigo-200 text-xs md:text-sm py-2 md:py-3 px-3 md:px-4 rounded-lg transition-colors group">
                          <span className="truncate pr-2">🏨 New Reservation</span>
                          <span className="text-indigo-500 group-hover:text-fuchsia-400 transition-colors">→</span>
                        </button>
                        <button className="flex items-center justify-between w-full bg-[#090b14] border border-indigo-700/50 hover:border-fuchsia-500/50 text-indigo-200 text-xs md:text-sm py-2 md:py-3 px-3 md:px-4 rounded-lg transition-colors group">
                          <span className="truncate pr-2">🏢 Create Work Order</span>
                          <span className="text-indigo-500 group-hover:text-fuchsia-400 transition-colors">→</span>
                        </button>
                        <button className="flex items-center justify-between w-full bg-[#090b14] border border-indigo-700/50 hover:border-fuchsia-500/50 text-indigo-200 text-xs md:text-sm py-2 md:py-3 px-3 md:px-4 rounded-lg transition-colors group">
                          <span className="truncate pr-2">📢 Broadcast Message</span>
                          <span className="text-indigo-500 group-hover:text-fuchsia-400 transition-colors">→</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#090b14]/40 border border-indigo-800/30 rounded-xl p-4 md:p-6 flex-grow shadow-lg">
                      <h4 className="text-xs md:text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">Module Health</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-[9px] md:text-xs mb-1">
                            <span className="text-indigo-200 font-mono">DB Load</span>
                            <span className="text-emerald-400">12%</span>
                          </div>
                          <div className="w-full bg-indigo-950/50 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] md:text-xs mb-1">
                            <span className="text-indigo-200 font-mono">API Ping</span>
                            <span className="text-emerald-400">45ms</span>
                          </div>
                          <div className="w-full bg-indigo-950/50 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] md:text-xs mb-1">
                            <span className="text-indigo-200 font-mono">Storage</span>
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

            {/* SUBSCRIPTION MODULE - UPDATED WITH PHP */}
            {activeModule === 'subscription' && (
              <div className="h-full flex flex-col gap-4 md:gap-6 w-full">
                <div className="flex flex-col border-b border-indigo-800/50 pb-4 w-full">
                  <h3 className="text-base md:text-xl font-bold text-white flex items-center gap-2">💳 Subscription & Billing</h3>
                  <p className="text-[10px] md:text-sm text-indigo-300/60 mt-1">Manage your active plans, payment methods, and invoices recorded in Supabase.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full">
                  <div className="lg:col-span-2 bg-[#090b14]/60 border border-amber-500/40 rounded-xl p-5 shadow-lg">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Purchased Modules</h4>
                    <div className="flex flex-col gap-3 mt-4">
                      {userData?.subscribed_modules?.length > 0 ? userData.subscribed_modules.map(mod => {
                        const fullMod = ALL_MODULES.find(m => m.id === mod);
                        return (
                          <div key={mod} className="flex items-center justify-between p-3 bg-[#090b14]/50 border border-indigo-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{fullMod?.icon}</span> 
                              <span className="text-xs md:text-sm font-bold text-white uppercase">{fullMod?.label}</span>
                            </div>
                            <button onClick={() => { setModuleToCancel(mod); setShowCancelModal(true); }} className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-bold py-1.5 px-3 rounded transition-colors">Cancel</button>
                          </div>
                        );
                      }) : <p className="text-xs text-indigo-400">No modules purchased.</p>}
                    </div>
                  </div>

                  <div className="bg-[#13172e]/60 border border-indigo-800/50 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Payment Information</h4>
                      {billingData.payment_methods?.length > 0 ? (
                        billingData.payment_methods.map((pm, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-[#090b14]/50 border border-indigo-800/50 rounded-lg text-xs text-indigo-200">
                            💳 {pm.card_brand} ending in **{pm.last4} (Exp: {pm.exp_month}/{pm.exp_year})
                          </div>
                        ))
                      ) : <div className="text-xs text-indigo-400">No payment method recorded.</div>}
                    </div>
                    <button onClick={() => setShowUpgradeModal(true)} className="mt-4 w-full bg-[#090b14] border border-indigo-700 text-indigo-200 text-xs py-2.5 rounded-lg hover:bg-[#13172e] transition-colors">+ Add/Update Card</button>
                  </div>
                </div>

                <div className="bg-[#13172e]/40 border border-indigo-800/30 rounded-xl p-5 shadow-lg mt-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Billing History & Invoices</h4>
                  {billingData.invoices?.length > 0 ? (
                    <div className="space-y-2">
                      {billingData.invoices.map((inv) => (
                        <div key={inv.id} className="flex justify-between items-center p-3 bg-[#090b14]/40 border border-indigo-900/50 rounded text-xs">
                          <div>
                            <span className="text-white font-bold">{inv.description}</span>
                            <span className="block text-[10px] text-indigo-400">{new Date(inv.created_at).toLocaleDateString()}</span>
                          </div>
                          {/* FORMATTED AS PHP */}
                          <span className="text-emerald-400 font-bold">{formatPHP(inv.amount)} ({inv.status.toUpperCase()})</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-indigo-400/60 text-center py-4">No billing records found in database.</p>}
                </div>
              </div>
            )}

            {/* HMS MODULE */}
            {activeModule === 'hms' && (
              <div className="h-full flex flex-col gap-4 md:gap-6 w-full">
                 <h3 className="text-base md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 border-b border-indigo-800/50 pb-4"><span className="text-xl md:text-2xl">🏨</span> Frontdesk (HMS)</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">OCCUPANCY</div><div className="text-xl md:text-3xl text-white font-bold">82%</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">ARRIVALS</div><div className="text-xl md:text-3xl text-white font-bold">14</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg col-span-2 md:col-span-1"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">PENDING</div><div className="text-xl md:text-3xl text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">3</div></div>
                 </div>
              </div>
            )}

            {/* PMS MODULE */}
            {activeModule === 'pms' && (
              <div className="h-full flex flex-col gap-4 md:gap-6 w-full">
                 <h3 className="text-base md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 border-b border-indigo-800/50 pb-4"><span className="text-xl md:text-2xl">🏢</span> Landlord (PMS)</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">LEASES</div><div className="text-xl md:text-3xl text-white font-bold">128</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">WORK ORDERS</div><div className="text-xl md:text-3xl text-fuchsia-400 font-bold drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">7</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg col-span-2 md:col-span-1"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">COLLECTION</div><div className="text-xl md:text-3xl text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">94%</div></div>
                 </div>
              </div>
            )}

            {/* HVMS MODULE */}
            {activeModule === 'hvms' && (
              <div className="h-full flex flex-col gap-4 md:gap-6 w-full">
                 <h3 className="text-base md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 border-b border-indigo-800/50 pb-4"><span className="text-xl md:text-2xl">📋</span> Butler (HVMS)</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">VISITOR LOGS</div><div className="text-xl md:text-3xl text-white font-bold">45</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">PRE-REG</div><div className="text-xl md:text-3xl text-white font-bold">12</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg col-span-2 md:col-span-1"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">SECURITY ALERTS</div><div className="text-xl md:text-3xl text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">0</div></div>
                 </div>
              </div>
            )}

            {/* BMS MODULE */}
            {activeModule === 'bms' && (
              <div className="h-full flex flex-col gap-4 md:gap-6 w-full">
                 <h3 className="text-base md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 border-b border-indigo-800/50 pb-4"><span className="text-xl md:text-2xl">🏗️</span> Sekyu (BMS)</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">HVAC STATUS</div><div className="text-xl md:text-3xl text-white font-bold">Optimal</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">ENERGY SAVED</div><div className="text-xl md:text-3xl text-white font-bold">29%</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg col-span-2 md:col-span-1"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">ACTIVE ALARMS</div><div className="text-xl md:text-3xl text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">0</div></div>
                 </div>
              </div>
            )}

            {/* IoT MODULE */}
            {activeModule === 'iot' && (
              <div className="h-full flex flex-col gap-4 md:gap-6 w-full">
                 <h3 className="text-base md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 border-b border-indigo-800/50 pb-4"><span className="text-xl md:text-2xl">📡</span> Housekeeper (IoT)</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">ONLINE SENSORS</div><div className="text-xl md:text-3xl text-white font-bold">1,042</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">LOW BATTERY</div><div className="text-xl md:text-3xl text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">5</div></div>
                    <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-4 md:p-6 shadow-lg col-span-2 md:col-span-1"><div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">LAST SYNC</div><div className="text-xl md:text-3xl text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Just now</div></div>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}