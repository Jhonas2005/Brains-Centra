'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient'; 

import { 
  Globe, LayoutList, Building2, Landmark, ClipboardCheck, 
  Cpu, Radio, CreditCard, Users, PieChart, Handshake, 
  TrendingUp, ShoppingCart, Package, Wallet, Truck, 
  Navigation, KanbanSquare, Briefcase, MonitorSmartphone, ShoppingBag,
  Facebook, Instagram, AlertTriangle, LogOut, Settings, User, Lock, Bell
} from 'lucide-react';

import { MyRequestsModule } from '@/components/modules/MyRequestsModule';
import { ConnectorModule } from '@/components/modules/ConnectorModule';
import { HardwareModule } from '@/components/modules/HardwareModule';
import { HMSModule } from '@/components/modules/HMSModule';
import { PMSModule } from '@/components/modules/PMSModule';
import { HVMSModule } from '@/components/modules/HVMSModule';
import { BMSModule } from '@/components/modules/BMSModule';
import { IoTModule } from '@/components/modules/IoTModule';

// Custom SVG Icons for Brands
const FacebookIcon = ({ className, strokeWidth = 1.5 }) => (
  <svg className={className} strokeWidth={strokeWidth} width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ className, strokeWidth = 1.5 }) => (
  <svg className={className} strokeWidth={strokeWidth} width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

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

// --- EXPANDED MODULES & ECOSYSTEM DATA ---
const ALL_MODULES = [
  { id: "overview", category: "Dashboard", label: "Command Overview", shortName: "HOME", icon: <Globe className="w-6 h-6 text-fuchsia-400" strokeWidth={1.5} /> },
  { id: "my-requests", category: "Dashboard", label: "My Inquiries & Requests", shortName: "REQ", icon: <LayoutList className="w-6 h-6 text-indigo-300" strokeWidth={1.5} /> },
  
  // Core Facilities
  { id: "hms", category: "Core Facilities", label: "Frontdesk (HMS)", shortName: "HMS", icon: <Building2 className="w-6 h-6 text-blue-400" strokeWidth={1.5} />, price: 8500 },
  { id: "pms", category: "Core Facilities", label: "Landlord (PMS)", shortName: "PMS", icon: <Landmark className="w-6 h-6 text-blue-400" strokeWidth={1.5} />, price: 11500 },
  { id: "hvms", category: "Core Facilities", label: "Butler (HVMS)", shortName: "HVMS", icon: <ClipboardCheck className="w-6 h-6 text-blue-400" strokeWidth={1.5} />, price: 5500 },
  { id: "bms", category: "Core Facilities", label: "Sekyu (BMS)", shortName: "BMS", icon: <Cpu className="w-6 h-6 text-blue-400" strokeWidth={1.5} />, price: 14500 },
  { id: "iot", category: "Core Facilities", label: "Housekeeper (IoT)", shortName: "IoT", icon: <Radio className="w-6 h-6 text-blue-400" strokeWidth={1.5} />, price: 17000 },
  
  // Connector Systems
  { id: "hr", category: "Connector Systems", label: "Human Resources", shortName: "HR", icon: <Users className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />, price: 6500 },
  { id: "ais", category: "Connector Systems", label: "Accounting Info", shortName: "AIS", icon: <PieChart className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />, price: 9500 },
  { id: "crm", category: "Connector Systems", label: "Customer Relations", shortName: "CRM", icon: <Handshake className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />, price: 7500 },
  { id: "mis", category: "Connector Systems", label: "Management Info", shortName: "MIS", icon: <TrendingUp className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />, price: 8000 },
  { id: "pos", category: "Connector Systems", label: "Point of Sale", shortName: "POS", icon: <ShoppingCart className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />, price: 4500 },
  { id: "ims", category: "Connector Systems", label: "Inventory Mgt", shortName: "IMS", icon: <Package className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />, price: 6000 },
  { id: "ewallet", category: "Connector Systems", label: "E-Wallets", shortName: "PAY", icon: <Wallet className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />, price: 5000 },
  { id: "parcel", category: "Connector Systems", label: "Parcel Tracking", shortName: "TRACK", icon: <Truck className="w-6 h-6 text-amber-400" strokeWidth={1.5} />, price: 3500 },
  { id: "fleet", category: "Connector Systems", label: "Fleet Management", shortName: "FLEET", icon: <Navigation className="w-6 h-6 text-amber-400" strokeWidth={1.5} />, price: 12000 },
  { id: "pms_proj", category: "Connector Systems", label: "Project Mgt", shortName: "PROJ", icon: <KanbanSquare className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />, price: 5500 },

  // Ecosystem (Always Accessible)
  { id: "services", category: "Brains Ecosystem", label: "Agency Services", shortName: "AGENCY", icon: <Briefcase className="w-6 h-6 text-fuchsia-400" strokeWidth={1.5} /> },
  { id: "hardware", category: "Brains Ecosystem", label: "Hardware Catalog", shortName: "HARDWARE", icon: <MonitorSmartphone className="w-6 h-6 text-cyan-400" strokeWidth={1.5} /> },
  { id: "brands", category: "Brains Ecosystem", label: "Our Brands", shortName: "BRANDS", icon: <ShoppingBag className="w-6 h-6 text-fuchsia-400" strokeWidth={1.5} /> },

  // Settings
  { id: "subscription", category: "Settings", label: "Billing & Subscription", shortName: "SUBS", icon: <CreditCard className="w-6 h-6 text-indigo-300" strokeWidth={1.5} /> },
  { id: "account-settings", category: "Settings", label: "Account Settings", shortName: "ACCOUNT", icon: <Settings className="w-6 h-6 text-indigo-300" strokeWidth={1.5} /> }
];

const agencyServices = [
  { id: "branding", image: "/services/branding.jpg", title: "Branding & Design", desc: "Logo creation, moodboards, custom illustrations, and full brand strategy.", color: "from-pink-500 to-rose-500", glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] border-pink-900/30" },
  { id: "marketing", image: "/services/marketing.jpg", title: "Marketing & Sales", desc: "Omnichannel campaigns, social media management, and CRM automation.", color: "from-amber-500 to-orange-500", glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] border-amber-900/30" },
  { id: "bizdev", image: "/services/business-dev.jpg", title: "Business Development", desc: "Connecting your business to the right people, clients, and partners globally.", color: "from-emerald-500 to-teal-500", glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] border-emerald-900/30" },
  { id: "webdev", image: "/services/web-dev.jpg", title: "Custom Web & App Dev", desc: "Bespoke mobile applications and website layouts with UI/UX optimization.", color: "from-blue-500 to-cyan-500", glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] border-blue-900/30" },
  { id: "integration", image: "/services/integration.jpg", title: "Systems Integration", desc: "Interlink networks and create safe, reliable systems with comprehensive maintenance.", color: "from-violet-500 to-purple-500", glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] border-violet-900/30" },
  { id: "staff", image: "/services/resource-staff.jpg", title: "Resource Augmentation", desc: "Providing highly skilled talent and customer service support teams.", color: "from-fuchsia-500 to-pink-500", glow: "group-hover:shadow-[0_0_30px_rgba(217,70,239,0.3)] border-fuchsia-900/30" },
];

const subsidiaryBrands = [
  { 
    name: "ASAP!", image: "/logos/asap-logo.png", icon: "🚀", 
    desc: "All Services App for fast, professional blue and white-collar booking.",
    links: { website: "https://www.asapph.net" }
  },
  { 
    name: "KlassMall", image: "/logos/klassmall-logo.png", icon: "🛒", 
    desc: "B2B and B2C wholesale retail platform connecting direct to manufacturers.",
    links: { website: "#" } 
  },
  { 
    name: "Luxurious Cleaning Co.", image: "/logos/luxurious-logo.png", icon: "✨", 
    desc: "Top-tier general, deep, and post-construction cleaning services.",
    links: { facebook: "https://facebook.com/luxuriouscleaningph" }
  },
  { 
    name: "The Soap Republic", image: "/logos/soap-republic-logo.png", icon: "🧼", 
    desc: "High-quality, eco-friendly household and industrial cleaning products.",
    links: {} 
  },
  { 
    name: "The Beauty Alley", image: "/logos/beauty-alley-logo.png", icon: "💆‍♀️", 
    desc: "Luxurious wellness and health home services, including IV drips.",
    links: { facebook: "https://facebook.com/thebeautyalleymnl", instagram: "https://instagram.com/thebeautyalleymnl" }
  },
  { 
    name: "Green Oasis", image: "/logos/green-oasis-logo.png", icon: "🌿", 
    desc: "Landscape design, interior biophilic installations, and garden maintenance.",
    links: { website: "https://thegreenoasis.ph" }
  },
  { 
    name: "The Finest Fit", image: "/logos/finest-fit-logo.png", icon: "👕", 
    desc: "High-quality customized uniforms, corporate apparel, and printing.",
    links: { website: "https://thefinestfit.com" }
  },
  { 
    name: "Portress", image: "/logos/portress-logo.png", icon: "🚢", 
    desc: "B2B supply chain and logistics solutions powered by Klassic Marketing.",
    links: {} 
  },
];

const formatPHP = (amount) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

// --- UPDATED GENERIC INQUIRY MODAL (Connects to Supabase) ---
const InquiryModal = ({ subject, type, user, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      type: type,
      subject: subject,
      name: user ? `${user.first_name} ${user.last_name}` : 'Unknown User',
      email: user?.email || 'Unknown Email',
      company: user?.company || 'Independent Operator',
      details: e.target.details.value
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => onClose(), 2500);
      }
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  const accentColor = type === 'Hardware' ? 'cyan' : 'blue';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={onClose}></div>
      <div className={`relative w-full max-w-md bg-[#13172e] border border-${accentColor}-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] z-10 transition-all duration-300`}>
        <button onClick={onClose} className={`absolute top-4 right-4 text-indigo-400 hover:text-${accentColor}-400 transition-colors`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        {submitted ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/50 text-emerald-400 text-3xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">✓</div>
            <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
            <p className="text-sm text-indigo-200">This request has been added to your tracking ledger. Our team will process it shortly.</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-2">Request {type}</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Inquire about <span className={`text-${accentColor}-400 font-bold`}>{subject}</span>.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Requester Profile</label>
                <div className="w-full bg-[#060810]/50 border border-indigo-800/50 rounded-lg px-4 py-2.5 text-sm text-indigo-400/80 cursor-not-allowed">
                  {user?.first_name} {user?.last_name} ({user?.email})
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">Additional Details / Custom Specs</label>
                <textarea name="details" rows="4" required className={`w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-${accentColor}-500/50 focus:ring-1 focus:ring-${accentColor}-500/50 transition-colors`} placeholder="Provide any specific requirements, sizing, or operational details..."></textarea>
              </div>
              <button disabled={loading} type="submit" className={`w-full bg-gradient-to-r from-${accentColor}-600 to-indigo-600 hover:from-${accentColor}-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg mt-6 shadow-[0_4px_14px_rgba(59,130,246,0.25)] active:scale-95 transition-all disabled:opacity-50`}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [billingData, setBillingData] = useState({ payment_methods: [], invoices: [] });
  
  // Global Maintenance Mode State
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  // Account Settings State
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', company: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Ecosystem Inquiry Modal
  const [inquiryModal, setInquiryModal] = useState({ isOpen: false, subject: "", type: "" });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const openInquiryModal = (subject, type) => {
    setInquiryModal({ isOpen: true, subject, type });
  };

  const fetchMyProfileAndBilling = async () => {
    try {
      setLoading(true);

      // Check Global Settings for Maintenance Mode
      try {
        const { data: settingsData } = await supabase.from('system_settings').select('*').single();
        if (settingsData && settingsData.maintenance_mode) {
          setMaintenanceMode(true);
        }
      } catch (e) { console.error("Could not load global settings", e); }

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        window.location.href = '/';
        return;
      }

      const realUserId = authData.user.id;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', realUserId)
        .single();

      if (profileError) throw profileError;

      const safeProfile = {
        ...profile,
        subscribed_modules: profile.subscribed_modules || []
      };

      setUserData(safeProfile);
      setProfileForm({
        first_name: safeProfile.first_name || '',
        last_name: safeProfile.last_name || '',
        company: safeProfile.company || ''
      });

      const res = await fetch(`/api/user/billing?userId=${realUserId}`);
      if (res.ok) {
        const billingJson = await res.json();
        setBillingData(billingJson);
        if (billingJson.subscribed_modules) {
          setUserData(prev => ({ ...prev, subscribed_modules: billingJson.subscribed_modules }));
        }
      }

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
      const res = await fetch('/api/user/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'cancel',
          userId: userData.id, 
          moduleToCancel: moduleToCancel 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update subscription");

      const updatedModules = moduleToCancel === 'all' 
        ? [] 
        : userData.subscribed_modules.filter(id => id !== moduleToCancel);

      setUserData(prev => ({ ...prev, subscribed_modules: updatedModules }));
      showNotification("Subscription canceled successfully.", "success");

      if (moduleToCancel === 'all' || activeModule === moduleToCancel) {
        setActiveModule("overview");
      }

      setShowCancelModal(false);
      setModuleToCancel(null);
      fetchMyProfileAndBilling();

    } catch (error) {
      console.error(error);
      showNotification(error.message || "An error occurred while processing your cancellation.", "error");
    } finally {
      setCancelProcessing(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.from('profiles').update({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        company: profileForm.company
      }).eq('id', userData.id);
      
      if (error) throw error;
      
      setUserData(prev => ({ 
        ...prev, 
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        company: profileForm.company
      }));
      showNotification("Profile updated successfully.", "success");
    } catch (error) {
      console.error("Profile update error:", error);
      showNotification("Failed to update profile.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userData.email);
      if (error) throw error;
      showNotification("Password reset email sent! Check your inbox.", "success");
    } catch (error) {
      console.error("Password reset error:", error);
      showNotification("Failed to send reset email.", "error");
    }
  };

  const availableModulesToBuy = ALL_MODULES.filter(m => 
    !['overview', 'subscription', 'account-settings', 'services', 'brands', 'hardware'].includes(m.id) && 
    !userData?.subscribed_modules?.includes(m.id)
  );

  const upgradeTotal = selectedUpgradeModules.reduce((sum, modId) => {
    const modObj = ALL_MODULES.find(m => m.id === modId);
    return sum + (modObj?.price || 0);
  }, 0);

  // Group modules for the sidebar
  const categories = [...new Set(ALL_MODULES.map(m => m.category))];

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
    <div className="flex h-screen overflow-hidden bg-transparent text-gray-100 font-sans selection:bg-fuchsia-500/30">
      <ParticleBackground />

      <style>{`
        .connector-scrollbar::-webkit-scrollbar { display: none; }
        .connector-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 1rem)); } }
        @keyframes scroll-right { 0% { transform: translateX(calc(-50% - 1rem)); } 100% { transform: translateX(0); } }
        .animate-scroll-left { animation: scroll-left 60s linear infinite; width: max-content; }
        .animate-scroll-right { animation: scroll-right 60s linear infinite; width: max-content; }
        .hover-pause:hover { animation-play-state: paused; }
        .fade-edges { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
      `}</style>

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-20 lg:w-72 flex-shrink-0 bg-[#060810]/80 border-r border-indigo-900/50 backdrop-blur-xl flex flex-col z-40 transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-indigo-900/50 shrink-0">
          <img src="/brains-logo.png" alt="Brains" className="h-8 w-auto hidden lg:block" />
          <Globe className="w-8 h-8 text-fuchsia-500 lg:hidden" />
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 px-3 lg:px-4 connector-scrollbar">
          {categories.map((category, catIdx) => {
            const categoryModules = ALL_MODULES.filter(m => m.category === category);
            return (
              <div key={catIdx} className="flex flex-col gap-2 w-full">
                <div className="hidden lg:block text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest px-4 pb-1 border-b border-indigo-900/50 mb-1">
                  {category}
                </div>
                {categoryModules.map((module) => {
                  const isAlwaysAccessible = ['overview', 'my-requests', 'subscription', 'account-settings', 'services', 'brands', 'hardware'].includes(module.id);
                  const isSubscribed = userData?.subscribed_modules?.includes(module.id);
                  
                  // Security Locking Logic
                  const isCoreOrConnector = ['Core Facilities', 'Connector Systems'].includes(module.category);
                  const isLockedByMaintenance = maintenanceMode && isCoreOrConnector;
                  const isClickable = (isAlwaysAccessible || isSubscribed) && !isLockedByMaintenance;
                  
                  const isActive = activeModule === module.id;

                  return (
                    <button
                      key={module.id}
                      onClick={() => isClickable && setActiveModule(module.id)}
                      disabled={!isClickable}
                      className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start w-full px-2 lg:px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-fuchsia-900/40 to-blue-900/40 border border-fuchsia-500/50 text-white shadow-[0_0_15px_rgba(217,70,239,0.2)]' 
                          : isClickable 
                            ? 'text-indigo-200 hover:bg-[#13172e]/80' 
                            : 'text-indigo-500/40 cursor-not-allowed'
                      }`}
                    >
                      <div className={`lg:mr-3 ${isClickable ? 'group-hover:scale-110 transition-transform' : ''}`}>{module.icon}</div>
                      <span className="flex-1 text-[9px] lg:text-sm font-semibold text-center lg:text-left">{module.label}</span>
                      {!isClickable && (
                        <span className={`hidden lg:block text-[10px] px-2 py-0.5 rounded ml-2 border font-bold ${
                          isLockedByMaintenance && isSubscribed 
                            ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' 
                            : 'text-indigo-500/40 border-indigo-800/30'
                        }`}>
                          {isLockedByMaintenance && isSubscribed ? 'MAINT' : 'LOCKED'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          })}
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        
        {/* --- MAINTENANCE MODE BANNER --- */}
        {maintenanceMode && (
          <div className="w-full bg-amber-500/20 border-b border-amber-500/50 px-4 py-3 flex items-center justify-center gap-3 z-50 backdrop-blur-md shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-amber-200 text-xs md:text-sm font-bold tracking-wide text-center">
              SYSTEM ALERT: Central Command is currently undergoing scheduled maintenance. Modules may experience degraded performance.
            </p>
          </div>
        )}

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-indigo-900/50 bg-[#090b14]/50 backdrop-blur-sm shrink-0">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-white tracking-wide">Welcome, {userData?.first_name}</h1>
            <p className="text-[10px] md:text-xs text-indigo-400 font-mono hidden sm:block">{userData?.company || 'Independent'} • Operator Workspace</p>
          </div>
          <button onClick={() => setShowLogoutConfirm(true)} className="px-4 py-2 bg-[#13172e]/80 text-indigo-200 text-xs md:text-sm font-semibold rounded-lg border border-indigo-700/50 hover:bg-[#1a1f3c]/80 transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 connector-scrollbar bg-transparent">
          <div className="max-w-[1600px] mx-auto h-full flex flex-col">
            
            {/* Maintenance Intercept */}
            {maintenanceMode && ['Core Facilities', 'Connector Systems'].includes(ALL_MODULES.find(m => m.id === activeModule)?.category) ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn bg-[#13172e]/50 border border-indigo-800/30 rounded-2xl p-8 shadow-xl">
                <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <AlertTriangle className="w-10 h-10 text-amber-400 animate-pulse" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-black text-white mb-3 tracking-tight">System Under Maintenance</h2>
                <p className="text-sm text-indigo-200 max-w-md mx-auto leading-relaxed">
                  This module is currently locked for scheduled enterprise upgrades and security patches. Data integrity is preserved. Please check back shortly.
                </p>
                <button 
                  onClick={() => setActiveModule('overview')} 
                  className="mt-8 px-6 py-2.5 bg-[#090b14] border border-indigo-700 text-indigo-300 hover:text-white hover:border-fuchsia-500 hover:bg-fuchsia-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95"
                >
                  Return to Command Overview
                </button>
              </div>
            ) : (
              <div className="bg-[#13172e]/50 border border-indigo-800/30 rounded-2xl p-4 md:p-8 w-full flex flex-col flex-grow overflow-y-auto connector-scrollbar shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative min-h-[600px]">
                
                {/* OVERVIEW MODULE */}
                {activeModule === 'overview' && (
                  <div className="h-full flex flex-col gap-4 md:gap-6 w-full animate-fadeIn">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-indigo-800/50 pb-4 gap-4 w-full">
                      <div>
                        <h3 className="text-base md:text-xl font-bold text-white flex items-center gap-2">
                          <Globe className="w-6 h-6 text-fuchsia-400" /> Command Overview
                        </h3>
                        <p className="text-[10px] md:text-sm text-indigo-300/60 mt-1">System telemetry and aggregate metrics across all active modules</p>
                      </div>
                      
                      <div className="flex items-center gap-3 self-start lg:self-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                          <span className="text-[9px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest hidden sm:inline">All Systems Operational</span>
                        </div>
                        <button 
                          onClick={() => setShowUpgradeModal(true)} 
                          className="bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white text-[10px] md:text-xs font-bold py-1.5 md:py-2 px-4 rounded-full transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] active:scale-95 whitespace-nowrap"
                        >
                          + Upgrade SaaS Modules
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 w-full">
                      <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-3 md:p-5 shadow-lg">
                        <div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">ACTIVE MODULES</div>
                        <div className="text-xl md:text-3xl text-white font-bold">{userData?.subscribed_modules?.length || 0}</div>
                      </div>
                      <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-3 md:p-5 shadow-lg">
                        <div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">NETWORK UPTIME</div>
                        <div className="text-xl md:text-3xl text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">99.9%</div>
                      </div>
                      <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-3 md:p-5 shadow-lg">
                        <div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">OPEN ALERTS</div>
                        <div className="text-xl md:text-3xl text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">3</div>
                      </div>
                      <div className="bg-[#090b14]/60 border border-indigo-800/50 rounded-xl p-3 md:p-5 shadow-lg">
                        <div className="text-[9px] md:text-xs text-indigo-400 font-bold mb-1 md:mb-2 tracking-wider truncate">SECURITY RATING</div>
                        <div className="text-xl md:text-3xl text-blue-400 font-bold drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">A+</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-2 w-full flex-grow">
                      <div className="lg:col-span-2 bg-[#090b14]/40 border border-indigo-800/30 rounded-xl p-4 md:p-6 flex flex-col h-full shadow-lg">
                        <h4 className="text-xs md:text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4 border-b border-indigo-900/50 pb-2">Global Activity Feed</h4>
                        <div className="flex flex-col gap-4 overflow-y-auto pr-2 connector-scrollbar">
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
                          <h4 className="text-xs md:text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">Cloud Infrastructure</h4>
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

                {/* MY REQUESTS */}
                {activeModule === 'my-requests' && <MyRequestsModule userEmail={userData?.email} />}

                {/* HARDWARE CATALOG */}
                {activeModule === 'hardware' && <HardwareModule openInquiryModal={openInquiryModal} />}

                {/* CORE SAAS MODULES */}
                {activeModule === 'hms' && <HMSModule />}
                {activeModule === 'pms' && <PMSModule />}
                {activeModule === 'hvms' && <HVMSModule />}
                {activeModule === 'bms' && <BMSModule />}
                {activeModule === 'iot' && <IoTModule />}

                {/* CONNECTOR MODULES */}
                {['hr', 'ais', 'crm', 'mis', 'pos', 'ims', 'ewallet', 'parcel', 'fleet', 'pms_proj'].includes(activeModule) && (
                  <ConnectorModule systemId={activeModule} companyName={userData?.company} />
                )}

                {/* AGENCY SERVICES TAB */}
                {activeModule === 'services' && (
                  <div className="h-full flex flex-col gap-6 w-full animate-fadeIn">
                    <div className="border-b border-indigo-800/50 pb-4">
                      <h3 className="text-xl font-bold text-white mb-1">Bespoke Agency Services</h3>
                      <p className="text-xs text-indigo-300/80">Submit a request to our expert teams for customized enterprise solutions.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 overflow-y-auto connector-scrollbar pr-2 pb-6">
                      {agencyServices.map((service, idx) => (
                        <div key={idx} className={`bg-[#090b14]/60 border ${service.glow.split(' ')[1] || 'border-indigo-800/40'} rounded-xl overflow-hidden transition-all duration-300 flex flex-col group`}>
                          <div className="w-full h-24 bg-[#090b14] overflow-hidden relative">
                            <img src={service.image} alt={service.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] to-transparent"></div>
                            <div className="absolute bottom-2 left-4 text-2xl drop-shadow-lg">{service.icon}</div>
                          </div>
                          <div className="p-4 flex flex-col flex-grow">
                            <h4 className="text-sm font-bold text-white mb-2">{service.title}</h4>
                            <p className="text-xs text-indigo-300/80 leading-relaxed mb-4 flex-grow">{service.desc}</p>
                            <button 
                              onClick={() => openInquiryModal(service.title, 'Service')}
                              className={`w-full bg-gradient-to-r ${service.color} opacity-80 hover:opacity-100 text-white text-xs font-bold py-2 rounded transition-all active:scale-95`}
                            >
                              Avail Service
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBSIDIARY BRANDS TAB */}
                {activeModule === 'brands' && (
                  <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
                    <div className="border-b border-indigo-800/50 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-white tracking-tight mb-1">Our Brands Network</h3>
                        <p className="text-sm text-indigo-300/80">Connect with the wider Brains B2B and B2C marketplace ecosystem.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto connector-scrollbar pr-2 pb-6 flex-grow">
                      {subsidiaryBrands.map((brand, idx) => (
                        <div 
                          key={idx} 
                          className="bg-gradient-to-br from-[#13172e]/80 to-[#090b14]/80 backdrop-blur-sm border border-fuchsia-900/30 rounded-2xl p-6 lg:p-8 hover:border-fuchsia-500/60 hover:shadow-[0_0_30px_rgba(217,70,239,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                        >
                          <div className="h-28 w-full flex items-center justify-center mb-6 bg-[#090b14]/60 rounded-xl border border-indigo-800/40 p-4 group-hover:border-fuchsia-500/40 transition-colors shadow-inner">
                            {brand.image ? (
                              <img 
                                src={brand.image} 
                                alt={brand.name} 
                                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md" 
                              />
                            ) : (
                              <div className="text-6xl drop-shadow-lg">{brand.icon}</div>
                            )}
                          </div>
                          
                          <div className="flex-grow flex flex-col text-center">
                            <h4 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors">
                              {brand.name}
                            </h4>
                            <p className="text-sm text-indigo-200/80 leading-relaxed mb-6 flex-grow">
                              {brand.desc}
                            </p>
                            
                            {/* External Links Container */}
                            <div className="flex items-center justify-center gap-3 mt-auto pt-4 border-t border-indigo-900/50">
                              {brand.links?.website && (
                                <a href={brand.links.website} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#090b14] border border-indigo-700 rounded-xl hover:border-cyan-500 hover:text-cyan-400 text-indigo-300 transition-all active:scale-95 shadow-sm group-hover:bg-cyan-900/20" title={`Visit ${brand.name} Website`}>
                                  <Globe className="w-5 h-5" strokeWidth={1.5} />
                                </a>
                              )}
                              {brand.links?.facebook && (
                                <a href={brand.links.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#090b14] border border-indigo-700 rounded-xl hover:border-blue-500 hover:text-blue-400 text-indigo-300 transition-all active:scale-95 shadow-sm group-hover:bg-blue-900/20" title={`${brand.name} Facebook`}>
                                  <FacebookIcon className="w-5 h-5" />
                                </a>
                              )}
                              {brand.links?.instagram && (
                                <a href={brand.links.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#090b14] border border-indigo-700 rounded-xl hover:border-pink-500 hover:text-pink-400 text-indigo-300 transition-all active:scale-95 shadow-sm group-hover:bg-pink-900/20" title={`${brand.name} Instagram`}>
                                  <InstagramIcon className="w-5 h-5" />
                                </a>
                              )}
                              {(!brand.links || Object.keys(brand.links).length === 0) && (
                                <span className="text-xs text-indigo-500/50 font-medium py-2.5 italic">Links updating soon</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACCOUNT SETTINGS MODULE */}
                {activeModule === 'account-settings' && (
                  <div className="h-full flex flex-col gap-6 w-full animate-fadeIn">
                    <div className="flex flex-col border-b border-indigo-800/50 pb-4 w-full">
                      <h3 className="text-base md:text-xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-300"/> Account Settings</h3>
                      <p className="text-[10px] md:text-sm text-indigo-300/60 mt-1">Manage your profile, security preferences, and account details.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                      {/* Profile Settings */}
                      <form onSubmit={handleUpdateProfile} className="bg-[#13172e]/60 border border-indigo-800/50 rounded-xl p-6 shadow-lg flex flex-col h-fit">
                        <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2"><User className="w-4 h-4"/> Personal Profile</h4>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">First Name</label>
                              <input 
                                value={profileForm.first_name} 
                                onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})} 
                                className="w-full bg-[#090b14] border border-indigo-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Last Name</label>
                              <input 
                                value={profileForm.last_name} 
                                onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})} 
                                className="w-full bg-[#090b14] border border-indigo-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Company Name</label>
                            <input 
                              value={profileForm.company} 
                              onChange={(e) => setProfileForm({...profileForm, company: e.target.value})} 
                              className="w-full bg-[#090b14] border border-indigo-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Email Address</label>
                            <input 
                              value={userData?.email || ''} 
                              disabled
                              className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-lg px-4 py-2.5 text-sm text-indigo-400/80 cursor-not-allowed" 
                            />
                          </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-indigo-800/30 flex justify-end">
                          <button disabled={isSavingProfile} type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50">
                            {isSavingProfile ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>

                      {/* Security & Preferences */}
                      <div className="space-y-6">
                        <div className="bg-[#13172e]/60 border border-indigo-800/50 rounded-xl p-6 shadow-lg">
                          <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2"><Lock className="w-4 h-4"/> Security</h4>
                          <p className="text-sm text-indigo-200/80 mb-4">Request a secure magic link to be sent to your email to update your account password.</p>
                          <button onClick={handlePasswordReset} className="w-full bg-[#090b14] border border-indigo-700 hover:border-indigo-500 text-indigo-200 hover:text-white text-sm font-bold py-2.5 rounded-lg transition-colors">
                            Request Password Reset
                          </button>
                        </div>

                        <div className="bg-[#13172e]/60 border border-indigo-800/50 rounded-xl p-6 shadow-lg">
                          <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2"><Bell className="w-4 h-4"/> Preferences</h4>
                          
                          <label className="flex items-start gap-3 p-3 bg-[#090b14]/50 border border-indigo-800/30 rounded-xl cursor-pointer hover:border-indigo-600/50 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={emailAlerts} 
                              onChange={() => setEmailAlerts(!emailAlerts)}
                              className="mt-1 w-4 h-4 accent-indigo-500" 
                            />
                            <div>
                              <span className="text-sm font-bold text-white block">Email Notifications</span>
                              <span className="text-xs text-indigo-400 block mt-1 leading-relaxed">Receive updates about module renewals, maintenance, and platform announcements.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBSCRIPTION MODULE */}
                {activeModule === 'subscription' && (
                  <div className="h-full flex flex-col gap-4 md:gap-6 w-full animate-fadeIn">
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
                              <div key={mod} className="flex items-center justify-between p-3 bg-[#090b14]/50 border border-indigo-800/50 rounded-lg hover:border-indigo-600/50 transition-colors">
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
                                💳 {pm.card_brand} ending in **{pm.last4} <br/><span className="text-[10px] text-indigo-400">Expires: {pm.exp_month}/{pm.exp_year}</span>
                              </div>
                            ))
                          ) : <div className="text-xs text-indigo-400 p-3 border border-dashed border-indigo-800/50 rounded-lg bg-[#090b14]/30">No payment method recorded.</div>}
                        </div>
                        <button onClick={() => setShowUpgradeModal(true)} className="mt-4 w-full bg-[#090b14] border border-indigo-700 text-indigo-200 text-xs font-bold py-2.5 rounded-lg hover:bg-[#13172e] transition-colors shadow-lg">+ Add / Update Card</button>
                      </div>
                    </div>

                    <div className="bg-[#13172e]/40 border border-indigo-800/30 rounded-xl p-5 shadow-lg mt-2 flex-grow">
                      <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Billing History & Invoices</h4>
                      {billingData.invoices?.length > 0 ? (
                        <div className="space-y-2 overflow-y-auto max-h-48 pr-2 connector-scrollbar">
                          {billingData.invoices.map((inv) => (
                            <div key={inv.id} className="flex justify-between items-center p-3 bg-[#090b14]/40 border border-indigo-900/50 rounded-lg text-xs hover:bg-[#090b14]/60 transition-colors">
                              <div>
                                <span className="text-white font-bold block mb-1">{inv.description}</span>
                                <span className="text-[10px] text-indigo-400 font-mono">{new Date(inv.created_at).toLocaleDateString()} • INV-{inv.id.substring(0,6).toUpperCase()}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className="text-emerald-400 font-bold block mb-1">{formatPHP(inv.amount)}</span>
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 uppercase tracking-wide">{inv.status}</span>
                                </div>
                                <button 
                                  onClick={() => setSelectedReceipt(inv)}
                                  className="bg-indigo-600/30 hover:bg-indigo-500/50 border border-indigo-500/50 text-white px-3 py-1.5 rounded-lg transition-colors text-[10px] font-bold"
                                >
                                  🧾 Print
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-indigo-400/60 text-center py-8 border border-dashed border-indigo-800/30 rounded-lg bg-[#090b14]/20">No billing records found in database.</p>}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}