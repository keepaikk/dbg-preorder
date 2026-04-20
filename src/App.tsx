/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  MessageCircle, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Smartphone, 
  Laptop, 
  Car, 
  TrendingDown,
  Star,
  Zap,
  HelpCircle,
  Menu,
  CreditCard,
  Loader2
} from "lucide-react";
import React, { useState, useEffect, ReactNode } from "react";

// --- Types ---
interface Product {
  id: string;
  name: string;
  category: 'laptop' | 'smartphone' | 'car';
  image: string;
  condition: string;
  originalPrice: string;
  preorderPrice: string;
  deposit: string;
  badge?: string;
  whatsappMsg?: string;
}

// --- Fallback Data ---
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Toyota Camry 2020 LE",
    category: "car",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop",
    condition: "UAE / US Used",
    originalPrice: "$18,500",
    preorderPrice: "$16,200",
    deposit: "$500",
    badge: "Most Popular"
  },
  {
    id: "2",
    name: "MacBook Pro M3 Max (14-inch)",
    category: "laptop",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&h=600&fit=crop",
    condition: "UK Used - Grade A",
    originalPrice: "$2,499",
    preorderPrice: "$2,150",
    deposit: "$100",
    badge: "Limited Slots"
  },
  {
    id: "3",
    name: "iPhone 15 Pro Max (256GB)",
    category: "smartphone",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600&fit=crop",
    condition: "US Used - Like New",
    originalPrice: "$1,199",
    preorderPrice: "$980",
    deposit: "$50",
    badge: "Flash Sale"
  }
];

const TESTIMONIALS = [
  {
    name: "Kofi Mensah",
    location: "Accra, Ghana",
    text: "I was skeptical at first, but my Toyota arrived exactly 18 days after my deposit. Saved almost $2,000 compared to local dealers!",
    rating: 5
  },
  {
    name: "Chidinma Okezie",
    location: "Lagos, Nigeria",
    text: "Excellent service. The MacBook I ordered looks brand new. The WhatsApp support team was with me every step of the way.",
    rating: 5
  },
  {
    name: "Abubakar S.",
    location: "Dubai, UAE",
    text: "Ordered a phone for my brother in Ghana. Fast delivery and zero stress. Highly recommended for diaspora buyers.",
    rating: 5
  }
];

const FAQS = [
  {
    q: "Is this legit?",
    a: "Absolutely. We are a registered business with over 500+ successful deliveries across Ghana and Nigeria. We provide trackable shipping IDs for every order."
  },
  {
    q: "How long does delivery take?",
    a: "Depending on your location and the item, shipping from UAE/USA takes between 7 to 21 business days."
  },
  {
    q: "What if the item is faulty?",
    a: "We offer a 30-day money-back guarantee for any functional defects. Every item is inspected by our UK/US team before shipping."
  },
  {
    q: "How do I pay?",
    a: "We accept Bank Transfers, Mobile Money (MoMo), and Crypto. Details are shared once you confirm your slot on WhatsApp."
  }
];

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
  <div className={`bg-white/[0.03] backdrop-blur-[16px] border border-white/10 rounded-3xl overflow-hidden shadow-2xl ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, className = "", variant = "emerald" }: { children: ReactNode, className?: string, variant?: "emerald" | "blue" | "purple" }) => {
  const variants = {
    emerald: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    blue: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    purple: "bg-purple-500/15 border-purple-500/30 text-purple-400"
  };
  
  return (
    <div className={`border px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const SectionTitle = ({ subtitle, title }: { subtitle: string, title: string }) => (
  <div className="text-center mb-16 px-4">
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="inline-block mb-4"
    >
      <Badge variant="blue">{subtitle}</Badge>
    </motion.div>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
    >
      {title}
    </motion.h2>
  </div>
);

// Updated WhatsAppLink component - uses direct chat link
const WhatsAppLink = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  const WHATSAPP_URL = "https://wa.me/message/6NH5AETQUU7TL1";
  
  return (
    <a 
      href={WHATSAPP_URL}
      target="_blank" 
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
};

// Product loading/error states
const ProductLoading = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-20">
    <Loader2 className="size-12 text-blue-400 animate-spin mb-4" />
    <p className="text-gray-400 font-medium">Loading featured deals...</p>
  </div>
);

const ProductError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20">
    <p className="text-red-400 font-medium mb-4">Failed to load products</p>
    <button 
      onClick={onRetry}
      className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-medium transition-colors"
    >
      Retry
    </button>
  </div>
);

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // API endpoint - local backend
  const API_URL = '/api/products';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(true);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchProducts();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchProducts();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 14, minutes: 32, seconds: 45 }; // Reset timer
      });
    }, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen text-gray-200 selection:bg-blue-500/30 font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 atmosphere-bg z-0" />
      
      {/* Background Blobs - Subtler for Atmospheric theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ x: [0, -80, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full"
        />
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/5 backdrop-blur-xl border-b border-white/10 py-4" : "py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-110">
              <Zap className="text-white fill-white size-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">DBG<span className="text-emerald-500">-DO</span>BUY<span className="text-emerald-500">GOODS</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium hover:text-white transition-colors">How it Works</a>
            <a href="#products" className="text-sm font-medium hover:text-white transition-colors">Preorder Deals</a>
            <a href="#trust" className="text-sm font-medium hover:text-white transition-colors">Trust & FAQ</a>
            <WhatsAppLink className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5">
              Contact Support
            </WhatsAppLink>
          </div>
          
          <button className="md:hidden text-white">
            <Menu className="size-6" />
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        
        {/* --- Hero Section --- */}
        <section className="px-6 mb-32 relative">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-6 cursor-default"
              >
                <Badge variant="emerald">Verified Supplier ✓</Badge>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[0.9] tracking-tighter mb-8"
              >
                Import Direct.<br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">Save Up to 30%.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-400 font-medium mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed"
              >
                Buy tech and vehicles from USA, UAE & UK at wholesale rates. Pay a small deposit now, get it delivered to your doorstep in 7-21 days.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              >
                <WhatsAppLink 
                  className="bg-whatsapp text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 group hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-whatsapp/20"
                >
                  <MessageCircle className="size-5" />
                  Chat on WhatsApp
                </WhatsAppLink>
                <a 
                  href="#products"
                  className="bg-white/5 border border-white/10 backdrop-blur-md px-8 py-4 rounded-2xl font-bold text-white flex items-center justify-center hover:bg-white/10 transition-all overflow-hidden relative group"
                >
                  <span className="relative z-10 flex items-center gap-2">View Weekly Slots <ArrowRight className="size-4" /></span>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-12 flex items-center gap-4 justify-center md:justify-start opacity-70"
              >
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="size-10 rounded-full border-2 border-[#050510] bg-gray-800 overflow-hidden shadow-xl">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="avatar" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-white font-bold block">Joined by 500+ buyers</span>
                  <span className="text-xs text-gray-500">Shipping from UAE, USA & UK daily</span>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="flex-1 w-full max-w-md md:max-w-none px-4"
            >
              <GlassCard className="relative p-2 h-full">
                <div className="relative aspect-[4/5] rounded-[22px] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=1000&fit=crop" 
                    alt="Luxury Car" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase rounded-lg">Featured Deal</div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="size-3 fill-yellow-400" />
                        <Star className="size-3 fill-yellow-400" />
                        <Star className="size-3 fill-yellow-400" />
                        <Star className="size-3 fill-yellow-400" />
                        <Star className="size-3 fill-yellow-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2">Foreign Used <br /> Mercedes S-Class</h3>
                    <p className="text-gray-300 text-sm mb-6">UAE Spec • Grade A • Verified History</p>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-gray-500 line-through text-xs">$65,000</span>
                        <span className="text-2xl font-black text-emerald-400">$58,200</span>
                      </div>
                      <WhatsAppLink 
                        className="flex-1 bg-white text-black py-4 rounded-xl font-bold text-sm text-center shadow-lg"
                      >
                        Reserve Now
                      </WhatsAppLink>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* --- Timer / Urgency --- */}
        <section className="mb-32 px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2">Next Export Cycle Ships In:</h3>
              <p className="text-gray-400">Complete your deposit before the timer ends to secure your shipping slot.</p>
            </div>
            <div className="flex gap-4">
              {[
                { label: 'HRS', val: timeLeft.hours },
                { label: 'MIN', val: timeLeft.minutes },
                { label: 'SEC', val: timeLeft.seconds }
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-inner">
                    {val.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 mt-2 tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- How It Works --- */}
        <section id="how-it-works" className="px-6 mb-32">
          <SectionTitle subtitle="Simple Process" title="Get Started in 3 Steps" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
                icon: Smartphone, 
                title: "Choose Product", 
                desc: "Browse our listed deals or send us a specific link from any US/UAE/UK store."
              },
              { 
                icon: CreditCard, 
                title: "Pay Small Deposit", 
                desc: "Secure your item with a small commitment fee ($50 - $500). We buy it for you immediately."
              },
              { 
                icon: Truck, 
                title: "Safe Delivery", 
                desc: "We handle clearing and shipping. Get your item delivered to your door in 7-21 days."
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-10 text-center flex flex-col items-center group hover:bg-white/[0.06] transition-all">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white mb-4">
                    {i + 1}
                  </div>
                  <h4 className="text-2xl font-extrabold text-white mb-4 tracking-tight">{step.title}</h4>
                  <p className="text-white/60 leading-relaxed font-medium">{step.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- Featured Products --- */}
        <section id="products" className="px-6 mb-32 bg-white/[0.02] py-32 border-y border-white/5">
          <SectionTitle subtitle="Premium Slots" title="This Week's Featured Deals" />
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              <ProductLoading />
            ) : error && products.length === 0 ? (
              <ProductError onRetry={fetchProducts} />
            ) : (
              products.map((prod, i) => (
                <motion.div 
                  key={prod.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="h-full flex flex-col group hover:shadow-blue-500/10 active:scale-[0.98] transition-all">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop";
                        }}
                      />
                      {prod.badge && (
                        <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
                          {prod.badge}
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <ShieldCheck className="size-3 text-emerald-400" /> Verified
                      </div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="blue" className="normal-case tracking-normal">{prod.condition}</Badge>
                        <span className="text-[10px] text-red-400 font-bold tracking-wider uppercase">Only 2 slots left</span>
                      </div>
                      
                      <h3 className="text-2xl font-extrabold text-white mb-6 leading-tight tracking-tight">{prod.name}</h3>
                      
                      <div className="flex items-baseline gap-3 mb-8">
                        <span className="text-3xl font-extrabold text-white tracking-tighter">{prod.preorderPrice}</span>
                        <span className="text-sm text-white/40 line-through font-bold">{prod.originalPrice}</span>
                        <span className="text-xs text-emerald-400 font-bold ml-auto">{prod.deposit} Deposit</span>
                      </div>
                      
                      <div className="mt-auto">
                        <WhatsAppLink 
                          className="w-full bg-white/[0.05] border border-white/10 hover:border-white/20 text-white py-3 rounded-xl font-bold text-sm text-center transition-all block"
                        >
                          Reserve via WhatsApp
                        </WhatsAppLink>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-16 text-center">
            <WhatsAppLink 
              className="inline-flex items-center gap-3 text-white/60 hover:text-white transition-colors py-4 px-8 border border-white/10 rounded-full bg-white/5 hover:bg-white/10"
            >
              <Smartphone className="size-4" />
              <span>Don't see what you need? <span className="font-bold underline">Get a custom quote</span></span>
            </WhatsAppLink>
          </div>
        </section>

        {/* --- Trust & Testimonials --- */}
        <section id="trust" className="px-6 mb-32">
          <SectionTitle subtitle="Community Verified" title="Trusted by 500+ Buyers" />
          
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-1/3 w-full space-y-6">
              {[
                { title: "500+", subtitle: "Deliveries in 2025" },
                { title: "24hrs", subtitle: "Avg Response Time" },
                { title: "100%", subtitle: "Secure Payments" }
              ].map((stat, i) => (
                <div key={i}>
                  <GlassCard className="p-8 flex items-center gap-6 group hover:translate-x-2 transition-transform">
                    <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-black text-xl">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div>
                      <div className="text-4xl font-black text-white">{stat.title}</div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.subtitle}</div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {TESTIMONIALS.map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="p-8 h-full flex flex-col bg-white/[0.03]">
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => <Star key={i} className="size-4 text-yellow-500 fill-yellow-500" />)}
                    </div>
                    <p className="text-gray-300 italic mb-8 flex-1 font-medium leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500" />
                      <div>
                        <div className="text-white font-bold">{t.name}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.location}</div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Why Choose Us --- */}
        <section className="px-6 mb-32">
          <SectionTitle subtitle="Our Advantage" title="Why Smart Shoppers Use Us" />
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-10">
            {[
              { icon: TrendingDown, title: "Lower Market Prices", desc: "Save up to 40% by preordering directly from foreign auctions and warehouses." },
              { icon: ShieldCheck, title: "Verified Sourcing", desc: "No salvage or accident items. We only ship Grade A, clean title tech and cars." },
              { icon: CreditCard, title: "Flexible Deposits", desc: "Stop saving for months. Lock in today's price with a small deposit and pay balance on arrival." },
              { icon: Zap, title: "Flash Shipping", desc: "Consolidated weekly containers from Dubai and USA ensure the fastest delivery timelines." }
            ].map((f, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="flex-shrink-0 size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <f.icon className="size-6" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white mb-2 italic tracking-tight">{f.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- FAQ --- */}
        <section className="px-6 mb-48">
          <SectionTitle subtitle="Got Questions?" title="Frequently Asked" />
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 text-white font-bold hover:bg-white/5 transition-colors">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="size-5 text-blue-400" />
                    {faq.q}
                  </span>
                  <div className="text-gray-500 transition-transform group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </div>
                </summary>
                <div className="p-6 pt-0 text-gray-400 text-sm font-medium leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section className="px-6 pb-32">
          <div className="max-w-6xl mx-auto overflow-hidden rounded-[50px] relative">
            <div className="absolute inset-0 bg-blue-600 z-0">
               <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=600&fit=crop&blur=5" className="w-full h-full object-cover opacity-30 mix-blend-overlay" alt="BG" />
            </div>
            <div className="relative z-10 p-12 md:p-24 text-center flex flex-col items-center">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 max-w-3xl tracking-tighter leading-[0.9]"
              >
                READY TO SECURE <br /> THE BEST PRICE?
              </motion.h2>
              <p className="text-white/80 text-xl mb-12 max-w-xl font-medium">
                Our team is online now. Ask for a payment link or a custom quote in seconds.
              </p>
              <WhatsAppLink 
                className="inline-flex items-center gap-3 bg-whatsapp text-white px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-whatsapp/30"
              >
                <MessageCircle className="size-6" />
                Secure My Slot Now
              </WhatsAppLink>
              
              <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-60 grayscale brightness-200">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Mobile_Payment_Logo.svg" alt="MoMo" className="h-8" />
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 px-6 relative z-10 bg-black/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 opacity-60">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-emerald-500 fill-emerald-500 size-6" />
              <span className="text-2xl font-black tracking-tighter text-white">DBG-DOBUYGOODS</span>
            </div>
            <p className="max-w-xs font-medium leading-relaxed">
              Premium preorder service connecting Africa to the world's best tech and motor hubs. Fast, secure, and affordable.
            </p>
          </div>
          <div>
            <h5 className="text-white font-black uppercase text-xs tracking-widest mb-6">Market</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li>Ghana (Accra, Kumasi)</li>
              <li>Nigeria (Lagos, Abuja)</li>
              <li>UAE Exports</li>
              <li>USA Exports</li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-black uppercase text-xs tracking-widest mb-6">Support</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li><WhatsAppLink>Track Order</WhatsAppLink></li>
              <li>Terms of Service</li>
              <li>Refund Policy</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">© 2026 DBG-dobuygoods Ltd.</p>
          <div className="flex gap-6 text-gray-500">
            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:text-white transition-colors cursor-pointer"><Smartphone className="size-4" /></div>
            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:text-white transition-colors cursor-pointer"><Laptop className="size-4" /></div>
            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:text-white transition-colors cursor-pointer"><Car className="size-4" /></div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <WhatsAppLink className="fixed bottom-8 right-8 z-[100] group">
        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform" />
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10"
          >
            <MessageCircle className="text-[#050510] size-8" />
            <div className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full border-2 border-[#050510] flex items-center justify-center">
              <span className="text-[10px] font-black text-white">1</span>
            </div>
          </motion.div>
        </div>
        <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 pointer-events-none shadow-xl">
          Chat With Us Now! ⚡️
        </div>
      </WhatsAppLink>
    </div>
  );
}