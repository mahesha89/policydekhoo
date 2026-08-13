import React, { useState } from 'react';
import { HospitalNetworkItem } from '../types';
import { Building2, Search, MapPin, Phone, CheckCircle2, Star, ShieldCheck, Filter } from 'lucide-react';

interface CashlessHospitalsViewProps {
  hospitals: HospitalNetworkItem[];
  onSelectHospitalForClaim: (hosp: HospitalNetworkItem) => void;
}

export const CashlessHospitalsView: React.FC<CashlessHospitalsViewProps> = ({
  hospitals,
  onSelectHospitalForClaim,
}) => {
  const [searchCity, setSearchCity] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('ALL');

  const filteredHospitals = hospitals.filter((h) => {
    if (selectedCityFilter !== 'ALL' && h.city.toLowerCase() !== selectedCityFilter.toLowerCase()) {
      return false;
    }
    if (!searchCity.trim()) return true;
    const q = searchCity.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q) ||
      h.specialties.some((s) => s.toLowerCase().includes(q))
    );
  });

  const cityOptions = ['ALL', 'Mumbai', 'Bengaluru', 'New Delhi / Saket', 'Chennai'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-xs font-bold border border-cyan-800">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>14,200+ Cashless Hospital Network Across India</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Cashless Hospital & Network Garage Directory
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Search top super-specialty hospitals with dedicated Cashless Desks for Star Health, HDFC ERGO, Care Health, Niva Bupa & ICICI Lombard.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search by hospital name, city, specialty (Cardiology, Oncology)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
          <span className="text-slate-400 font-bold shrink-0">City:</span>
          <select
            value={selectedCityFilter}
            onChange={(e) => setSelectedCityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-cyan-300 font-bold px-3 py-2 rounded-xl focus:outline-none w-full sm:w-auto"
          >
            {cityOptions.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-white">
                {c === 'ALL' ? 'All Indian Cities' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Hospital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-cyan-500/60 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">
                    {hosp.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{hosp.address}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 font-bold text-xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{hosp.googleRating}</span>
                </div>
              </div>

              {/* Specialties tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hosp.specialties.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 text-[11px] font-medium border border-slate-800"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Insurers accepted */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                  Accepted Cashless Insurers
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hosp.insurersAccepted.map((ins, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[11px] font-semibold border border-emerald-800"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{ins}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Contact & Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Cashless Desk</span>
                <span className="font-bold text-slate-200">{hosp.phone}</span>
              </div>

              <button
                onClick={() => onSelectHospitalForClaim(hosp)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-md"
              >
                Request Pre-Auth Assistance
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
