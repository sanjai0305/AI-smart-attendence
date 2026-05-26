import React, { useState } from 'react';
import { Sparkles, Volume2, HelpCircle, Eye, Hand, Users, Check, AlertCircle } from 'lucide-react';
import { Student } from '../types';

interface InclusionPriorityWidgetProps {
  student?: Student;
  onOverrideApplied?: (category: string, adjustedOptions: any) => void;
  readAloudText?: string;
}

export default function InclusionPriorityWidget({ student, onOverrideApplied, readAloudText }: InclusionPriorityWidgetProps) {
  const [selectedCategory, setSelectedCategory] = useState<'none' | 'children' | 'disability_vision' | 'disability_motor' | 'disability_hearing'>(
    student?.priorityCategory || 'none'
  );
  const [ttsActive, setTtsActive] = useState(false);
  const [assistedLog, setAssistedLog] = useState<string[]>([]);

  const accomodations = {
    none: {
      title: 'Standard Enrolment',
      perks: ['Default 4-Stage high-strictness checking', 'Standard timing limits apply'],
      style: 'border-slate-100 bg-slate-50/50 text-slate-600'
    },
    children: {
      title: 'Children/Visitor Accommodations',
      perks: ['Simplified verification wizard', 'Safety chaperone verification prompt enabled', 'Guardian notifications triggered automatically'],
      style: 'border-amber-100 bg-amber-50/20 text-amber-900'
    },
    disability_vision: {
      title: 'Visually Assisted Attendance',
      perks: ['Vocal text-to-speech prompt system active', 'High contrast color schemes', 'Enlarged accessibility typography font-scale (zoom +25%)'],
      style: 'border-purple-200 bg-purple-50/30 text-purple-900 font-bold'
    },
    disability_motor: {
      title: 'Motor & Dexterity Priority Extension',
      perks: ['Extended time-window limits (+30 minutes)', 'Oversized touch-trigger controls (minimum height 52px)', 'Manual camera coordinate verification safety valve'],
      style: 'border-blue-200 bg-blue-50/30 text-blue-900'
    },
    disability_hearing: {
      title: 'Hearing/Captions Mode Support',
      perks: ['Blinking visual confirmation pulses', 'Subtitles / Live interactive textual checklist', 'Double-factor vibration alert placeholders'],
      style: 'border-emerald-200 bg-emerald-50/30 text-emerald-900'
    }
  };

  const applyPriorityConfig = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    const options = accomodations[category];
    const logMsg = `Applied Priority Configuration Filter: ${options.title}`;
    setAssistedLog([logMsg, ...assistedLog]);
    
    if (onOverrideApplied) {
      onOverrideApplied(category, {
        zoomLevel: category === 'disability_vision' ? 1.25 : 1.0,
        extendedGracePeriod: category === 'disability_motor' || category === 'children',
        vocalGuidance: category === 'disability_vision',
        simplifiedUI: category === 'children' || category === 'disability_vision'
      });
    }

    // Auto-vocalize greeting if TTS available
    if (category === 'disability_vision' && 'speechSynthesis' in window) {
      triggerVocalRead('Visual Assistance support is now active. Touch anywhere on the screen to trigger stage scans.');
    }
  };

  const triggerVocalRead = (textToRead: string = '') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setTtsActive(true);
    const speech = new SpeechSynthesisUtterance(textToRead || readAloudText || "Welcome to Smart Campus. Priority assistance is standing by.");
    speech.rate = 0.95;
    speech.pitch = 1.0;
    speech.onend = () => setTtsActive(false);
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-5 rounded-2xl shadow-xl" id="accessibility-assistance-widget">
      {/* Title */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
          <Sparkles size={18} />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">Priority &amp; Accessibility Assistance</h4>
          <p className="text-xs text-zinc-500 font-normal">Inclusive parameters for young age, temporary, or permanent visual/motor/hearing support</p>
        </div>
      </div>

      {/* Select Category */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 mb-4">
        <button
          onClick={() => applyPriorityConfig('none')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center border transition-all text-xs hover:bg-slate-50 cursor-pointer ${
            selectedCategory === 'none' ? 'border-indigo-600 bg-indigo-50/30 font-semibold text-indigo-950' : 'border-slate-100 bg-white text-slate-500'
          }`}
        >
          <Users size={16} className="text-slate-400" />
          <span>Standard</span>
        </button>

        <button
          onClick={() => applyPriorityConfig('children')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center border transition-all text-xs hover:bg-amber-50 cursor-pointer ${
            selectedCategory === 'children' ? 'border-amber-500 bg-amber-50/40 font-semibold text-amber-950' : 'border-slate-100 bg-white text-slate-500'
          }`}
        >
          <HelpCircle size={16} className="text-amber-500" />
          <span>Children Support</span>
        </button>

        <button
          onClick={() => applyPriorityConfig('disability_vision')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center border transition-all text-xs hover:bg-purple-50 cursor-pointer ${
            selectedCategory === 'disability_vision' ? 'border-purple-600 bg-purple-50/40 font-semibold text-purple-950' : 'border-slate-100 bg-white text-slate-500'
          }`}
        >
          <Eye size={16} className="text-purple-500" />
          <span>Visual Assistance</span>
        </button>

        <button
          onClick={() => applyPriorityConfig('disability_motor')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center border transition-all text-xs hover:bg-blue-50 cursor-pointer ${
            selectedCategory === 'disability_motor' ? 'border-blue-600 bg-blue-50/40 font-semibold text-blue-950' : 'border-slate-100 bg-white text-slate-500'
          }`}
        >
          <Hand size={16} className="text-blue-500" />
          <span>Dexterity Target</span>
        </button>

        <button
          onClick={() => applyPriorityConfig('disability_hearing')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center border transition-all text-xs hover:bg-emerald-50 cursor-pointer ${
            selectedCategory === 'disability_hearing' ? 'border-emerald-600 bg-emerald-50/40 font-semibold text-emerald-950' : 'border-slate-100 bg-white text-slate-500'
          }`}
        >
          <Volume2 size={16} className="text-emerald-500" />
          <span>Hearing/Caption</span>
        </button>
      </div>

      {/* Accomodation Display */}
      <div className={`border rounded-xl p-3.5 ${accomodations[selectedCategory].style} transition-all duration-300`}>
        <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-2 mb-2">
          <h5 className="font-semibold text-sm flex items-center gap-1.5">
            <Check size={14} /> {accomodations[selectedCategory].title}
          </h5>
          {selectedCategory === 'disability_vision' && (
            <button
              onClick={() => triggerVocalRead()}
              className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                ttsActive 
                  ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                  : 'bg-white hover:bg-zinc-100 text-purple-700 border-purple-200'
              }`}
            >
              <Volume2 size={12} /> {ttsActive ? 'Speaking...' : 'Vocalize Screen'}
            </button>
          )}
        </div>

        <ul className="space-y-1 text-xs">
          {accomodations[selectedCategory].perks.map((perk, pIdx) => (
            <li key={pIdx} className="flex items-start gap-1.5 leading-normal">
              <span className="text-[10px] mt-1 shrink-0">•</span>
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      { assistedLog.length > 0 && (
        <div className="mt-3 bg-slate-50/60 rounded-lg p-2.5 font-mono text-[9px] text-slate-500 border border-slate-100">
          <p className="font-semibold uppercase text-[8px] text-slate-400 mb-1 flex items-center gap-1">
            <AlertCircle size={9} /> Assistance Adaptation Log
          </p>
          {assistedLog.slice(0, 2).map((l, lIdx) => (
            <div key={lIdx} className="truncate">» {l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
