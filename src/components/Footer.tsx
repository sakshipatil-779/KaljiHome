import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl text-white tracking-tight">
                Kalji<span className="text-terracotta-400">Home</span>
              </span>
              <span className="bg-terracotta-900 border border-terracotta-700 text-terracotta-300 text-xs px-2 py-0.5 rounded-full font-bold">
                काळजी
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dignified, collaborative healthcare coordination for Indian older adults and their authorized family care circles. Built with privacy-by-design and transparent attribution.
            </p>
          </div>

          {/* Clinical Safety Statement */}
          <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>Mandatory Safety Notice</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              KaljiHome records routine care and provides scheduled reminders. It is <strong>not</strong> a prescribing, diagnostic, or clinical decision system. If a dose is missed or unclear, please refer to your prescription leaflet or consult your prescribing doctor or pharmacist.
            </p>
          </div>

          {/* Privacy & Governance */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-kalji-400" aria-hidden="true" />
              <span>Trust &amp; Privacy Architecture</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built to the principles of India&apos;s Digital Personal Data Protection (DPDP) Act and the ABDM Health Data Management Policy. Healthcare details are never monetized, tracked, or included in plain email previews.
            </p>
            <div className="pt-2 text-xs">
              <Link href="/privacy" className="text-kalji-400 hover:text-kalji-300 underline font-medium">
                View Privacy &amp; Access Control Specifications &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 KaljiHome. All patient data shown in this evaluation environment is strictly synthetic.</p>
          <p className="flex items-center gap-1">
            <span>Designed for dignity, accessibility, and peace of mind</span>
            <HeartHandshake className="w-3.5 h-3.5 text-terracotta-400 inline" aria-hidden="true" />
          </p>
        </div>
      </div>
    </footer>
  );
};
