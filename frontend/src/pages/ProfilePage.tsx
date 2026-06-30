import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload: any = { name, email };
      
      if (newPassword) {
        if (!currentPassword) {
          setError('Current password is required to change password.');
          setLoading(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      setSuccess('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Error updating profile details.');
    } finally {
      setLoading(false);
    }
  };

  // Gamification Rank titles helper
  const getRankTitle = (lvl: number) => {
    if (lvl <= 1) return { title: 'Novice Ritualist', desc: 'Starting your journey of daily compounding consistency.' };
    if (lvl === 2) return { title: 'Habitual Scholar', desc: 'Understanding the mechanics of compound streaks.' };
    if (lvl === 3) return { title: 'Streak Architect', desc: 'Successfully structuring long-term behavioral gains.' };
    if (lvl === 4) return { title: 'Consistency Guru', desc: 'Guiding energy and focus into unbreakable habits.' };
    return { title: 'Grandmaster Ascendant', desc: 'True mastery over mind, routine, and discipline.' };
  };

  const rank = getRankTitle(user?.level || 1);

  return (
    <div className="space-y-8 md:space-y-10">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">Profile Settings</h1>
        <p className="text-zinc-500 text-sm font-light">Manage your account credentials, security details, and review gamified progression.</p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Rank & Level Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.05] relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-emerald-400" />
            
            {/* Big Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/[0.05] flex items-center justify-center font-display font-extrabold text-3xl text-accent uppercase tracking-wider mb-4 shadow-xl">
              {user?.name.charAt(0) || 'U'}
            </div>

            <h3 className="font-display font-semibold text-lg text-white">{user?.name}</h3>
            <p className="text-zinc-500 text-xs font-light mb-5">{user?.email}</p>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lvl {user?.level} - {rank.title}</span>
            </div>

            <div className="w-full border-t border-white/[0.04] pt-4 text-left space-y-3.5 text-xs">
              <div>
                <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Rank Description</p>
                <p className="text-zinc-300 font-light leading-relaxed mt-0.5">{rank.desc}</p>
              </div>
              <div className="flex justify-between items-center bg-zinc-950/60 p-2.5 rounded-xl border border-white/[0.03]">
                <span className="text-zinc-400 font-medium">All-time XP Balance</span>
                <span className="text-accent font-bold">{user?.xp} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Edit Credentials Form */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.05] space-y-6">
            <h3 className="font-display font-semibold text-white text-lg border-b border-white/[0.05] pb-3">Update Personal Details</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Display Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-white/[0.04] pt-5 space-y-4">
                <h4 className="font-display font-semibold text-white text-sm">Security & Password</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Current Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>New Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/[0.04] flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </section>

    </div>
  );
};
