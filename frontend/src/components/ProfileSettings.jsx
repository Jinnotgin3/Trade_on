import { useState } from 'react';
import { User, Building2, Mail, Globe, Bell, Shield, LogOut } from 'lucide-react';

export default function ProfileSettings({ username, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in pb-12 mt-4 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Nav */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 pl-4">Settings</h2>
        
        <button 
          onClick={() => setActiveTab('profile')}
          className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-white text-gray-900 card-shadow border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <User size={18} /> My Profile
        </button>
        <button 
          onClick={() => setActiveTab('company')}
          className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-colors ${activeTab === 'company' ? 'bg-white text-gray-900 card-shadow border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Building2 size={18} /> Company Details
        </button>
        <button 
          onClick={() => setActiveTab('preferences')}
          className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-colors ${activeTab === 'preferences' ? 'bg-white text-gray-900 card-shadow border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Bell size={18} /> Preferences
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-white text-gray-900 card-shadow border border-gray-100' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Shield size={18} /> Security
        </button>

        <div className="pt-6 mt-6 border-t border-gray-200">
          <button 
            onClick={onLogout}
            className="w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
        {activeTab === 'profile' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">My Profile</h3>
              <p className="text-sm text-gray-500 font-medium">Manage your personal information.</p>
            </div>
            
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
              <div className="w-20 h-20 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center text-[var(--color-gold)] text-2xl font-bold">
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-colors">
                  Change Avatar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Username</label>
                <input type="text" disabled value={username || 'User'} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address</label>
                <input type="email" placeholder="email@example.com" className="w-full p-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 focus:border-[var(--color-gold)] outline-none transition-all shadow-sm" />
              </div>
            </div>
            
            <div className="pt-4">
              <button className="px-6 py-3 bg-[var(--color-ink)] hover:bg-black text-white font-semibold rounded-xl shadow-md transition-all">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Company Details</h3>
              <p className="text-sm text-gray-500 font-medium">Information used for AI email generation.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Company Name</label>
                <input type="text" placeholder="Global Trade Corp" className="w-full p-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 focus:border-[var(--color-gold)] outline-none transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Website</label>
                <input type="url" placeholder="https://www.example.com" className="w-full p-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 focus:border-[var(--color-gold)] outline-none transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Brief Description (Used by AI)</label>
                <textarea rows="4" placeholder="We are a premium exporter of agricultural goods..." className="w-full p-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 focus:border-[var(--color-gold)] outline-none transition-all shadow-sm resize-none"></textarea>
              </div>
              <div className="pt-4">
                <button className="px-6 py-3 bg-[var(--color-ink)] hover:bg-black text-white font-semibold rounded-xl shadow-md transition-all">
                  Update Company Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'preferences' || activeTab === 'security') && (
          <div className="animate-fade-in space-y-6 text-center py-12">
            <Shield className="text-gray-300 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-1">Advanced Settings</h3>
            <p className="text-sm text-gray-500 font-medium">This section is currently under development.</p>
          </div>
        )}
      </div>
    </div>
  );
}
