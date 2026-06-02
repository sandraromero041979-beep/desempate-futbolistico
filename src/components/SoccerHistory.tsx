import React, { useState } from 'react';
import { SavedSearch } from '../types';
import { Search, Trash2, Calendar, Trophy, Zap, Compass } from 'lucide-react';

interface SoccerHistoryProps {
  searches: SavedSearch[];
  onSelectSearch: (search: SavedSearch) => void;
  onDeleteSearch: (id: string, e: React.MouseEvent) => void;
  currentActiveId?: string;
}

export default function SoccerHistory({
  searches,
  onSelectSearch,
  onDeleteSearch,
  currentActiveId
}: SoccerHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSearches = searches.filter(s =>
    s.queryTeamOrLeague.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.queryDetail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-805 rounded-3xl flex flex-col h-full overflow-hidden shadow-2xl" id="soccer-history-sidebar">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 shrink-0">
        <h3 className="font-display font-semibold text-slate-100 text-sm mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 matches-counter-tag">
            <Trophy className="w-4.5 h-4.5 text-emerald-400" />
            Favoritos e Historial
          </span>
          <span className="text-[11px] bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold font-mono">
            {searches.length}
          </span>
        </h3>
        
        {/* Search filter for history */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar en el historial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 text-slate-200 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[450px] lg:max-h-none">
        {filteredSearches.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 text-xs italic space-y-2">
            <Compass className="w-8 h-8 text-slate-600 mx-auto animate-pulse-slow" />
            <p>
              {searchTerm 
                ? 'No se encontraron resultados.' 
                : 'Aún no tienes búsquedas de fútbol guardadas.'}
            </p>
          </div>
        ) : (
          filteredSearches.map((item) => {
            const isActive = currentActiveId === item.id;
            const matchCount = item.data?.matches?.length || 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectSearch(item)}
                className={`group relative p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-900/15 via-emerald-950/5 to-transparent border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/10'
                    : 'bg-slate-950/30 border-slate-850 hover:border-slate-800 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="pr-5">
                    <h4 className={`text-xs leading-snug line-clamp-1 transition-colors ${isActive ? 'text-emerald-400 font-black' : 'text-slate-200 font-bold group-hover:text-slate-100'}`}>
                      {item.queryTeamOrLeague}
                    </h4>
                    <p className="text-[10px] text-slate-450 font-medium mt-0.5 line-clamp-1 italic">
                      {item.queryDetail}
                    </p>
                  </div>

                  <button
                    onClick={(e) => onDeleteSearch(item.id, e)}
                    className="absolute right-2.5 top-3.5 opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-500 p-1 rounded-lg hover:bg-red-950/40 transition-all"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1 border-t border-slate-800/60 pt-1.5">
                  <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-md bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 font-bold font-mono">
                    <Zap className="w-2.5 h-2.5 text-emerald-400" />
                    {matchCount} {matchCount === 1 ? 'partido' : 'partidos'}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
