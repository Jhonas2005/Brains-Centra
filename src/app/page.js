"use client";

/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';

// --- Sign In & Forgot Password Pop-up Modal Component ---
const SignInModal = ({ onClose }) => {
  const [view, setView] = useState("login"); // "login" or "forgot"
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setMessage("Verifying...");

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Success! Redirecting...");
        if (data.role === 'admin') {
          window.location.href = "/admin-dashboard"; 
        } else {
          window.location.href = "/user-dashboard"; 
        }
      } else {
        setMessage(data.message); 
      }
    } catch (error) {
      setMessage("Connection error. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("Sending reset link...");
    
    const email = e.target.email.value;

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Success! Check your email for the reset link.");
        e.target.reset(); // Clear the form
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Connection error. Please try again.");
    }
  };

  const toggleView = (newView) => {
    setView(newView);
    setMessage(""); // Clear messages when switching views
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-[#13172e] border border-indigo-800/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(217,70,239,0.15)] z-10 transition-all duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-indigo-400 hover:text-fuchsia-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-8">
          <img src="/brains-logo.png" alt="Brains Logo" className="h-10 w-auto mx-auto mb-4 object-contain" />
          <h2 className="text-2xl font-bold text-white mb-1">
            {view === "login" ? "Welcome Back" : "Reset Password"}
          </h2>
          <p className="text-sm text-indigo-300/80">
            {view === "login" ? "Sign in to Central Command" : "Enter your email to receive a secure reset link"}
          </p>
        </div>
        
        {/* Status Message */}
        {message && <p className={`text-center text-sm font-semibold mb-4 ${message.includes('Success') ? 'text-emerald-400' : 'text-fuchsia-400'}`}>{message}</p>}

        {view === "login" ? (
          // --- LOGIN FORM ---
          <form className="space-y-4" onSubmit={handleSignIn}>
            <div>
              <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Email Address</label>
              <input name="email" type="email" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-colors" placeholder="admin@brains.asia" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wide">Password</label>
                <button type="button" onClick={() => toggleView("forgot")} className="text-xs text-indigo-400 hover:text-fuchsia-400 font-semibold transition-colors">
                  Forgot password?
                </button>
              </div>
              <input name="password" type="password" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-colors" placeholder="••••••••" />
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-all duration-300 shadow-[0_4px_14px_rgba(217,70,239,0.25)] active:scale-95">
              Secure Sign In
            </button>
          </form>
        ) : (
          // --- FORGOT PASSWORD FORM ---
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Email Address</label>
              <input name="email" type="email" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white placeholder-indigo-500/50 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-colors" placeholder="your@email.com" />
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-all duration-300 shadow-[0_4px_14px_rgba(245,158,11,0.25)] active:scale-95">
              Send Reset Link
            </button>

            <div className="text-center mt-4 pt-2 border-t border-indigo-900/50">
              <button type="button" onClick={() => toggleView("login")} className="text-xs text-indigo-400 hover:text-white font-semibold transition-colors">
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

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
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
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

// --- Bulletproof Animation Wrapper ---
const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    const fallback = setTimeout(() => setIsVisible(true), 1200);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
            clearTimeout(fallback);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );

    observer.observe(node);

    return () => {
      clearTimeout(fallback);
      if (node) observer.unobserve(node);
    };
  }, []);

  const baseClasses = "transition-all duration-700 ease-out will-change-transform";
  const hiddenClasses = direction === "up" ? "opacity-0 translate-y-8" : "opacity-0 scale-95";
  const visibleClasses = "opacity-100 translate-y-0 scale-100";

  return (
    <div
      ref={domRef}
      className={`${baseClasses} ${isVisible ? visibleClasses : hiddenClasses}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Data Objects ---
const modulesData = [
  {
    id: "hms",
    badge: "HMS",
    icon: "🏨",
    title: "Hotel Management System",
    brainsName: "Frontdesk",
    tagline: "End-to-end hotel operations, unified.",
    metric: "38%",
    metricLabel: "average RevPAR lift in 90 days",
    description: "Streamline reservations, housekeeping, F&B, and revenue management from one command dashboard. Real-time room status, dynamic pricing, and channel distribution in a single pane of glass.",
    features: [
      { title: "Reservations & PMS", desc: "Central reservation engine with OTA connectivity and rate parity enforcement." },
      { title: "Housekeeping Dispatch", desc: "Automated room assignment, task tracking, and inspection workflows." },
      { title: "Revenue Intelligence", desc: "Yield management, comp-set benchmarking, and forecast dashboards." },
      { title: "F&B & POS Integration", desc: "Restaurant, bar, and banquet billing synced directly to guest folios." },
      { title: "Guest Experience", desc: "Mobile check-in/out, digital keys, and in-stay service requests." },
      { title: "Reporting Suite", desc: "Occupancy, RevPAR, ADR, and departmental P&L in real time." }
    ]
  },
  {
    id: "pms",
    badge: "PMS",
    icon: "🏢",
    title: "Property Management System",
    brainsName: "Landlord",
    tagline: "Manage every asset class from one platform.",
    metric: "61%",
    metricLabel: "reduction in manual admin overhead",
    description: "Residential, commercial, mixed-use, and vacation rental portfolios under unified control. Lease management, maintenance workflows, financial reporting, and tenant communications — all automated.",
    features: [
      { title: "Lease Lifecycle", desc: "Digital leases, renewals, notices, and vacancy forecasting with e-signature." },
      { title: "Maintenance Hub", desc: "Work order routing, vendor management, and preventive maintenance scheduling." },
      { title: "Tenant Portal", desc: "Self-service rent payment, maintenance requests, and document access." },
      { title: "Financial Ledger", desc: "GL, AR/AP, bank reconciliation, and owner distribution reporting." },
      { title: "Inspection Tools", desc: "Mobile-first inspection forms, photo documentation, and condition logs." },
      { title: "Portfolio Analytics", desc: "Asset-level and portfolio-level NOI, CAP rate, and occupancy dashboards." }
    ]
  },
  {
    id: "hvms",
    badge: "HVMS",
    icon: "📋",
    title: "Hotel-Visitor Management System",
    brainsName: "Butler",
    tagline: "Frictionless arrivals. Secure premises.",
    metric: "4 sec",
    metricLabel: "average contactless check-in time",
    description: "Digital visitor registration, pre-authorization, and contactless check-in for hotels and mixed-use properties. Integrate with access control, guard stations, and emergency mustering systems.",
    features: [
      { title: "Pre-Registration", desc: "Invitation-based visitor pre-auth with QR pass generation and expiry control." },
      { title: "ID Verification", desc: "Document scan, facial match, and watchlist screening at arrival." },
      { title: "Digital Passes", desc: "Time-bound, zone-scoped digital credentials synced to access hardware." },
      { title: "Guard Station UI", desc: "Tablet-optimized front-desk and security console with photo capture." },
      { title: "Overstay Alerts", desc: "Automated notifications and escalation when visitor dwell exceeds authorization." },
      { title: "Compliance Logs", desc: "Immutable visit logs with export for regulatory and insurance audits." }
    ]
  },
  {
    id: "bms",
    badge: "BMS",
    icon: "🏗️",
    title: "Building Management System",
    brainsName: "Sekyu",
    tagline: "Intelligent infrastructure, always on.",
    metric: "29%",
    metricLabel: "average energy cost reduction",
    description: "HVAC, lighting, elevators, fire safety, and energy management converge in a single supervisory control layer. Reduce energy costs, extend equipment life, and respond to incidents before tenants notice.",
    features: [
      { title: "HVAC Automation", desc: "Zone-level climate control with occupancy-based scheduling and fault detection." },
      { title: "Energy Dashboard", desc: "Sub-meter energy monitoring, carbon reporting, and savings attribution." },
      { title: "Lighting Control", desc: "Circadian-aware scene programming with daylight harvesting integration." },
      { title: "Elevator Monitoring", desc: "Real-time car status, fault codes, and predictive maintenance triggers." },
      { title: "Fire & Life Safety", desc: "Panel integration, alarm routing, evacuation dashboards, and drill records." },
      { title: "Access Control", desc: "Door, floor, and perimeter control with role-based permission matrices." }
    ]
  },
  {
    id: "iot",
    badge: "IoT",
    icon: "📡",
    title: "Internet of Things",
    brainsName: "Housekeeper",
    tagline: "Every sensor. One command layer.",
    metric: "3.2M",
    metricLabel: "devices managed globally",
    description: "Connect thousands of edge devices — smart locks, occupancy sensors, leak detectors, meters, cameras, and custom hardware — into a unified telemetry and automation backbone with sub-second latency.",
    features: [
      { title: "Device Registry", desc: "Centralized inventory of all connected hardware with firmware and health status." },
      { title: "Real-Time Telemetry", desc: "Sub-second sensor streams with configurable retention and downsampling." },
      { title: "Automation Engine", desc: "Trigger-condition-action rules across device types without code." },
      { title: "Edge Compute", desc: "Local decision-making on-device for latency-critical safety scenarios." },
      { title: "Protocol Bridge", desc: "Native support for MQTT, Modbus, BACnet, Zigbee, Z-Wave, and REST." },
      { title: "Anomaly Detection", desc: "ML-powered deviation alerts for energy, occupancy, and equipment patterns." }
    ]
  }
];

const navLinks = [
  { id: "platform", label: "Platform", href: "#platform" },
  { id: "hms", label: "Hotel MS", href: "#hms" },
  { id: "pms", label: "Property MS", href: "#pms" },
  { id: "hvms", label: "Visitor MS", href: "#hvms" },
  { id: "bms", label: "Building MS", href: "#bms" },
  { id: "iot", label: "IoT", href: "#iot" },
];

// --- Reusable Components ---
const FeatureCard = ({ title, desc }) => (
  <div className="bg-[#13172e]/80 backdrop-blur-sm border border-indigo-800/50 rounded-xl p-6 hover:border-fuchsia-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(217,70,239,0.15)] shadow-lg">
    <div className="w-2 h-2 bg-fuchsia-500 transform rotate-45 mb-4 shadow-[0_0_8px_rgba(217,70,239,0.5)]"></div>
    <h4 className="text-sm font-bold text-white mb-2">{title}</h4>
    <p className="text-xs text-indigo-200/80 leading-relaxed">{desc}</p>
  </div>
);

// CHANGED: Expanded max-w-7xl to max-w-[1600px] and adjusted padding
const ModuleSection = ({ data }) => (
  <section id={data.id} className="py-24 border-b border-indigo-900/30 max-w-[1600px] mx-auto px-8 lg:px-12 scroll-mt-20">
    <FadeIn>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-mono border border-fuchsia-800/50 bg-fuchsia-900/20 text-fuchsia-300 px-2 py-1 rounded">
          {data.badge}
        </span>
        <span className="text-2xl">{data.icon}</span>
      </div>
      
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
        {data.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-blue-400 text-2xl align-middle ml-2">"{data.brainsName}"</span>
      </h2>
      <p className="text-xl text-indigo-300 mb-8">{data.tagline}</p>
      
      <div className="mb-16">
        <div className="text-4xl font-bold text-white mb-1">{data.metric}</div>
        <div className="text-sm text-indigo-400/70">{data.metricLabel}</div>
      </div>
    </FadeIn>

    <div className="grid lg:grid-cols-12 gap-12 items-start">
      <div className="lg:col-span-4 sticky top-32">
        <FadeIn delay={100}>
          <p className="text-indigo-200 leading-relaxed mb-8 text-lg">
            {data.description}
          </p>
          <div className="flex flex-col gap-3">
            <a href="/free-trial" className="block text-center bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(217,70,239,0.4)] active:scale-95">
              Request Demo
            </a>
            <button className="border border-indigo-700 bg-[#13172e]/80 backdrop-blur-sm hover:border-fuchsia-500 hover:bg-[#1a1f3c]/80 text-indigo-100 font-semibold py-3 px-6 rounded w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(99,102,241,0.2)] active:scale-95">
              View Documentation
            </button>
          </div>
        </FadeIn>
      </div>
      
      <div className="lg:col-span-8 grid md:grid-cols-2 gap-4">
        {data.features.map((feat, idx) => (
          <FadeIn key={idx} delay={idx * 60}>
            <FeatureCard title={feat.title} desc={feat.desc} />
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

// --- Main Page Component ---
export default function CentralCommand() {
  const [activeSection, setActiveSection] = useState("platform");
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = "platform";

      for (let i = 0; i < navLinks.length; i++) {
        const link = navLinks[i];
        const section = document.getElementById(link.id);

        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 180) {
            currentSection = link.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen text-gray-100 font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-100 bg-transparent">
      
      <ParticleBackground />

      {isSignInOpen && <SignInModal onClose={() => setIsSignInOpen(false)} />}

      {/* CHANGED: Expanded padding to px-8 lg:px-12 */}
      <nav className="flex items-center justify-between px-8 lg:px-12 py-4 border-b border-indigo-900/50 bg-[#090b14]/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2">
            <img src="/brains-logo.png" alt="Brains Infinite Innovations" className="h-8 w-auto object-contain"/>
          </div>
          <div className="flex items-center gap-2 border border-indigo-800 rounded bg-indigo-950/50 px-2 py-0.5">
            <span className="text-xs font-semibold text-indigo-200">Central Command</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-2 text-sm font-medium">
          {navLinks.map((link) => (
            <a 
              key={link.id}
              href={link.href} 
              onClick={() => setActiveSection(link.id)}
              className={`relative px-4 py-2 rounded-full transition-all duration-300 border ${
                activeSection === link.id 
                  ? "bg-gradient-to-r from-fuchsia-900/40 to-blue-900/40 border-fuchsia-500/50 text-white font-bold shadow-[0_0_15px_rgba(217,70,239,0.3)]" 
                  : "border-transparent text-indigo-300 hover:text-white hover:bg-indigo-900/30 hover:border-indigo-700/50"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsSignInOpen(true)}
            className="text-sm font-medium text-indigo-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <a href="/get-started" className="inline-block bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white text-sm font-bold py-2 px-5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(217,70,239,0.5)] active:scale-95 text-center">
           Get Started
          </a>
        </div>
      </nav>

      {/* CHANGED: Adjusted hero padding px-4 -> px-8 */}
      <header id="platform" className="flex flex-col items-center justify-center text-center pt-32 pb-24 px-8 border-b border-indigo-900/30 bg-gradient-to-b from-[#090b14]/40 to-[#0d111f]/40 scroll-mt-24">
        <FadeIn delay={150}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-indigo-400 to-blue-400">Central Command</span><br />
            for every property.
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="text-lg md:text-xl text-indigo-200/90 max-w-2xl mb-10 leading-relaxed">
            One platform to manage hotels, properties, visitors, buildings, and IoT at scale. Built for operators who refuse to compromise on control. <br/>
            <span className="font-semibold text-fuchsia-400 mt-2 block">"We got what you think!"</span>
          </p>
        </FadeIn>
        
        <FadeIn delay={250}>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full mt-4">
            <button className="bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(217,70,239,0.5)] active:scale-95 w-full sm:w-auto">
              Explore Platform
            </button>
            <button className="border-2 border-indigo-700 bg-[#13172e]/80 backdrop-blur-sm hover:border-fuchsia-500 hover:bg-[#1a1f3c]/80 text-indigo-100 font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(99,102,241,0.2)] active:scale-95 w-full sm:w-auto">
              Watch Demo
            </button>
          </div>
        </FadeIn>
      </header>

      {/* CHANGED: Expanded padding to px-8 lg:px-12 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-indigo-900/30 bg-[#101426]/60 backdrop-blur-md py-12 px-8 lg:px-12 shadow-lg relative z-10">
        {[
          { stat: "7", title: "Our Brands", desc: "ASAP!, KlassMall, The Finest Fit & more", color: "text-fuchsia-400", shadow: "drop-shadow-[0_0_10px_rgba(232,121,249,0.3)]" },
          { stat: "9", title: "Services Offered", desc: "Systems Integration, Branding, Dev & more", color: "text-indigo-400", shadow: "drop-shadow-[0_0_10px_rgba(129,140,248,0.3)]" },
          { stat: "11", title: "Systems Offered", desc: "HRMS, CRM, POS, E-wallets & more", color: "text-blue-400", shadow: "drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]" },
          { stat: "30+", title: "Products Offered", desc: "Cloud, Servers, IoT, Security & more", color: "text-cyan-400", shadow: "drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]" }
        ].map((item, index) => (
          <FadeIn key={index} delay={index * 80} direction="scale">
            <div className="text-center group relative cursor-default hover:-translate-y-1 transition-transform duration-300">
              <div className={`text-4xl font-bold ${item.color} mb-1 ${item.shadow}`}>{item.stat}</div>
              <div className="text-sm text-white font-bold uppercase tracking-wider">{item.title}</div>
              <div className="text-xs text-indigo-300/70 mt-2 hidden md:block">{item.desc}</div>
            </div>
          </FadeIn>
        ))}
      </div>

      {modulesData.map((module) => (
        <ModuleSection key={module.id} data={module} />
      ))}

      {/* CHANGED: Expanded padding to px-8 lg:px-12 */}
      <section className="py-24 border-b border-indigo-900/30 bg-[#0d111f]/60 backdrop-blur-sm text-center px-8 lg:px-12">
        <FadeIn>
          <h3 className="text-xs font-bold text-fuchsia-500 tracking-[0.2em] uppercase mb-4">Open Integration Layer</h3>
          <h2 className="text-4xl font-bold mb-6 text-white">Connects to your existing stack.</h2>
          <p className="text-indigo-200 max-w-2xl mx-auto mb-12">
            REST APIs, webhooks, and native connectors for Salesforce, SAP, Oracle Hospitality, Amadeus, Sabre, Mews, and 200+ more.
          </p>
        </FadeIn>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-indigo-300 font-mono">
          {["REST API", "GraphQL", "Webhooks", "BACnet", "MQTT", "Modbus", "Zigbee", "SAML/SSO", "OAuth 2.0"].map((tech, idx) => (
            <FadeIn key={idx} delay={idx * 50} direction="scale">
              <span className="inline-block bg-[#13172e]/80 backdrop-blur-sm border border-indigo-800/50 px-4 py-2 rounded-lg hover:border-fuchsia-500/50 hover:text-fuchsia-300 hover:-translate-y-1 transition-all shadow-sm cursor-default">
                {tech}
              </span>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CHANGED: Expanded padding to px-8 lg:px-12 and widened max-w-6xl to max-w-[1600px] */}
      <section className="py-24 border-b border-indigo-900/30 px-8 lg:px-12 backdrop-blur-sm">
        <FadeIn>
          <div className="text-center mb-16">
            <h3 className="text-xs font-bold text-fuchsia-500 tracking-[0.2em] uppercase mb-4">From Operators</h3>
            <h2 className="text-4xl font-bold text-white">Trusted at scale.</h2>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
          {[
            {
              quote: `"Central Command gave us a single operations view across 47 hotels. We decommissioned six legacy systems in the first quarter."`,
              name: "Sarah Okonkwo", role: "CTO, Meridian Hospitality Group", initials: "SO"
            },
            {
              quote: `"The IoT integration alone saved $2.1M in energy spend in year one. The automation engine is genuinely remarkable."`,
              name: "James Whitfield", role: "VP Facilities, Nexus Properties", initials: "JW"
            },
            {
              quote: `"Visitor management went from a clipboard at the front desk to a fully audited digital system in under two weeks."`,
              name: "Priya Menon", role: "Head of Security Operations, Arcadia Towers", initials: "PM"
            }
          ].map((test, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="bg-[#13172e]/80 backdrop-blur-sm border border-indigo-800/50 rounded-xl p-8 flex flex-col h-full justify-between shadow-lg hover:border-fuchsia-500/50 hover:-translate-y-1 transition-all duration-300 group">
                <p className="text-indigo-100/90 text-sm leading-relaxed mb-8 group-hover:text-white transition-colors">{test.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-900/30 flex items-center justify-center text-xs font-bold text-fuchsia-400 border border-fuchsia-800 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors">
                    {test.initials}
                  </div>
                  <div>
                    <div className="text-white text-sm font-bold">{test.name}</div>
                    <div className="text-indigo-300/80 text-xs">{test.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CHANGED: Expanded padding to px-8 lg:px-12 and widened max-w-6xl to max-w-[1600px] */}
      <footer className="py-24 px-8 lg:px-12 bg-[#080a12]/90 backdrop-blur-md">
        <FadeIn>
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 mb-24 text-center md:text-left">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Ready to take command?</h2>
              <p className="text-indigo-200/80">Start with one module. Scale to the full platform. No lock-in.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a href="/free-trial" className="inline-block text-center bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-semibold py-3 px-8 rounded transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(217,70,239,0.4)] active:scale-95 w-full sm:w-auto">
               Start Free Trial
              </a>
              <button className="border border-indigo-800 hover:border-fuchsia-500 bg-[#13172e] hover:bg-[#1a1f3c] text-indigo-100 font-semibold py-3 px-8 rounded transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(99,102,241,0.2)] active:scale-95 w-full sm:w-auto">
               Talk to Sales
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-indigo-900/50 text-xs text-indigo-400/60">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
             <img src="/brains-logo.png" alt="Brains Infinite Innovations" className="h-6 w-auto object-contain"/>
             <span className="font-semibold text-indigo-200">Central Command</span>
          </div>
          <div className="flex gap-6 mb-4 md:mb-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
            <a href="#" className="hover:text-white transition-colors">API Docs</a>
          </div>
          <div>
            © 2026 Brains Infinite Innovations. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}