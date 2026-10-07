"use client";

/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

// --- Sign In & Forgot Password Pop-up Modal Component ---
const SignInModal = ({ onClose }) => {
  const [view, setView] = useState("login");
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setMessage(authError.message);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        setMessage("Error verifying account role.");
        return;
      }

      setMessage("Success! Redirecting...");
      
      if (profileData.role === 'admin') {
        window.location.href = "/admin-dashboard"; 
      } else {
        window.location.href = "/user-dashboard"; 
      }

    } catch (error) {
      console.error(error);
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
        e.target.reset(); 
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Connection error. Please try again.");
    }
  };

  const toggleView = (newView) => {
    setView(newView);
    setMessage(""); 
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
        
        {message && <p className={`text-center text-sm font-semibold mb-4 ${message.includes('Success') ? 'text-emerald-400' : 'text-fuchsia-400'}`}>{message}</p>}

        {view === "login" ? (
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

// --- Demo Video Pop-up Modal Component ---
const VideoModal = ({ onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#090b14]/90 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl z-10">
        <button onClick={onClose} className="absolute -top-10 right-0 text-indigo-300 hover:text-fuchsia-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-indigo-800/50 shadow-[0_0_40px_rgba(217,70,239,0.25)] bg-black">
          <video
            className="w-full h-full"
            src="brains-demo.mp4"
            controls
            autoPlay
            playsInline
          />
        </div>
      </div>
    </div>
  );
};

// --- GENERIC INQUIRY MODAL (Services & Hardware) ---
const InquiryModal = ({ subject, type, onClose }) => {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  const accentColor = type === 'Hardware' ? 'cyan' : 'blue';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className={`relative w-full max-w-md bg-[#13172e] border border-${accentColor}-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] z-10 transition-all duration-300`}>
        <button onClick={onClose} className={`absolute top-4 right-4 text-indigo-400 hover:text-${accentColor}-400 transition-colors`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {submitted ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/50 text-emerald-400 text-3xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">✓</div>
            <h3 className="text-xl font-bold text-white mb-2">Inquiry Sent!</h3>
            <p className="text-sm text-indigo-200">Our {type === 'Hardware' ? 'procurement' : 'agency'} team will contact you shortly regarding your request for {subject}.</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-2">Request {type}</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Inquire about <span className={`text-${accentColor}-400 font-bold`}>{subject}</span>.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Full Name</label>
                <input type="text" required className={`w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-${accentColor}-500/50 focus:ring-1 focus:ring-${accentColor}-500/50 transition-colors`} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Company Email</label>
                <input type="email" required className={`w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-${accentColor}-500/50 focus:ring-1 focus:ring-${accentColor}-500/50 transition-colors`} placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Additional Details (Optional)</label>
                <textarea rows="3" className={`w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-${accentColor}-500/50 focus:ring-1 focus:ring-${accentColor}-500/50 transition-colors`} placeholder="Tell us more about your needs..."></textarea>
              </div>
              <button type="submit" className={`w-full bg-gradient-to-r from-${accentColor}-600 to-indigo-600 hover:from-${accentColor}-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg mt-6 shadow-[0_4px_14px_rgba(59,130,246,0.25)] active:scale-95 transition-all`}>
                Submit Inquiry
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// --- CONSULTATION CONTACT MODAL ---
const ConsultationModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#13172e] border border-fuchsia-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(217,70,239,0.15)] z-10 transition-all duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-indigo-400 hover:text-fuchsia-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {submitted ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/50 text-emerald-400 text-3xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">✓</div>
            <h3 className="text-xl font-bold text-white mb-2">Request Received!</h3>
            <p className="text-sm text-indigo-200">Our business development team will contact you shortly to schedule your consultation.</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-2">Request Consultation</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Fill out the form below and let's build progressive technology together.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Full Name</label>
                <input type="text" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Email Address</label>
                <input type="email" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-colors" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Contact Number</label>
                <input type="tel" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-colors" placeholder="+63 900 000 0000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Message</label>
                <textarea required rows="3" className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-colors" placeholder="How can we help your business expand?"></textarea>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg mt-6 shadow-[0_4px_14px_rgba(217,70,239,0.25)] active:scale-95 transition-all">
                Send Request
              </button>
            </form>
          </div>
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

// --- UPDATED DATA OBJECTS (Colored Images) ---
const clients = [
  { name: "Uratex", image: "/logos/uratex.png" },
  { name: "Krispy Kreme", image: "/logos/krispy-kreme.png" },
  { name: "Globe 917 Ventures", image: "/logos/globe.jpg" },
  { name: "Rebisco", image: "/logos/rebisco.png" },
  { name: "Big E Food Corp", image: "/logos/big-e.jpg" },
  { name: "Eyebrowdery", image: "/logos/eyebrowdery.png" },
  { name: "Philbelt", image: "/logos/philbelt.png" },
  { name: "Trends & Technologies", image: "/logos/trends.png" }
];

const hardwarePartners = [
  { name: "Google Cloud", image: "/logos/google-cloud.png" },
  { name: "Microsoft", image: "/logos/microsoft.png" },
  { name: "Cisco", image: "/logos/cisco.png" },
  { name: "Dell", image: "/logos/dell.png" },
  { name: "Apple", image: "/logos/apple.png" },
  { name: "Acer", image: "/logos/acer.png" },
  { name: "Asus", image: "/logos/asus.jpg" },
  { name: "Samsung", image: "/logos/samsung.png" },
  { name: "Oracle", image: "/logos/oracle.png" },
  { name: "IBM", image: "/logos/ibm.png" }
];

const connectorSystems = [
  { id: "hr", icon: "👥", title: "Human Resources", tagline: "Empower your workforce.", desc: "Focuses on the organization's employee performance reviews, work schedules, paid days off, benefits, payroll and many more.", metric: "100%", metricLabel: "Payroll Accuracy", features: ["Performance Tracking", "Shift Scheduling", "Benefits Administration", "Automated Payroll"] },
  { id: "ais", icon: "📊", title: "Accounting Information", tagline: "Financial clarity at your fingertips.", desc: "Tools and systems designed for the collection and display of accounting information so executives and accountants can make an informed decision for business.", metric: "Live", metricLabel: "Financial Reporting", features: ["General Ledger", "Accounts Payable/Receivable", "Tax Compliance", "Executive Dashboards"] },
  { id: "crm", icon: "🤝", title: "Customer Relationship", tagline: "Drive sales and retention.", desc: "Focuses on improving customer service relationships and assisting in customer retention while driving the sales growth.", metric: "3x", metricLabel: "Faster Conversion", features: ["Contact Management", "Sales Pipeline", "Customer Support Tickets", "Marketing Automation"] },
  { id: "mis", icon: "📈", title: "Management Information", tagline: "Data-driven leadership.", desc: "Produces regular reports on operations for every level of management in a company.", metric: "360°", metricLabel: "Operational Visibility", features: ["Automated Reporting", "Data Centralization", "Cross-department Analytics", "Decision Support"] },
  { id: "pos", icon: "🛒", title: "Point of Sale", tagline: "Seamless checkout experiences.", desc: "A network that consists of the main computer linked with several checkout terminals and supported by different hardware features starting from barcode scanners to card payment terminals.", metric: "< 2s", metricLabel: "Transaction Time", features: ["Barcode Scanning", "Multi-terminal Sync", "Card Payment Integration", "Receipt Generation"] },
  { id: "ims", icon: "📦", title: "Inventory Management", tagline: "Track goods end-to-end.", desc: "Managing your inventory in which it tracks the goods throughout your entire supply chain, from purchasing to production to end sales.", metric: "99.9%", metricLabel: "Stock Accuracy", features: ["Supply Chain Tracking", "Low Stock Alerts", "Purchase Order Automation", "Multi-warehouse Sync"] },
  { id: "ewallet", icon: "💳", title: "E-Wallets", tagline: "Transactions at your fingertips.", desc: "Utilizing the efficiency of technology by bringing online transactions at the tip of our hands.", metric: "Secure", metricLabel: "End-to-End Encryption", features: ["Contactless Payments", "Fund Transfers", "Transaction History", "Multi-currency Support"] },
  { id: "parcel", icon: "🚚", title: "Parcel Tracking", tagline: "Clear visibility into every journey.", desc: "A system that gives you a clear visibility into your parcel's journey for both local and international.", metric: "Live", metricLabel: "GPS Tracking Updates", features: ["International Routing", "Delivery Confirmation", "Customer Tracking Portal", "Dispatch Analytics"] },
  { id: "fleet", icon: "🚛", title: "Fleet Management", tagline: "Optimize your enterprise logistics.", desc: "Enables business to accomplish a series of tasks in enterprise-wide management.", metric: "24/7", metricLabel: "Live Vehicle Tracking", features: ["Route Optimization", "Driver Performance", "Maintenance Scheduling", "Fuel Monitoring"] },
  { id: "pms_proj", icon: "📋", title: "Project Management", tagline: "Plan, organize, and execute.", desc: "Focuses on managing a project by planning, organizing, and managing its different required aspects.", metric: "+40%", metricLabel: "Team Productivity", features: ["Task Delegation", "Gantt Charts", "Milestone Tracking", "Resource Allocation"] }
];

const agencyServices = [
  { id: "branding", image: "/services/branding.jpg", title: "Branding & Design", desc: "Logo creation, moodboards, custom illustrations, and full brand strategy.", color: "from-pink-500 to-rose-500", glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] border-pink-900/30", textGlow: "group-hover:text-pink-400" },
  { id: "marketing", image: "/services/marketing.jpg", title: "Marketing & Sales", desc: "Omnichannel campaigns, social media management, and CRM automation.", color: "from-amber-500 to-orange-500", glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] border-amber-900/30", textGlow: "group-hover:text-amber-400" },
  { id: "bizdev", image: "/services/business-dev.jpg", title: "Business Development", desc: "Connecting your business to the right people, clients, and partners globally.", color: "from-emerald-500 to-teal-500", glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] border-emerald-900/30", textGlow: "group-hover:text-emerald-400" },
  { id: "webdev", image: "/services/web-dev.jpg", title: "Custom Web & App Dev", desc: "Bespoke mobile applications and website layouts with UI/UX optimization.", color: "from-blue-500 to-cyan-500", glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] border-blue-900/30", textGlow: "group-hover:text-blue-400" },
  { id: "integration", image: "/services/integration.jpg", title: "Systems Integration", desc: "Interlink networks and create safe, reliable systems with comprehensive maintenance and support.", color: "from-violet-500 to-purple-500", glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] border-violet-900/30", textGlow: "group-hover:text-violet-400" },
  { id: "staff", image: "/services/resource-staff.jpg", title: "Resource Augmentation", desc: "Providing highly skilled talent and customer service support teams.", color: "from-fuchsia-500 to-pink-500", glow: "group-hover:shadow-[0_0_30px_rgba(217,70,239,0.3)] border-fuchsia-900/30", textGlow: "group-hover:text-fuchsia-400" },
];

const subsidiaryBrands = [
  { name: "ASAP!", image: "/logos/asap-logo.png", icon: "🚀", desc: "All Services App for fast, professional blue and white-collar booking." },
  { name: "KlassMall", image: "/logos/klassmall-logo.png", icon: "🛒", desc: "B2B and B2C wholesale retail platform connecting direct to manufacturers." },
  { name: "Luxurious Cleaning Co.", image: "/logos/luxurious-logo.png", icon: "✨", desc: "Top-tier general, deep, and post-construction cleaning services." },
  { name: "The Soap Republic", image: "/logos/soap-republic-logo.png", icon: "🧼", desc: "High-quality, eco-friendly household and industrial cleaning products." },
  { name: "The Beauty Alley", image: "/logos/beauty-alley-logo.png", icon: "💆‍♀️", desc: "Luxurious wellness and health home services, including IV drips." },
  { name: "Green Oasis", image: "/logos/green-oasis-logo.png", icon: "🌿", desc: "Landscape design, interior biophilic installations, and garden maintenance." },
  { name: "The Finest Fit", image: "/logos/finest-fit-logo.png", icon: "👕", desc: "High-quality customized uniforms, corporate apparel, and printing." },
  { name: "Portress", image: "/logos/portress-logo.png", icon: "🚢", desc: "B2B supply chain and logistics solutions powered by Klassic Marketing." },
];

const hardwareProducts = [
  "Construction Auxiliaries", "Command Center", "GPS Tracker", "Accessories", "Auto Identification and Data Capture",
  "Cloud Solutions", "Copiers", "Data Centers", "Desktops", "Digital Appliance", "Hyperconverge", "IT Security",
  "LFD", "Mobile Devices", "Networking", "Notebooks", "Peripherals", "Photography", "Printers", "Server Appliance",
  "Servers", "Software", "Storage", "Surveillance", "Unified Communication and Collaboration", 
  "VDI- Virtual Desktop Infrastructure", "Wearables", "Open-source Platform", "3D Printing", "Artificial Intelligence-Robot Process Automation",
  "Big Data", "CAD & Graphics", "Collaboration Solutions", "Commercial Digital Display", "Containers & Microservices",
  "Data Management Solutions", "Dev Ops", "eMobility", "Gadgets & Accessories", "Gaming Accessories", "Gaming Notebooks",
  "Gaming Desktops", "Hyper-Converged Infrastructure", "IP Surveillance and Security", "Security", "Lifestyle IoT",
  "Mobility-Smartphones", "Mobility-Tablets", "Networking Wired and Wireless", "Network Security", "POS Solutions and AIDC",
  "Power Management", "Software Defined Network", "Software Enterprise Solutions", "Document Imaging", "Workstations"
];


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
      { title: "F&B & POS Integration", desc: "Restaurant, bar, and banquet billing synced directly to guest folios." }
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
      { title: "Financial Ledger", desc: "GL, AR/AP, bank reconciliation, and owner distribution reporting." }
    ]
  },
  {
    id: "hvms",
    badge: "HVMS",
    icon: "📋",
    title: "Visitor Management System",
    brainsName: "Butler",
    tagline: "Frictionless arrivals. Secure premises.",
    metric: "4 sec",
    metricLabel: "average contactless check-in time",
    description: "Digital visitor registration, pre-authorization, and contactless check-in for hotels and mixed-use properties. Integrate with access control, guard stations, and emergency mustering systems.",
    features: [
      { title: "Pre-Registration", desc: "Invitation-based visitor pre-auth with QR pass generation and expiry control." },
      { title: "ID Verification", desc: "Document scan, facial match, and watchlist screening at arrival." },
      { title: "Digital Passes", desc: "Time-bound, zone-scoped digital credentials synced to access hardware." },
      { title: "Guard Station UI", desc: "Tablet-optimized front-desk and security console with photo capture." }
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
      { title: "Fire & Life Safety", desc: "Panel integration, alarm routing, evacuation dashboards, and drill records." }
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
      { title: "Anomaly Detection", desc: "ML-powered deviation alerts for energy, occupancy, and equipment patterns." }
    ]
  }
];

const navLinks = [
  { id: "platform", label: "Overview", href: "#platform" },
  { id: "software", label: "SaaS", href: "#software" },
  { id: "connector", label: "Connector", href: "#connector" },
  { id: "services", label: "Agency Services", href: "#services" },
  { id: "brands", label: "Our Brands", href: "#brands" },
  { id: "hardware", label: "Hardware", href: "#hardware" },
  { id: "contact", label: "Contact", href: "#contact" },
];

// --- Reusable Components ---
const FeatureCard = ({ title, desc }) => (
  <div className="bg-[#13172e]/80 backdrop-blur-sm border border-indigo-800/50 rounded-xl p-6 hover:border-fuchsia-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(217,70,239,0.15)] shadow-lg">
    <div className="w-2 h-2 bg-fuchsia-500 transform rotate-45 mb-4 shadow-[0_0_8px_rgba(217,70,239,0.5)]"></div>
    <h4 className="text-sm font-bold text-white mb-2">{title}</h4>
    <p className="text-xs text-indigo-200/80 leading-relaxed">{desc}</p>
  </div>
);

const ModuleSection = ({ data }) => (
  <section className="py-24 border-b border-indigo-900/30 max-w-[1600px] mx-auto px-8 lg:px-12 scroll-mt-20">
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

// --- CONNECTOR TRIAL MODAL COMPONENT ---
const ConnectorTrialModal = ({ systemName, onClose }) => {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#13172e] border border-blue-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] z-10 transition-all duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-indigo-400 hover:text-violet-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {submitted ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/50 text-emerald-400 text-3xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">✓</div>
            <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
            <p className="text-sm text-indigo-200">Our team will contact you shortly to set up your {systemName} trial environment.</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-2">Request Free Trial</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Get 14-days free access to the <span className="text-blue-400 font-bold">{systemName}</span> module.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Full Name</label>
                <input type="text" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Company Email</label>
                <input type="email" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Company Name</label>
                <input type="text" required className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors" placeholder="Acme Corp" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-3 px-4 rounded-lg mt-6 shadow-[0_4px_14px_rgba(59,130,246,0.25)] active:scale-95 transition-all">
                Submit Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// --- INTERACTIVE CONNECTOR SHOWCASE WIDGET ---
const ConnectorShowcase = () => {
  const [activeId, setActiveId] = useState(connectorSystems[0].id);
  const [isTrialOpen, setIsTrialOpen] = useState(false);
  const activeSystem = connectorSystems.find(s => s.id === activeId);

  return (
    <section id="connector" className="py-24 border-b border-indigo-900/30 px-8 lg:px-12 bg-gradient-to-b from-[#090b14]/50 to-[#0d111f]/50 scroll-mt-24">
      
      {/* Connector Trial Modal */}
      {isTrialOpen && (
        <ConnectorTrialModal 
          systemName={activeSystem.title} 
          onClose={() => setIsTrialOpen(false)} 
        />
      )}

      {/* Hide native scrollbars for the tabs list to keep it clean */}
      <style>{`
        .connector-scrollbar::-webkit-scrollbar { display: none; }
        .connector-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-[1600px] mx-auto">
        <FadeIn>
          <div className="mb-16 text-center">
            <img 
              src="/connector-logo.png" 
              alt="Connector Ecosystem" 
              className="h-16 md:h-20 w-auto mx-auto mb-6 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
            />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Connecting Systems. Bridging People.</h2>
            <p className="text-indigo-200 max-w-3xl mx-auto">A comprehensive suite of management software designed to unify your business operations, from human resources to enterprise resource planning.</p>
          </div>
        </FadeIn>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Sidebar - Clickable Tabs */}
          <div className="w-full lg:w-1/3 flex flex-col gap-2 max-h-[600px] overflow-y-auto connector-scrollbar pr-2">
            {connectorSystems.map((sys) => (
              <button
                key={sys.id}
                onClick={() => setActiveId(sys.id)}
                className={`flex items-center text-left px-4 py-4 rounded-xl transition-all duration-300 w-full ${
                  activeId === sys.id 
                    ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                    : 'bg-[#13172e]/40 border border-transparent hover:border-indigo-700 hover:bg-[#13172e]/80'
                }`}
              >
                <span className="text-2xl mr-4">{sys.icon}</span>
                <div>
                  <h4 className={`text-sm font-bold ${activeId === sys.id ? 'text-blue-400' : 'text-indigo-100'}`}>{sys.title}</h4>
                </div>
                {activeId === sys.id && (
                  <span className="ml-auto text-violet-400 font-bold">→</span>
                )}
              </button>
            ))}
          </div>

          {/* Right Content Pane - Dynamic Display */}
          <div className="w-full lg:w-2/3 h-full">
            <div className="bg-[#13172e]/60 border border-indigo-800/50 rounded-2xl p-8 lg:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.3)] h-full min-h-[500px] relative overflow-hidden">
              
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="relative z-10 animate-fadeIn" key={activeSystem.id}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-violet-500/30 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    {activeSystem.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">{activeSystem.title}</h3>
                    <p className="text-violet-400 font-semibold tracking-wide">{activeSystem.tagline}</p>
                  </div>
                </div>

                <p className="text-lg text-indigo-200 leading-relaxed mb-8 border-b border-indigo-800/50 pb-8">
                  {activeSystem.desc}
                </p>

                <div className="grid sm:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Core Capabilities</h4>
                    <ul className="space-y-3">
                      {activeSystem.features.map((feat, i) => (
                        <li key={i} className="flex items-center text-sm text-indigo-100">
                          <span className="text-blue-500 mr-3">✦</span> {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#090b14]/50 border border-indigo-900/50 rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-inner">
                    <div className="text-4xl font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{activeSystem.metric}</div>
                    <div className="text-xs text-indigo-300 uppercase tracking-widest font-bold">{activeSystem.metricLabel}</div>
                  </div>
                </div>

                <div className="pt-4">
                   <button 
                    onClick={() => setIsTrialOpen(true)}
                    className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 font-bold py-3 px-8 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95">
                     Request Trial
                   </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


// --- Main Page Component ---
export default function CentralCommand() {
  const [activeSection, setActiveSection] = useState("platform");
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [inquiryModal, setInquiryModal] = useState({ isOpen: false, subject: "", type: "" });
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = "platform";

      for (let i = 0; i < navLinks.length; i++) {
        const link = navLinks[i];
        const section = document.getElementById(link.id);

        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
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

  const openInquiryModal = (subject, type) => {
    setInquiryModal({ isOpen: true, subject, type });
  };

  return (
    <div className="relative min-h-screen text-gray-100 font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-100 bg-transparent">
      
      <ParticleBackground />

      {isSignInOpen && <SignInModal onClose={() => setIsSignInOpen(false)} />}
      {isVideoOpen && <VideoModal onClose={() => setIsVideoOpen(false)} />}
      
      {/* Consultation Modal triggered by Footer button */}
      {isConsultationOpen && <ConsultationModal onClose={() => setIsConsultationOpen(false)} />}

      {inquiryModal.isOpen && (
        <InquiryModal 
          subject={inquiryModal.subject} 
          type={inquiryModal.type} 
          onClose={() => setInquiryModal({ isOpen: false, subject: "", type: "" })} 
        />
      )}

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

      <header id="platform" className="flex flex-col items-center justify-center text-center pt-32 pb-20 px-8 border-b border-indigo-900/30 bg-gradient-to-b from-[#090b14]/40 to-[#0d111f]/40 scroll-mt-24">
        <FadeIn delay={150}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-indigo-400 to-blue-400">Brains Infinite Innovations</span><br />
            Progressive Technology for a Better World.
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="text-lg md:text-xl text-indigo-200/90 max-w-3xl mb-10 leading-relaxed">
            Unifying property operations, software systems, bespoke agency services, and B2B marketplaces into one central ecosystem. <br/>
            <span className="font-semibold text-fuchsia-400 mt-2 block tracking-widest uppercase">"We got what you think!"</span>
          </p>
        </FadeIn>
        
        <FadeIn delay={250}>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full mt-4">
            <a href="#software" className="bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(217,70,239,0.5)] active:scale-95 w-full sm:w-auto">
              Explore Central Command
            </a>
            <button 
            onClick={() => setIsVideoOpen(true)}
            className="border-2 border-indigo-700 bg-[#13172e]/80 backdrop-blur-sm hover:border-fuchsia-500 hover:bg-[#1a1f3c]/80 text-indigo-100 font-bold text-lg py-4 px-10 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(99,102,241,0.2)] active:scale-95 w-full sm:w-auto">
              Watch Demo
            </button>
          </div>
        </FadeIn>
      </header>

      {/* --- UPDATED: CLIENT ROSTER MARQUEE (Larger, colored images with hover scale) --- */}
      <div className="border-b border-indigo-900/30 bg-[#060810]/80 py-10 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-12 flex flex-col md:flex-row items-center gap-8">
          <span className="text-xs font-bold text-indigo-400/80 uppercase tracking-widest whitespace-nowrap">Trusted By Industry Leaders:</span>
          <div className="flex flex-wrap justify-center md:justify-start gap-10 md:gap-14 items-center w-full">
            {clients.map((client, idx) => (
              <img 
                key={idx} 
                src={client.image} 
                alt={client.name} 
                title={client.name}
                className="h-10 md:h-14 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-sm cursor-default"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-indigo-900/30 bg-[#101426]/60 backdrop-blur-md py-12 px-8 lg:px-12 shadow-lg relative z-10">
        {[
          { stat: "8", title: "Our Brands", desc: "ASAP!, KlassMall, The Finest Fit & more", color: "text-fuchsia-400", shadow: "drop-shadow-[0_0_10px_rgba(232,121,249,0.3)]" },
          { stat: "15+", title: "Agency Services", desc: "Systems Integration, Branding, Web Dev", color: "text-indigo-400", shadow: "drop-shadow-[0_0_10px_rgba(129,140,248,0.3)]" },
          { stat: "11+", title: "SaaS Systems", desc: "HRMS, CRM, POS, ERP, E-wallets", color: "text-blue-400", shadow: "drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]" },
          { stat: "30+", title: "Hardware IT", desc: "Cloud, Servers, IoT, Network Security", color: "text-cyan-400", shadow: "drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]" }
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

      {/* --- SOFTWARE SOLUTIONS --- */}
      <div id="software" className="scroll-mt-24 pt-24 bg-gradient-to-b from-transparent to-[#0d111f]/30">
        <div className="text-center max-w-4xl mx-auto px-8">
          <h3 className="text-xs font-bold text-fuchsia-500 tracking-[0.2em] uppercase mb-4">SaaS Ecosystem</h3>
          <h2 className="text-4xl font-bold text-white mb-6">Central Command Dashboard</h2>
          <p className="text-indigo-200">Scale operations effortlessly with our modular property systems. Need more? Request add-ons for HRMS, CRM, Financial Accounting, and Fleet Parcel Tracking directly in your workspace.</p>
        </div>
        {modulesData.map((module) => (
          <ModuleSection key={module.id} data={module} />
        ))}
      </div>

      {/* --- CONNECTOR SHOWCASE --- */}
      <ConnectorShowcase />

      {/* --- ENHANCED AGENCY SERVICES --- */}
      <section id="services" className="py-24 border-b border-indigo-900/30 px-8 lg:px-12 bg-gradient-to-b from-[#090b14]/50 to-[#0d111f]/50 scroll-mt-24">
        <div className="max-w-[1600px] mx-auto">
          <FadeIn>
            <div className="mb-16">
              <h3 className="text-xs font-bold text-blue-500 tracking-[0.2em] uppercase mb-4">Bespoke Enterprise Solutions</h3>
              <h2 className="text-4xl md:text-5xl font-bold text-white max-w-2xl">Tailored Agency Services for Business Expansion.</h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencyServices.map((service, idx) => (
              <FadeIn key={idx} delay={idx * 100}>
                <div className={`bg-[#13172e]/60 border ${service.glow.split(' ')[1] || 'border-indigo-800/40'} rounded-2xl overflow-hidden transition-all duration-500 h-full flex flex-col justify-between group ${service.glow}`}>
                  
                  <div className="w-full h-48 bg-[#090b14] overflow-hidden relative">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13172e]/60 via-transparent to-transparent"></div>
                  </div>

                  <div className="p-8 pt-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className={`text-xl font-bold text-white mb-3 transition-colors ${service.textGlow}`}>{service.title}</h4>
                      <p className="text-sm text-indigo-200/90 leading-relaxed mb-8">{service.desc}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-indigo-800/50 mt-auto">
                      <button 
                        onClick={() => openInquiryModal(service.title, 'Service')}
                        className={`w-full bg-gradient-to-r ${service.color} opacity-80 hover:opacity-100 text-white font-bold py-3 rounded-lg transition-all active:scale-95 shadow-md`}
                      >
                        Avail Service
                      </button>
                    </div>
                  </div>

                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- SUBSIDIARY BRANDS ECOSYSTEM --- */}
      <section id="brands" className="py-24 border-b border-indigo-900/30 px-8 lg:px-12 backdrop-blur-sm scroll-mt-24">
        <div className="max-w-[1600px] mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h3 className="text-xs font-bold text-fuchsia-500 tracking-[0.2em] uppercase mb-4">The Brains Network</h3>
              <h2 className="text-4xl font-bold text-white mb-6">Our Diverse Subsidiary Brands.</h2>
              <p className="text-indigo-200 max-w-3xl mx-auto">A thriving B2B and B2C marketplace ecosystem. Connect with our proprietary networks directly through your Central Command operator dashboard.</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subsidiaryBrands.map((brand, idx) => (
              <FadeIn key={idx} delay={idx * 50} direction="scale">
                <div className="bg-[#0b0e1b]/80 border border-fuchsia-900/30 rounded-xl p-6 hover:bg-[#13172e] hover:border-fuchsia-500/50 transition-all shadow-lg text-center h-full flex flex-col items-center justify-center">
                  {brand.image ? (
                    <div className="h-14 md:h-16 flex items-center justify-center mb-4">
                      <img src={brand.image} alt={brand.name} className="max-h-full max-w-full object-contain drop-shadow-md" />
                    </div>
                  ) : (
                    <div className="text-3xl mb-3">{brand.icon}</div>
                  )}
                  <h4 className="text-base font-bold text-white mb-2">{brand.name}</h4>
                  <p className="text-xs text-indigo-300/70">{brand.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- HARDWARE & INFRASTRUCTURE --- */}
      <section id="hardware" className="py-24 border-b border-indigo-900/30 px-8 lg:px-12 bg-gradient-to-t from-[#060810] to-[#0d111f]/30 scroll-mt-24">
        <div className="max-w-[1600px] mx-auto">
          
          <FadeIn>
            <div className="text-center mb-16">
              <h3 className="text-xs font-bold text-cyan-500 tracking-[0.2em] uppercase mb-4">Hardware Procurement</h3>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Equipping your infrastructure.</h2>
              <p className="text-indigo-200 max-w-3xl mx-auto leading-relaxed">
                Software requires robust physical foundations. We manage the full PC lifecycle and deploy cutting-edge hardware, backed by global technology partners.
              </p>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <FadeIn delay={100}>
              <div className="bg-[#13172e]/60 border border-cyan-800/50 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col group">
                <div className="aspect-video w-full bg-black relative">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/FwzdLd3bSx8?autoplay=1&mute=1"
                    title="Millennium Interactive Board Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-cyan-500/50 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest pointer-events-none">
                    Flagship Display
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Millennium Interactive Board</h3>
                    <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                      The start of modern day technology. A dynamic touch panel with a 4K Ultra High-Definition display, an ultrawide angle camera for seamless online meetings, and embedded Windows/Android operating systems.
                    </p>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-indigo-300">
                    <li className="flex items-center"><span className="text-cyan-500 mr-2">✓</span> 55" to 100" full touch screen display</li>
                    <li className="flex items-center"><span className="text-cyan-500 mr-2">✓</span> Immersive telepresence setup</li>
                    <li className="flex items-center"><span className="text-cyan-500 mr-2">✓</span> Wireless casting & Bluetooth ready</li>
                  </ul>
                  <button 
                    onClick={() => openInquiryModal('Millennium Interactive Board', 'Hardware')}
                    className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 font-bold py-3 rounded-lg transition-all"
                  >
                    Request Spec Sheet
                  </button>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="bg-[#13172e]/60 border border-emerald-800/50 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col group">
                <div className="aspect-video w-full bg-[#090b14] relative flex items-center justify-center overflow-hidden">
                  <img src="/Thehco.png" alt="THEHCO Tech Device" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-emerald-500/50 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Flagship Innovation</div>
                </div>
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">THEHCO Tech Device</h3>
                    <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                      Thermo Hydro Octane and Cetane Booster. A revolutionary heat exchanger that expands fuel into an atomized state for all internal combustion engines. Reduces carbon emissions by 30% to 90%.
                    </p>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-indigo-300">
                    <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> Works on Diesel and Gasoline engines</li>
                    <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> 10% to 60% reduction in fuel consumption</li>
                    <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> Boosts engine torque by 10% or more</li>
                  </ul>
                  <button 
                    onClick={() => openInquiryModal('THEHCO Tech Device', 'Hardware')}
                    className="w-full bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 font-bold py-3 rounded-lg transition-all"
                  >
                    Inquire for Fleet Installation
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="mt-20 pt-16 border-t border-indigo-900/50 w-full overflow-hidden relative">
            <style>{`
              @keyframes scroll-left {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-50% - 1rem)); }
              }
              @keyframes scroll-right {
                0% { transform: translateX(calc(-50% - 1rem)); }
                100% { transform: translateX(0); }
              }
              .animate-scroll-left { animation: scroll-left 60s linear infinite; width: max-content; }
              .animate-scroll-right { animation: scroll-right 60s linear infinite; width: max-content; }
              .hover-pause:hover { animation-play-state: paused; }
              
              .fade-edges {
                mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              }
            `}</style>

            <FadeIn delay={150}>
              <div className="text-center mb-10">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Full Hardware Catalog</h4>
                <p className="text-xs text-indigo-300/80 max-w-lg mx-auto">Explore over 50 enterprise-grade hardware categories.</p>
              </div>
              
              <div className="flex flex-col gap-4 fade-edges">
                <div className="flex space-x-4 animate-scroll-left hover-pause">
                  {[...hardwareProducts.slice(0, 28), ...hardwareProducts.slice(0, 28)].map((prod, idx) => (
                    <span key={`r1-${idx}`} className="bg-[#13172e]/60 border border-indigo-800/50 text-indigo-300 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-900/20 transition-colors text-sm px-6 py-2.5 rounded-full cursor-default whitespace-nowrap shadow-sm">
                      {prod}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-4 animate-scroll-right hover-pause">
                  {[...hardwareProducts.slice(28), ...hardwareProducts.slice(28)].map((prod, idx) => (
                    <span key={`r2-${idx}`} className="bg-[#13172e]/60 border border-indigo-800/50 text-indigo-300 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-900/20 transition-colors text-sm px-6 py-2.5 rounded-full cursor-default whitespace-nowrap shadow-sm">
                      {prod}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center mt-12">
                <button 
                  onClick={() => openInquiryModal('Full Hardware Catalog Quote', 'Hardware')}
                  className="bg-transparent border-2 border-cyan-700/50 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500 font-bold py-3 px-8 rounded-full transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_14px_rgba(6,182,212,0.15)]"
                >
                  Request Hardware Quote
                </button>
              </div>
            </FadeIn>
          </div>

          {/* --- UPDATED: AUTHORIZED PARTNER NETWORK (Glassmorphism + Colored Logos) --- */}
          <div className="mt-20 max-w-5xl mx-auto w-full">
            <FadeIn delay={200}>
              <div className="bg-[#13172e]/40 border border-indigo-800/50 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-8 text-center relative z-10 border-b border-indigo-900/50 pb-4">Authorized Partner Network</h4>
                
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 relative z-10">
                  {hardwarePartners.map((partner, idx) => (
                    <div key={idx} className="bg-[#13172e]/60 backdrop-blur-sm border border-indigo-700/50 rounded-2xl py-6 px-8 hover:border-cyan-500/80 hover:bg-[#1a1f3c] transition-all cursor-default shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 group flex items-center justify-center min-w-[160px]">
                      <img 
                        src={partner.image} 
                        alt={partner.name}
                        title={partner.name}
                        className="h-12 md:h-16 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </section>

      {/* --- REDESIGNED CONTACT US SECTION --- */}
      <section id="contact" className="py-24 border-b border-indigo-900/30 px-8 lg:px-12 bg-[#090b14]/80 scroll-mt-24">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <FadeIn>
              <div>
                <h3 className="text-sm font-bold text-fuchsia-500 tracking-[0.2em] uppercase mb-4">Get in Touch</h3>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">Let's build progressive technology together.</h2>
                <p className="text-xl text-indigo-200 leading-relaxed mb-12 max-w-lg">
                  Whether you need a full enterprise software ecosystem, custom hardware procurement, or bespoke branding, our team is ready to scale your operations.
                </p>
                
                <div className="flex flex-col gap-8">
                  {/* Address */}
                  <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 rounded-2xl bg-[#13172e] border border-indigo-800/50 flex items-center justify-center text-3xl group-hover:border-fuchsia-500/50 group-hover:bg-fuchsia-900/20 transition-all shadow-md shrink-0">
                      🏢
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Corporate Headquarters</h4>
                      <p className="text-base text-indigo-200/90 leading-relaxed">
                        Unit 1004 Atlanta Centre,<br />
                        Annapolis St. San Juan City, Philippines
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 rounded-2xl bg-[#13172e] border border-indigo-800/50 flex items-center justify-center text-3xl group-hover:border-fuchsia-500/50 group-hover:bg-fuchsia-900/20 transition-all shadow-md shrink-0">
                      📞
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Direct Lines</h4>
                      <p className="text-base text-indigo-200/90">(02) 835 90648 <span className="mx-2 text-indigo-700">|</span> +63 975 582 6830 <span className="mx-2 text-indigo-700">|</span> +63 981 540 9835</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 rounded-2xl bg-[#13172e] border border-indigo-800/50 flex items-center justify-center text-3xl group-hover:border-fuchsia-500/50 group-hover:bg-fuchsia-900/20 transition-all shadow-md shrink-0">
                      ✉️
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Email Support</h4>
                      <p className="text-base text-indigo-200/90">hello@brains.asia</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Right Side Visual Block */}
            <FadeIn delay={150}>
              <div className="bg-[#13172e]/40 border border-indigo-800/50 rounded-3xl p-10 lg:p-16 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <img src="/brains-logo.png" alt="Brains Infinite Innovations" className="h-20 mb-10 relative z-10 drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]" />
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Ready to expand your business?</h3>
                <p className="text-lg text-indigo-200 mb-10 relative z-10 leading-relaxed max-w-md">Request a formal consultation and our expert strategists will connect with you within 24 hours.</p>
                
                <button 
                  onClick={() => setIsConsultationOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white text-lg font-bold py-5 px-10 rounded-xl transition-all duration-300 shadow-[0_10px_30px_rgba(217,70,239,0.3)] hover:shadow-[0_15px_40px_rgba(217,70,239,0.5)] active:scale-95 relative z-10"
                >
                  Request a Consultation
                </button>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-8 lg:px-12 bg-[#080a12]/90 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-indigo-400/60">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
             <img src="/brains-logo.png" alt="Brains Infinite Innovations" className="h-6 w-auto object-contain"/>
             <span className="font-semibold text-indigo-200">Brains Infinite Innovations</span>
          </div>
          <div className="flex gap-6 mb-4 md:mb-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
          <div>
            © 2026 Brains Infinite Innovations. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}