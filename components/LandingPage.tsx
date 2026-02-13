import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Zap, MapPin, Smartphone, BookOpen, Headphones, 
  X, Mail, Lock, User, Menu, ShieldCheck, MessageCircle, Recycle, Users 
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        onLaunch();
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0f0f11] text-white overflow-hidden font-sans flex flex-col selection:bg-electric-blue selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-electric-blue/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* --- Section 1: Navigation Bar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 bg-[#0f0f11]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white text-lg">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Swappr</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {['How it Works', 'Browse Items', 'Campus Rules'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-electric-blue transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setAuthMode('login')} 
              className="text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Login
            </button>
            <button 
              onClick={() => setAuthMode('signup')} 
              className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
            >
              Join Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#0f0f11] border-b border-white/10 overflow-hidden"
            >
              <div className="p-6 flex flex-col gap-4">
                {['How it Works', 'Browse Items', 'Campus Rules'].map((item) => (
                  <a key={item} href="#" className="text-lg font-medium text-gray-300 hover:text-white">
                    {item}
                  </a>
                ))}
                <div className="h-px bg-white/10 my-2" />
                <button onClick={() => setAuthMode('login')} className="text-left text-lg font-medium text-gray-300">Login</button>
                <button onClick={() => setAuthMode('signup')} className="text-left text-lg font-bold text-electric-blue">Join Now</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative w-full overflow-hidden pt-20">
        
        {/* --- Section 2: Hero Section --- */}
        <section className="relative w-full max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12 md:gap-20">
          
          <div className="flex-1 text-center md:text-left z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-electric-blue mb-6 backdrop-blur-md"
            >
              <Zap size={12} className="fill-current" />
              <span>LIVE AT YOUR CAMPUS</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              Trade What You Have. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-cyan-400 to-purple-500">
                Get What You Need.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-400 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed"
            >
              The exclusive peer-to-peer exchange for <span className="text-white font-semibold">Your College</span> students. Safe, sustainable, and 100% free.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <button 
                onClick={() => setAuthMode('signup')}
                className="px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_-10px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 group"
              >
                Begin Your First Swap
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* 3D-style Phone Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1.5, bounce: 0.4 }}
            className="flex-1 relative z-10 w-full max-w-[400px]"
          >
            <div className="relative w-72 mx-auto aspect-[9/19] bg-[#18181b] rounded-[3rem] border-8 border-[#27272a] shadow-2xl overflow-hidden outline outline-4 outline-black/20">
                {/* Simulated Screen */}
                <div className="absolute inset-0 bg-[#0f0f11] flex flex-col p-4">
                   {/* Header */}
                   <div className="flex justify-between items-center mb-6 pt-8">
                     <div className="w-8 h-8 rounded-full bg-white/10" />
                     <div className="w-20 h-4 rounded-full bg-white/10" />
                   </div>
                   {/* Card Stack */}
                   <div className="flex-1 relative">
                      <div className="absolute top-0 inset-x-0 aspest-[3/4] bg-white rounded-3xl p-4 text-black transform rotate-6 scale-95 opacity-50 translate-y-4"></div>
                      <div className="absolute top-0 inset-x-0 aspest-[3/4] bg-white rounded-3xl p-4 text-black transform -rotate-3 scale-95 opacity-70 translate-y-2"></div>
                      <div className="relative bg-gradient-to-br from-electric-blue to-purple-600 rounded-3xl p-5 text-white shadow-xl h-80 flex flex-col justify-end">
                         <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">New</div>
                         <h3 className="text-2xl font-bold mb-1">Graph Calc</h3>
                         <p className="opacity-80 text-sm mb-4">Looking for: Textbooks</p>
                         <div className="flex gap-2">
                             <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                <X size={20} />
                             </div>
                             <div className="h-10 flex-1 rounded-full bg-white text-black font-bold flex items-center justify-center text-sm shadow-lg">
                                Send Offer
                             </div>
                         </div>
                      </div>
                   </div>
                   {/* Chat Preview */}
                   <div className="mt-4 p-3 rounded-2xl bg-white/5 backdrop-blur border border-white/5 flex gap-3 items-center">
                     <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                       <MessageCircle size={18} className="text-green-500" />
                     </div>
                     <div>
                       <div className="text-xs font-bold text-gray-300">New Message</div>
                       <div className="text-[10px] text-gray-500">Hey! Is the calc still available?</div>
                     </div>
                   </div>
                </div>
            </div>
            
            {/* Floating Elements around phone */}
            <motion.div 
               animate={{ y: [0, -20, 0] }} 
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-[20%] -right-10 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl"
            >
               <BookOpen className="text-electric-blue" />
            </motion.div>
            <motion.div 
               animate={{ y: [0, 20, 0] }} 
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-[20%] -left-10 w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl"
            >
               <Headphones className="text-purple-400" />
            </motion.div>
          </motion.div>

        </section>

        {/* --- Section 3: Bento Feature Grid --- */}
        <section className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
            <div className="mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Swappr?</h2>
                <p className="text-gray-400 max-w-2xl text-lg">Built specifically for the unique needs of campus life. Safe, fast, and community-driven.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
                {/* Card 1: Verified Students */}
                <motion.div 
                   viewport={{ once: true }}
                   whileHover={{ scale: 1.02 }}
                   className="md:col-span-2 row-span-1 bg-[#18181b] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-electric-blue/10 rounded-full blur-[80px] group-hover:bg-electric-blue/20 transition-colors duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Verified Students Only</h3>
                            <p className="text-gray-400">We require a valid .edu email used by your college. No strangers, just classmates.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Card 2: Instant Chat */}
                <motion.div 
                   viewport={{ once: true }}
                   whileHover={{ scale: 1.02 }}
                   className="md:col-span-1 row-span-1 bg-[#18181b] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                >
                     <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[40px] group-hover:bg-purple-600/20 transition-colors duration-500" />
                     <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Instant In-App Chat</h3>
                            <p className="text-gray-400 text-sm">Real-time negotiation powered by AI helper.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Card 3: Zero Waste */}
                <motion.div 
                   viewport={{ once: true }}
                   whileHover={{ scale: 1.02 }}
                   className="md:col-span-1 row-span-1 bg-[#18181b] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-[40px] group-hover:bg-green-500/20 transition-colors duration-500" />
                     <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
                            <Recycle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Zero Waste</h3>
                            <p className="text-gray-400 text-sm">Keep items moving within the campus ecosystem.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Card 4: Face-to-Face Swaps */}
                <motion.div 
                   viewport={{ once: true }}
                   whileHover={{ scale: 1.02 }}
                   className="md:col-span-2 row-span-1 bg-[#18181b] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                >
                    <div className="absolute bottom-[-20%] left-[10%] w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] group-hover:bg-orange-500/20 transition-colors duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Face-to-Face Swaps</h3>
                            <p className="text-gray-400">Skip the shipping fees. Meet up safely at campus landmarks like the Library or Student Center.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* --- Section 4: Live Marketplace Preview --- */}
        <section className="w-full py-20 overflow-hidden">
             <div className="max-w-7xl mx-auto px-6 mb-10 flex justify-between items-end">
                <div>
                   <h2 className="text-3xl font-bold mb-2">Recent Listings</h2>
                   <p className="text-gray-400">See what's being swapped right now.</p>
                </div>
                <div className="hidden md:flex gap-2">
                   <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer">
                      <ArrowRight className="rotate-180" size={20} />
                   </div>
                   <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer">
                      <ArrowRight size={20} />
                   </div>
                </div>
             </div>

             {/* Scrolling Row */}
             <div className="flex gap-6 overflow-x-auto pb-8 px-6 no-scrollbar snap-x snap-mandatory">
                 {[
                   { title: "Eng. Graphics Set", seeking: "Lab Coat", img: "bg-blue-900" },
                   { title: "Sony XM4 Headphones", seeking: "iPad + Cash", img: "bg-gray-800" },
                   { title: "Python TextBook", seeking: "Coffee Voucher", img: "bg-yellow-900" },
                   { title: "Dorm Mini-Fridge", seeking: "Microwave", img: "bg-red-900" },
                   { title: "Scientific Calc", seeking: "Nothing (Free)", img: "bg-green-900" },
                 ].map((item, i) => (
                    <motion.div 
                       key={i}
                       viewport={{ once: true }}
                       initial={{ opacity: 0, x: 50 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="min-w-[280px] md:min-w-[320px] snap-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-electric-blue/50 transition duration-300 group"
                    >
                        <div className={`h-48 w-full ${item.img} relative`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent opacity-80" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="text-xs font-bold text-white/60 mb-1">LOOKING FOR</div>
                                <div className="text-sm font-semibold text-white truncate">{item.seeking}</div>
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-xl font-bold mb-4 truncate">{item.title}</h3>
                            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white hover:text-black transition flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)]">
                               Swap Now
                            </button>
                        </div>
                    </motion.div>
                 ))}
             </div>
        </section>

        {/* --- Section 5: The "Begin" Experience (Footer) --- */}
        <section className="w-full relative py-32 bg-black border-t border-white/10 flex flex-col items-center justify-center text-center px-6">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-electric-blue/20 via-black to-black opacity-50" />
             
             <div className="relative z-10 max-w-3xl mx-auto">
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
                    Ready to declutter<br/>your dorm?
                 </h2>
                 <p className="text-xl text-gray-400 mb-10">Join 2,000+ students on Swappr today.</p>
                 <button 
                    onClick={() => setAuthMode('signup')}
                    className="px-12 py-5 bg-white text-black text-xl font-bold rounded-full hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.5)] transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                 >
                    Join Now — It's Free
                    <ArrowRight size={24} />
                 </button>
             </div>

             <footer className="absolute bottom-8 text-xs text-gray-700">
                &copy; 2025 Swappr Inc. • Campus Marketplace • Privacy Policy
             </footer>
        </section>

      </main>

      {/* Auth Modal (Preserved from original) */}
      <AnimatePresence>
        {authMode !== 'none' && (
            <motion.div
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="w-full max-w-md bg-[#18181b] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
                >
                    <button 
                        onClick={() => setAuthMode('none')} 
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition"
                    >
                        <X size={20}/>
                    </button>
                    
                    <div className="mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-blue to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            <Zap size={20} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-white">{authMode === 'login' ? 'Welcome Back' : 'Join Swappr'}</h2>
                        <p className="text-gray-400 text-sm">{authMode === 'login' ? 'Enter your details to access your account.' : 'Start swapping safely with students near you.'}</p>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
                        {authMode === 'signup' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-electric-blue focus:ring-1 focus:ring-electric-blue focus:outline-none transition placeholder-gray-600" placeholder="John Doe" />
                                </div>
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">College Email (.edu)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                <input required type="email" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-electric-blue focus:ring-1 focus:ring-electric-blue focus:outline-none transition placeholder-gray-600" placeholder="you@college.edu" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                <input required type="password" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-electric-blue focus:ring-1 focus:ring-electric-blue focus:outline-none transition placeholder-gray-600" placeholder="••••••••" />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-electric-blue hover:bg-blue-600 text-white font-bold py-4 rounded-xl mt-6 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : (
                                <>{authMode === 'login' ? 'Log In' : 'Create Account'} <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
                            className="text-electric-blue font-bold hover:underline"
                        >
                            {authMode === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;