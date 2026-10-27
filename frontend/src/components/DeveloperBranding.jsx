import React from 'react';
import { 
  CheckCircle2, Scan, Printer, Monitor, Code2, Video, 
  QrCode, Sparkles 
} from 'lucide-react';

export default function DeveloperBranding({ compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">POWERED BY</div>
            <div className="text-xs font-black text-white">CV. ISTANA BARCODE COMPUTER</div>
          </div>
        </div>

        <a 
          href="https://github.com/developercerdas" 
          target="_blank" 
          rel="noreferrer"
          className="px-3 py-1 rounded-full border border-cyan-400/80 bg-cyan-500/10 text-cyan-400 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 hover:bg-cyan-500/20 transition"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>DEVELOPER CERDAS</span>
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-[#091026] border border-slate-800/80 p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 select-none">
      {/* SISI KIRI: LOGO & NAMA CV */}
      <div className="flex items-center gap-3.5 w-full md:w-auto">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-900/40 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
          <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
            POWERED BY
          </div>
          <h4 className="text-sm sm:text-base font-black text-white tracking-wide mt-1 leading-tight">
            CV. ISTANA BARCODE COMPUTER
          </h4>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
            Official IT Solution &amp; POS Barcode Hardware System
          </p>
        </div>
      </div>

      {/* SISI KANAN: BADGE DEVELOPER CERDAS & TAG KATEGORI */}
      <div className="flex flex-col items-start md:items-end gap-2.5 w-full md:w-auto border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
        {/* BADGE DEVELOPER CERDAS */}
        <a 
          href="https://github.com/developercerdas" 
          target="_blank" 
          rel="noreferrer"
          className="px-3.5 py-1 rounded-full border border-cyan-400 bg-cyan-950/40 text-cyan-400 text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md shadow-cyan-500/10 hover:bg-cyan-500/20 transition cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>DEVELOPER CERDAS</span>
        </a>

        {/* PILL TAGS */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-1 text-[10px] font-semibold text-slate-300">
            <Scan className="w-3 h-3 text-amber-400" />
            <span>Barcode</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-1 text-[10px] font-semibold text-slate-300">
            <Printer className="w-3 h-3 text-amber-400" />
            <span>POS</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-1 text-[10px] font-semibold text-slate-300">
            <Monitor className="w-3 h-3 text-amber-400" />
            <span>Komputer</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-1 text-[10px] font-semibold text-slate-300">
            <Code2 className="w-3 h-3 text-amber-400" />
            <span>Software</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-1 text-[10px] font-semibold text-slate-300">
            <Video className="w-3 h-3 text-amber-400" />
            <span>Smart Digital CCTV</span>
          </div>
        </div>
      </div>
    </div>
  );
}
