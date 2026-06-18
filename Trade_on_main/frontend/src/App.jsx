import { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, LayoutDashboard, Search, BrainCircuit, Home, MessageSquare } from 'lucide-react';
import LandingPage from './components/LandingPage';
import SwipeCard from './components/SwipeCard';
import XAIDashboard from './components/XAIDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ProfileSettings from './components/ProfileSettings';
import DecisionPanel from './components/DecisionPanel';
import SkipFeedback from './components/SkipFeedback';
import AuthModal from './components/AuthModal';
import OutreachDashboard from './components/OutreachDashboard';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [view, setView] = useState(() => localStorage.getItem('swipe_view') || 'landing'); // 'landing', 'setup', 'swipe', 'dashboard', 'analytics', 'messages'
  const [metadata, setMetadata] = useState({ countries: [], commodities: [] });
  const [formData, setFormData] = useState({ country: '', commodity: '', flow: 'Export' });
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showCountries, setShowCountries] = useState(false);
  const [showCommodities, setShowCommodities] = useState(false);
  const [aiRanking, setAiRanking] = useState('');
  const [rankingLoading, setRankingLoading] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem('username') || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showSkipFeedback, setShowSkipFeedback] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('swipe_view', view);
  }, [view]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('username', user);
    } else {
      localStorage.removeItem('username');
    }
  }, [user]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/metadata')
      .then(res => setMetadata(res.data))
      .catch(err => console.error(err));
  }, []);

  const startMatchmaking = async () => {
    if (!formData.country || !formData.commodity) return;
    setLoading(true);
    try {
      // Save onboarding data to DB
      await axios.post('http://localhost:5001/api/onboarding', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const res = await axios.post('http://localhost:5001/api/match', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(res.data);
      setCurrentIndex(0);
      setView('swipe');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= recommendations.length) return;
    const currentRec = recommendations[currentIndex];

    // Advance index immediately for snappy UI
    setCurrentIndex(prev => prev + 1);

    if (direction === 'right') {
      setSelectedLead(currentRec);
      setShowSkipFeedback(false);
    } else if (direction === 'left') {
      setShowSkipFeedback(true);
      setSelectedLead(null);
    }

    try {
      await axios.post('http://localhost:5001/api/swipe', {
        user_country: formData.country,
        target_country: currentRec.target_country,
        commodity: formData.commodity,
        flow: formData.flow,
        score: currentRec.score,
        status: direction === 'right' ? 'liked' : 'disliked'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getAiHelp = async () => {
    if (!formData.commodity) return;
    setRankingLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/rank', {
        commodity: formData.commodity,
        flow: formData.flow
      });
      setAiRanking(res.data.ranking);
    } catch (err) {
      console.error(err);
      setAiRanking("Error fetching AI ranking. The AI quota might be exceeded.");
    }
    setRankingLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[var(--color-cream)] text-[var(--color-ink)]">
      {view !== 'landing' && (
        <nav className="w-full glass p-4 flex justify-between items-center sticky top-0 z-50 border-b border-[var(--color-ink)]/10">
          <h1
            className="text-2xl font-bold font-playfair text-[var(--color-ink)] flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setView('landing')}
            title="Go to Landing Page"
          >
            <RefreshCw className="text-[var(--color-purple-500)]" /> Swipe<span className="text-[var(--color-purple-500)]">to</span>Export
          </h1>
          <div className="flex gap-4 items-center">
            <button onClick={() => setView('landing')} className="transition-colors text-[var(--color-ink)]/50 hover:text-[var(--color-ink)]" title="Home">
              <Home size={24} />
            </button>
            <button onClick={() => setView('setup')} className={`transition-colors ${view === 'setup' ? 'text-[var(--color-purple-500)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-purple-500)]'}`} title="Find Partners">
              <Search size={24} />
            </button>
            {recommendations.length > 0 && (
              <button onClick={() => setView('swipe')} className={`transition-colors ${view === 'swipe' ? 'text-[var(--color-purple-500)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-purple-500)]'}`} title="Active Matches">
                <BrainCircuit size={24} />
              </button>
            )}
            <button onClick={() => setView('dashboard')} className={`transition-colors ${view === 'dashboard' ? 'text-[var(--color-pink-400)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-pink-400)]'}`} title="Portfolio">
              <LayoutDashboard size={24} />
            </button>
            {user ? (
              <>
                <button onClick={() => setView('messages')} className={`transition-colors ${view === 'messages' ? 'text-[var(--color-purple-500)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-purple-500)]'}`} title="Message Hub">
                  <MessageSquare size={24} />
                </button>
                <button onClick={() => setView('analytics')} className={`transition-colors ${view === 'analytics' ? 'text-[var(--color-gold)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-gold)]'}`} title="Analytics">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </button>
                <button onClick={() => setView('settings')} className={`transition-colors ${view === 'settings' ? 'text-[var(--color-green-400)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-green-400)]'}`} title="Settings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-[var(--color-purple-500)] text-white px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Login
              </button>
            )}
          </div>
        </nav>
      )}

      <main className={`flex-1 w-full flex flex-col items-center justify-center ${view === 'landing' ? '' : 'max-w-6xl p-6'}`}>
        {view === 'landing' && (
          <LandingPage
            onLogin={() => {
              if (token) {
                setView('setup');
              } else {
                setShowAuthModal(true);
              }
            }}
          />
        )}

        {view === 'setup' && (
          <div className="glass p-8 rounded-3xl w-full max-w-md animate-fade-in card-shadow relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
              <div
                className="h-full bg-[#8B5A2B] transition-all duration-500 ease-out"
                style={{ width: `${(onboardingStep / 3) * 100}%` }}
              ></div>
            </div>

            <div className="mb-6 text-center mt-2">
              <p className="text-sm font-bold text-[#8B5A2B] uppercase tracking-wider mb-1">Step {onboardingStep} of 3</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {onboardingStep === 1 && 'Where are you based?'}
                {onboardingStep === 2 && 'What do you trade?'}
                {onboardingStep === 3 && 'Your Objectives'}
              </h2>
            </div>

            <div className="space-y-5">
              {onboardingStep === 1 && (
                <div className="animate-fade-in relative z-20">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Select your operating country</label>
                  <input
                    type="text"
                    placeholder="Type or select country"
                    className="w-full p-4 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 focus:border-[#8B5A2B] focus:ring-1 focus:ring-[#8B5A2B] outline-none transition-all shadow-sm text-lg"
                    value={formData.country}
                    onChange={e => {
                      setFormData({ ...formData, country: e.target.value });
                      setShowCountries(true);
                    }}
                    onFocus={() => setShowCountries(true)}
                    onBlur={() => setTimeout(() => setShowCountries(false), 200)}
                  />
                  {showCountries && (
                    <div className="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-56 overflow-y-auto">
                      {metadata.countries
                        .filter(c => c.toLowerCase().includes(formData.country.toLowerCase()))
                        .map(c => (
                          <div
                            key={c}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 font-medium border-b border-gray-50 last:border-0 transition-colors"
                            onClick={() => {
                              setFormData({ ...formData, country: c });
                              setShowCountries(false);
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      {metadata.countries.filter(c => c.toLowerCase().includes(formData.country.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-gray-400 italic">No countries found</div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setOnboardingStep(2)}
                    disabled={!formData.country}
                    className="w-full mt-8 py-4 rounded-xl bg-[#1A1A1A] text-white font-semibold hover:bg-black disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    Continue
                  </button>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="animate-fade-in relative z-10">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Select the commodity you deal in</label>
                  <input
                    type="text"
                    placeholder="Type or select commodity"
                    className="w-full p-4 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 focus:border-[#8B5A2B] focus:ring-1 focus:ring-[#8B5A2B] outline-none transition-all shadow-sm text-lg"
                    value={formData.commodity}
                    onChange={e => {
                      setFormData({ ...formData, commodity: e.target.value });
                      setShowCommodities(true);
                    }}
                    onFocus={() => setShowCommodities(true)}
                    onBlur={() => setTimeout(() => setShowCommodities(false), 200)}
                  />
                  {showCommodities && (
                    <div className="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-56 overflow-y-auto">
                      {metadata.commodities
                        .filter(c => c.toLowerCase().includes(formData.commodity.toLowerCase()))
                        .map(c => (
                          <div
                            key={c}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 font-medium border-b border-gray-50 last:border-0 transition-colors"
                            onClick={() => {
                              setFormData({ ...formData, commodity: c });
                              setShowCommodities(false);
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      {metadata.commodities.filter(c => c.toLowerCase().includes(formData.commodity.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-gray-400 italic">No commodities found</div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => setOnboardingStep(1)}
                      className="py-4 px-6 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setOnboardingStep(3)}
                      disabled={!formData.commodity}
                      className="flex-1 py-4 rounded-xl bg-[#1A1A1A] text-white font-semibold hover:bg-black disabled:opacity-50 transition-all shadow-md"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Are you looking to Export or Import?</label>
                  <div className="flex gap-3">
                    <button
                      className={`flex-1 py-4 rounded-xl font-bold transition-all border-2 ${formData.flow === 'Export' ? 'bg-[#8B5A2B]/10 text-[#8B5A2B] border-[#8B5A2B]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                      onClick={() => { setFormData({ ...formData, flow: 'Export' }); setAiRanking(''); }}
                    >
                      Export
                    </button>
                    <button
                      className={`flex-1 py-4 rounded-xl font-bold transition-all border-2 ${formData.flow === 'Import' ? 'bg-[#4A7C59]/10 text-[#4A7C59] border-[#4A7C59]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                      onClick={() => { setFormData({ ...formData, flow: 'Import' }); setAiRanking(''); }}
                    >
                      Import
                    </button>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={getAiHelp}
                      disabled={rankingLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4A7C59]/5 text-[#4A7C59] font-semibold hover:bg-[#4A7C59]/10 transition-colors border border-[#4A7C59]/20"
                    >
                      <BrainCircuit size={18} />
                      {rankingLoading ? 'Analyzing Market...' : 'Need AI Help Deciding?'}
                    </button>

                    {aiRanking && (
                      <div className="mt-4 p-5 bg-[#4A7C59]/5 rounded-2xl border border-[#4A7C59]/10 text-sm text-gray-700 leading-relaxed shadow-sm">
                        <p className="font-bold text-[#4A7C59] mb-2 uppercase text-xs tracking-wider flex items-center gap-1.5">
                          <BrainCircuit size={14} /> AI Market Analysis
                        </p>
                        {aiRanking}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => setOnboardingStep(2)}
                      className="py-4 px-6 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={startMatchmaking}
                      disabled={loading || !formData.country || !formData.commodity}
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#1A1A1A] to-black text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                      {loading ? 'Finding Partners...' : 'Start Matchmaking'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'swipe' && (
          <div className="w-full max-w-lg h-[650px] flex items-center justify-center relative p-12">
            <div className="absolute inset-0 bg-[#F2EDE4] rounded-[4rem] border border-white/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]"></div>
            {currentIndex < recommendations.length ? (
              <SwipeCard
                key={currentIndex}
                recommendation={recommendations[currentIndex]}
                onSwipe={handleSwipe}
                token={token}
                userCountry={formData.country}
              />
            ) : (
              <div className="text-center text-gray-600 glass p-10 rounded-[2rem] card-shadow border border-white/50">
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No more partners</h3>
                <p className="mb-8 text-sm font-medium text-gray-500">You've reviewed all top recommendations for this commodity.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setCurrentIndex(0);
                      startMatchmaking();
                    }}
                    className="w-full font-bold text-white px-6 py-3.5 bg-[#8B5A2B] rounded-xl transition-all hover:bg-[#6b4521] shadow-lg flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} /> Refresh Matches
                  </button>
                  <button
                    onClick={() => setView('dashboard')}
                    className="w-full font-bold text-gray-800 px-6 py-3.5 bg-white rounded-xl border border-gray-100 transition-all hover:bg-gray-50 shadow-md flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={18} /> Portfolio & Strategy
                  </button>
                  <button
                    onClick={() => setView('analytics')}
                    className="w-full font-bold text-[#8B5A2B] px-6 py-3.5 bg-[#8B5A2B]/10 rounded-xl transition-all hover:bg-[#8B5A2B]/20 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    Analysis Dashboard
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence>
              {showSkipFeedback && (
                <SkipFeedback onDismiss={() => setShowSkipFeedback(false)} />
              )}
            </AnimatePresence>
          </div>
        )}

        {view === 'dashboard' && (
          <XAIDashboard userCountry={formData.country} token={token} />
        )}

        {view === 'analytics' && (
          <AnalyticsDashboard token={token} />
        )}

        {view === 'messages' && (
          <OutreachDashboard token={token} />
        )}

        {view === 'settings' && (
          <ProfileSettings
            username={user}
            onLogout={() => { setUser(null); setToken(null); setView('landing'); }}
          />
        )}

        <AnimatePresence>
          {selectedLead && (
            <DecisionPanel
              lead={selectedLead}
              token={token}
              onClose={() => setSelectedLead(null)}
              onSent={() => {
                setSelectedLead(null);
                setView('messages');
              }}
              onSave={() => {
                setSelectedLead(null);
              }}
            />
          )}
        </AnimatePresence>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(data) => {
            setToken(data.token);
            setUser(data.username);
            // Pre-fill form if user has data
            if (data.country || data.commodity || data.flow) {
              setFormData({
                country: data.country || '',
                commodity: data.commodity || '',
                flow: data.flow || 'Export'
              });
            }
            setView('setup');
          }}
        />
      </main>
    </div>
  );
}

export default App;
