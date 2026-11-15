'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { FormattedTimelineItem } from '@/services/timeline';
import { 
  History, 
  Pill, 
  CheckCircle2, 
  Users, 
  Stethoscope, 
  Clock, 
  User, 
  Filter
} from 'lucide-react';

export default function TimelinePage() {
  const { currentUser, currentProfile, refreshKey, showNotification } = useApp();
  const [timeline, setTimeline] = useState<FormattedTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/timeline?profileId=${currentProfile.id}&userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.timeline) {
          setTimeline(data.timeline);
        } else if (data.error) {
          showNotification(`Notice: ${data.error}`);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentProfile.id, currentUser.id, refreshKey, showNotification]);

  const filteredItems = filterType === 'all'
    ? timeline
    : timeline.filter((item) => item.iconType === filterType);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-kalji-50 text-kalji-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <History className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Shared Care Activity</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Activity Timeline
          </h1>
          <p className="text-slate-600 mt-1 font-medium">
            Traceable chronological history for <span className="font-bold text-slate-900">{currentProfile.preferred_name}</span>
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {['all', 'dose', 'medication', 'appointment', 'member'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                filterType === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'all' ? 'All Activity' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Feed */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading care timeline...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          No activity records found matching this filter.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6">
          {filteredItems.map((item) => {
            const Icon = 
              item.iconType === 'dose' ? CheckCircle2 :
              item.iconType === 'medication' ? Pill :
              item.iconType === 'appointment' ? Stethoscope :
              item.iconType === 'member' ? Users : History;

            const iconBg = 
              item.iconType === 'dose' ? 'bg-emerald-100 text-emerald-800' :
              item.iconType === 'medication' ? 'bg-kalji-100 text-kalji-800' :
              item.iconType === 'appointment' ? 'bg-blue-100 text-blue-800' :
              item.iconType === 'member' ? 'bg-terracotta-100 text-terracotta-800' :
              'bg-slate-100 text-slate-700';

            const formattedTime = new Date(item.timestamp).toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div key={item.id} className="relative group">
                {/* Node icon */}
                <div className={`absolute -left-[35px] sm:-left-[43px] top-1 p-2 rounded-full border-2 border-white shadow-sm ${iconBg}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span>{item.actorName}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span>{formattedTime} IST</span>
                    </div>
                  </div>

                  <p className="text-base font-bold text-slate-900 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
