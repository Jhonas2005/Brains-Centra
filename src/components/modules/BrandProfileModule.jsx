"use client";
import React from 'react';

// Detailed data mapped directly from company profiles
const BRAND_DATA = {
  'finest-fit': {
    name: "The Finest Fit",
    image: "/logos/finest-fit-logo.png", // Added image path
    icon: "👕", // Kept as a fallback
    color: "from-blue-600 to-indigo-600",
    about: "The Finest Fit strives to deliver high-quality uniforms and establish ourselves as the best uniform company in the Philippines. We are a one-stop shop with over years of manufacturing experience.",
    highlights: [
      { title: "Customized Designing", desc: "Initial consultation to understand staff and business requirements." },
      { title: "Uniform Tailoring", desc: "Custom sizing, pattern fitting, and tailored alterations." },
      { title: "Fabrication & Print", desc: "Custom fabric production, embroidery, and logo printing." }
    ],
    offerings: [
      "Corporate Uniforms (Pilot, Security, Doorman)",
      "Chef Suits & Aprons",
      "Health Care Suits (Scrubs, Operation Gowns)",
      "Polo Shirts, T-Shirts, and Jackets",
      "Canvas Bags & Washable Facemasks"
    ]
  },
  'beauty-alley': {
    name: "The Beauty Alley",
    image: "/logos/beauty-alley-logo.png",
    icon: "💆‍♀️",
    color: "from-emerald-500 to-teal-600",
    about: "The Beauty Alley provides hassle-free health and beauty care from the comfort of your own home using top brands from Korea, Italy, and Switzerland. All drips are administered by a registered nurse with an active license.",
    highlights: [
      { title: "Strict Safety", desc: "All items undergo sterilization and staff wear full PPE before, during, and after sessions." },
      { title: "100% Transparency", desc: "We ensure authenticity by mixing the product right in front of the customer." },
      { title: "High-Quality Ingredients", desc: "Utilizing Glutathione, Lipotocin, Vitamin C, and Collagen for maximum efficacy." }
    ],
    offerings: [
      "The Korean Glass Skin Drip (Snow White Drip)",
      "The Korean Youthful Glowing Skin Drip (Cinderella Drip)",
      "The Luminous Drip (Miracle White with Melanin Inhibitor)",
      "Immune Booster Drip (Vitamin C, Zinc, B12)",
      "Ageless Power Drip & Slimming Skin Drip"
    ]
  },
  'green-oasis': {
    name: "The Green Oasis",
    image: "/logos/green-oasis-logo.png",
    icon: "🌿",
    color: "from-green-600 to-emerald-600",
    about: "The Green Oasis is a full-service landscaping company providing professional landscape and design specialists for homeowners, businesses, schools, and organizations.",
    highlights: [
      { title: "Design & Consultancy", desc: "Mapping out and designing land elements and features around homes and buildings." },
      { title: "Exterior & Interior", desc: "Hardscape and softscape installations, alongside biophilic greenery for building interiors." },
      { title: "Water Features", desc: "Grotto, waterfalls, fountains, and pool installations." }
    ],
    offerings: [
      "Landscape Irrigation Installation",
      "Garden Maintenance & Event Styling",
      "Vertical Gardens & Green Roof Systems",
      "Holiday & Christmas Decor Supply and Installation",
      "Outdoor Construction, Carpentry & Steel Works"
    ]
  },
  'luxurious-cleaning': {
    name: "Luxurious Cleaning Co.",
    image: "/logos/luxurious-logo.png",
    icon: "✨",
    color: "from-amber-500 to-yellow-600",
    about: "Luxurious Cleaning Co. stands out by offering hotel-like cleaning services with a simple and flexible 'per hour & per cleaner' booking system.",
    highlights: [
      { title: "German Equipment", desc: "Using modern cleaning vacuum and steaming machines straight from Germany to get rid of allergens and dust mites." },
      { title: "Environment & Pet Friendly", desc: "Zero chemicals or muriatic acid used. We clean effectively using purely water technology." },
      { title: "Trained Professionals", desc: "Cleaners undergo situational training and strict background checks, including NBI clearances." }
    ],
    offerings: [
      "Condominium, House, and Office Cleaning",
      "Post-Construction & Move-in/Move-out Cleaning",
      "Deep Dry Vacuum & Dry Steaming",
      "Upholstery & Mattress Shampooing",
      "Tile Grouting & Stain Removal"
    ]
  },
  'asap': {
    name: "ASAP! All Services App",
    image: "/logos/asap-logo.png",
    icon: "🚀",
    color: "from-red-600 to-rose-600",
    about: "Founded in 2020, ASAP! is a cross-platform mobile app that provides seamless, speedy, and hassle-free booking for everyday needs ranging from luxury services to necessary operations.",
    highlights: [
      { title: "Blue Collar Services", desc: "Book Aircon Repair, Drivers, House Cleaners, Massage Therapists, and Nurses instantly." },
      { title: "White Collar Services", desc: "Hire Accounting, IT, Lawyers, Marketing, Software Developers, and Virtual Assistants." },
      { title: "Employment Generation", desc: "Designed to present more job opportunities to the Filipino workforce and gather pools of merchants." }
    ],
    offerings: [
      "24/7 Fast Support System",
      "Cross-Platform Smart UX/UI",
      "Real-time Service Booking & Scheduling",
      "Merchant and Service Provider Partnerships"
    ]
  }
};

export function BrandProfileModule({ brandId, onBack, openInquiryModal }) {
  // Fallback if the brand data hasn't been fully mapped yet
  const data = BRAND_DATA[brandId] || {
    name: "Brand Profile in Development",
    icon: "🏗️",
    color: "from-indigo-600 to-blue-600",
    about: "Detailed portfolio information for this brand is currently being synchronized into Central Command.",
    highlights: [],
    offerings: []
  };

  return (
    <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
      
      {/* Navigation Header */}
      <div className="border-b border-indigo-800/50 pb-5 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="text-indigo-400 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <span>←</span> Back to Network
        </button>
        <button 
          onClick={() => openInquiryModal(`Partnership or Service Inquiry: ${data.name}`, 'Consultation')}
          className={`bg-gradient-to-r ${data.color} text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all active:scale-95`}
        >
          Connect with {data.name}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto connector-scrollbar pr-2 pb-8">
        
        {/* Hero Section */}
        <div className={`bg-gradient-to-br ${data.color} rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden mb-8`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* UPDATED: Renders the image if available, otherwise falls back to the emoji icon */}
            <div className="w-24 h-24 bg-[#090b14]/40 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-5xl shadow-inner flex-shrink-0 p-3 overflow-hidden">
              {data.image ? (
                <img src={data.image} alt={data.name} className="w-full h-full object-contain drop-shadow-md" />
              ) : (
                data.icon
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">{data.name}</h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
                {data.about}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Highlights / Operations */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 border-b border-indigo-800/50 pb-2">Core Operations & Features</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.highlights.map((item, idx) => (
                <div key={idx} className="bg-[#13172e]/60 border border-indigo-800/40 rounded-xl p-5 hover:border-indigo-500/50 transition-colors shadow-md">
                  <h5 className="text-sm font-bold text-white mb-2">{item.title}</h5>
                  <p className="text-xs text-indigo-200/80 leading-relaxed">{item.desc}</p>
                </div>
              ))}
              {data.highlights.length === 0 && (
                <div className="col-span-full p-8 text-center border border-dashed border-indigo-800/50 rounded-xl text-indigo-400/60 text-sm">
                  Service highlights pending synchronization.
                </div>
              )}
            </div>
          </div>

          {/* Product & Service List */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 border-b border-indigo-800/50 pb-2">Available Offerings</h4>
            <div className="bg-[#0b0e1b]/80 border border-indigo-800/40 rounded-xl p-5 shadow-lg h-full">
              <ul className="space-y-3">
                {data.offerings.map((offering, idx) => (
                  <li key={idx} className="flex items-start text-xs text-indigo-100 leading-relaxed">
                    <span className="text-fuchsia-500 mr-2 mt-0.5">✦</span> {offering}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}