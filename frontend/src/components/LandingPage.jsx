import React from 'react';
import { Globe, TrendingUp, Zap, Target, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import ProductCard from './ui/ProductCard';
import ScoringBar from './ui/ScoringBar';

const LandingPage = ({ onLogin }) => {
  const handleStart = () => {
    onLogin();
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)] selection:bg-[var(--color-purple-500)] selection:text-white">
      
      {/* Navigation - inline desktop, hidden mobile (assumed App.jsx handles main nav, but this is landing specific header if needed) */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center z-10 relative">
        <div className="font-playfair text-2xl font-bold tracking-tight">
          Swipe<span className="text-[var(--color-purple-500)]">to</span>Export
        </div>
        <div className="hidden md:flex gap-8 font-medium text-sm items-center">
          <a href="#how-it-works" className="hover:text-[var(--color-purple-500)] transition-colors">How it works</a>
          <a href="#algorithm" className="hover:text-[var(--color-purple-500)] transition-colors">The Algorithm</a>
          <a href="#features" className="hover:text-[var(--color-purple-500)] transition-colors">Features</a>
          <Button onClick={handleStart} className="!py-2.5 !px-6 text-sm">Start Matchmaking</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-12 pb-24 md:pt-24 md:pb-32 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] bg-[var(--color-purple-400)] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] bg-[var(--color-gold)] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>

        <div className="flex-1 z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1.5 px-3 rounded-full border border-[var(--color-ink)]/20 text-xs font-bold tracking-wider uppercase mb-6 text-[var(--color-ink)]/70">
              Global Trade, Reimagined
            </span>
            <h1 className="font-playfair text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-[var(--color-ink)]">
              Find global <span className="text-[var(--color-purple-500)] italic">buyers</span> with a single swipe.
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-ink)]/70 mb-10 max-w-xl font-medium leading-relaxed">
              Intelligent trade matchmaking powered by predictive analytics. Swipe through high-compatibility international partners and expand your market reach effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleStart} className="w-full sm:w-auto">
                Start Swiping Now
              </Button>
              <button 
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-medium text-lg border border-[var(--color-ink)]/20 hover:border-[var(--color-ink)] transition-colors flex items-center justify-center gap-2"
              >
                See how it works
              </button>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 w-full max-w-md relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full aspect-[4/5] outline-card bg-white p-6 relative flex flex-col justify-between overflow-visible"
          >
            <div className="w-full h-3/5 bg-gray-100 rounded-xl mb-6 relative overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800" alt="Global shipping container" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-lg">Acme Corp</p>
                <p className="text-sm opacity-80">Hamburg, Germany</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-playfair text-3xl font-bold">Industrial Machinery</h3>
                  <p className="text-sm text-gray-500 font-medium">Seeking continuous supply</p>
                </div>
                <div className="w-14 h-14 rounded-full border-2 border-[var(--color-gold)] flex items-center justify-center font-bold text-xl text-[var(--color-gold)] bg-[var(--color-gold)]/10">
                  92%
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-xl">✗</button>
                <button className="flex-1 py-3 rounded-xl border-2 border-[var(--color-green-400)] bg-[var(--color-green-400)]/10 text-[var(--color-green-400)] hover:bg-[var(--color-green-400)] hover:text-white transition-all font-bold text-xl">♥</button>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -right-6 top-1/4 glass p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-10 h-10 rounded-full bg-[var(--color-purple-500)] flex items-center justify-center text-white">
                <Target size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Match Found</p>
                <p className="font-bold text-sm">High Compatibility</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Flow */}
      <section id="how-it-works" className="w-full bg-[#FAF9F6] text-[var(--color-ink)] py-24 px-6 rounded-[2.5rem] md:rounded-[4rem] max-w-[96%] mx-auto my-12 border border-[var(--color-ink)]/5 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 text-[var(--color-ink)]">The Matchmaking Flow</h2>
            <p className="text-[var(--color-ink)]/70 max-w-2xl mx-auto text-lg font-medium">Three simple steps to connect with verified global buyers tailored to your specific export capabilities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[40%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-ink)]/10 to-transparent -translate-y-1/2"></div>
            
            {[
              { step: '01', title: 'Define Criteria', desc: 'Tell us what you export and your target capacity. Our AI builds your unique profile.', image: '/criteria_icon.png' },
              { step: '02', title: 'Swipe to Connect', desc: 'Review curated matches. Swipe right on buyers that fit your business model perfectly.', image: '/connect_icon.png' },
              { step: '03', title: 'Automated Outreach', desc: 'We generate personalized introductory pitches based on your mutual compatibility points.', image: '/outreach_icon.png' }
            ].map((item, i) => (
              <div key={i} className="relative z-10 bg-white border border-[var(--color-ink)]/10 p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform duration-300 shadow-md">
                <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 overflow-hidden bg-[#FAF9F6] shadow-inner p-1 border border-[var(--color-ink)]/5">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-full mix-blend-multiply" />
                </div>
                <div className="font-playfair text-5xl font-bold text-[var(--color-ink)]/5 absolute top-4 right-6">{item.step}</div>
                <h3 className="text-2xl font-bold mb-4 font-playfair text-[var(--color-ink)]">{item.title}</h3>
                <p className="text-[var(--color-ink)]/70 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm Visualization Section */}
      <section id="algorithm" className="w-full max-w-7xl mx-auto py-24 px-6 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 w-full">
          <h2 className="font-playfair text-4xl md:text-6xl font-bold mb-6">Explainable <br/><span className="text-[var(--color-purple-500)] italic">Intelligence</span></h2>
          <p className="text-lg text-[var(--color-ink)]/70 mb-8 max-w-md leading-relaxed">
            We don't just give you a score. We break down exactly why a buyer is a strong match for your export business using five critical data points.
          </p>
          <ul className="space-y-4 mb-8">
            {[
              'Proprietary predictive modeling',
              'Real-time global trade data',
              'Behavioral buyer analytics'
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 font-medium">
                <div className="w-6 h-6 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]"></div>
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 w-full relative">
          {/* Decorative background for the scoring bar */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-purple-500)]/5 to-[var(--color-pink-400)]/5 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
          <ScoringBar totalScore={92} />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full bg-[#f4f1ea] py-24 px-6 border-y border-[var(--color-ink)]/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold max-w-lg">Everything you need to scale globally.</h2>
            <Button onClick={handleStart} className="!bg-transparent !text-[var(--color-ink)] border border-[var(--color-ink)] hover:!text-[var(--color-cream)] hover:!border-transparent hover:!bg-[var(--color-ink)]">
              View All Features
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard 
              title="Smart Dashboards" 
              subtitle="Track your swipe history and pipeline"
              className="bg-white"
            >
              <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed">Our XAI dashboard provides complete transparency into your matchmaking history, allowing you to refine your strategy based on past success.</p>
            </ProductCard>
            
            <ProductCard 
              title="Market Trends" 
              subtitle="Real-time growth analytics"
              className="bg-[var(--color-purple-500)]/5 border-[var(--color-purple-500)]/20"
            >
              <div className="mt-4 p-4 bg-white/50 rounded-xl border border-[var(--color-ink)]/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">EU Tech Imports</span>
                  <span className="text-[var(--color-green-400)] font-bold flex items-center gap-1"><TrendingUp size={14}/> +12.4%</span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full"><div className="w-3/4 h-full bg-[var(--color-purple-500)] rounded-full"></div></div>
              </div>
            </ProductCard>

            <ProductCard 
              title="Drafted Outreach" 
              subtitle="AI-generated intro emails"
              className="bg-white md:col-span-2 lg:col-span-1"
            >
              <p className="text-sm text-[var(--color-ink)]/70 leading-relaxed">Once matched, our system drafts hyper-personalized outreach emails highlighting your specific points of compatibility to increase response rates.</p>
            </ProductCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-5xl mx-auto py-32 px-6 text-center">
        <h2 className="font-playfair text-5xl md:text-7xl font-bold mb-8">Ready to find your <br/><span className="italic text-[var(--color-gold)]">next big market?</span></h2>
        <p className="text-xl text-[var(--color-ink)]/70 mb-10 max-w-2xl mx-auto">Join thousands of global exporters who are using Swipe to Export to build international partnerships faster than ever before.</p>
        <Button onClick={handleStart} className="!text-xl !px-12 !py-6">
          Start Matching Free
        </Button>
      </section>

      <footer className="w-full border-t border-[var(--color-ink)]/10 py-12 px-6 text-center text-sm font-medium text-[var(--color-ink)]/50">
        <div className="font-playfair text-2xl font-bold text-[var(--color-ink)] mb-4">Swipe<span className="text-[var(--color-purple-500)]">to</span>Export</div>
        <p>© 2026 Swipe to Export. Premium Trade Matchmaking.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
