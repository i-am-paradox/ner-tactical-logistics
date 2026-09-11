import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Radio, KeyRound, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../features/useAuthStore';

export function Login() {
  const navigate = useNavigate();
  const { login, switchRole } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('admin@nerlogistics.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('849201');

  const demoAccounts = [
    { role: 'admin', label: 'Commandant (HQ Admin)', email: 'admin@nerlogistics.gov.in', desc: 'Full authority, emergency toggle, broadcast dispatch' },
    { role: 'district_officer', label: 'District Disaster Officer', email: 'officer@nerlogistics.gov.in', desc: 'District level oversight, incident resolution' },
    { role: 'field_agent', label: 'Mobile Field Agent', email: 'agent@nerlogistics.gov.in', desc: 'Offline PWA reporting, photo upload' },
    { role: 'driver', label: 'Convoy Fleet Driver', email: 'driver@nerlogistics.gov.in', desc: 'GPS telemetry, waypoint milestones, reroute alerts' }
  ];

  const handleRoleSelect = (acc) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword('Password@123');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await switchRole(selectedRole);
      navigate('/dashboard');
    } catch (err) {
      console.warn('Login error:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ner-bg text-slate-100 flex flex-col justify-center items-center p-4">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

      <div className="relative w-full max-w-4xl space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-glow-primary mb-2">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-100">
            NER Tactical Logistics Command
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Select an operational role or authenticate with authorized credentials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Quick Demo Role Selector (Left) */}
          <Card className="md:col-span-6 p-5 border-slate-800 space-y-3" header="Instant Role Access">
            <p className="text-xs text-slate-400 mb-3">
              One-click preset accounts for evaluation across all 4 privilege tiers:
            </p>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.role}
                  onClick={() => handleRoleSelect(acc)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedRole === acc.role
                      ? 'bg-sky-950/70 border-sky-500/80 shadow-[0_0_15px_rgba(2,132,199,0.3)]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-bold uppercase ${selectedRole === acc.role ? 'text-sky-300' : 'text-slate-200'}`}>
                      {acc.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{acc.desc}</p>
                  </div>
                  <ShieldCheck className={`w-4 h-4 ${selectedRole === acc.role ? 'text-sky-400' : 'text-slate-600'}`} />
                </div>
              ))}
            </div>
          </Card>

          {/* Login Form (Right) */}
          <Card className="md:col-span-6 p-5 border-slate-800" header="Sign In to Command Center">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Official Email ID"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={User}
                required
              />

              <Input
                label="Password / Passcode"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />

              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Security Token: <b className="text-emerald-400 font-mono">AUTHORIZED</b></span>
                <span className="font-mono text-sky-400">DEMO OTP: {otp}</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
                icon={ArrowRight}
              >
                Authenticate as {selectedRole.toUpperCase().replace('_', ' ')}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
