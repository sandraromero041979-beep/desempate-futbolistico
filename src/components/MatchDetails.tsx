import React, { useState, useEffect } from 'react';
import { SoccerMatch, Player } from '../types';
import FootballPitch from './FootballPitch';
import { 
  Calendar, 
  MapPin, 
  Flame, 
  Sparkles, 
  Swords, 
  ArrowLeftRight,
  TrendingUp,
  UserCheck,
  Zap,
  BarChart4,
  RefreshCw
} from 'lucide-react';

interface MatchDetailsProps {
  match: SoccerMatch;
}

export default function MatchDetails({ match }: MatchDetailsProps) {
  const [activeLineupTeam, setActiveLineupTeam] = useState<'home' | 'away'>('home');
  
  // Selection states for player comparison tool
  const [comparePlayerA, setComparePlayerA] = useState<Player | null>(null);
  const [comparePlayerB, setComparePlayerB] = useState<Player | null>(null);

  // Auto-initialize compare players with prominent starting options on load/change
  useEffect(() => {
    if (match.homeLineup.players.length > 0) {
      setComparePlayerA(match.homeLineup.players[0]);
    } else {
      setComparePlayerA(null);
    }

    if (match.awayLineup.players.length > 0) {
      setComparePlayerB(match.awayLineup.players[0]);
    } else {
      setComparePlayerB(null);
    }
  }, [match]);

  const renderEventIcon = (type: string) => {
    switch (type) {
      case 'Gol':
        return <span className="text-sm select-none" title="Gol">⚽</span>;
      case 'Tarjeta Roja':
        return <div className="w-3 h-4 bg-red-600 rounded-sm shadow-xs border border-red-700" title="Tarjeta Roja" />;
      case 'Tarjeta Amarilla':
        return <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-xs border border-yellow-500" title="Tarjeta Amarilla" />;
      case 'Lesión':
        return <span className="text-xs select-none" title="Lesión">🚑</span>;
      case 'Penalti':
        return <span className="text-xs select-none" title="Penalti">🎯</span>;
      case 'Cambio':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" title="Cambio" />;
      default:
        return <span className="text-xs text-slate-400">●</span>;
    }
  };

  // Generate simulated dynamic tactical rating attributes for any player
  const getPlayerAttributes = (player: Player) => {
    const base = player.rating ? player.rating * 10 : 70;
    
    switch (player.position) {
      case 'POR':
        return [
          { name: 'Reflejos', val: Math.min(99, Math.round(base + 8)) },
          { name: 'Posicionamiento', val: Math.min(99, Math.round(base + 4)) },
          { name: 'Estirada', val: Math.min(99, Math.round(base + 5)) },
          { name: 'Saque Largo', val: Math.max(45, Math.min(99, Math.round(base - 8))) },
          { name: 'Juego de Pies', val: Math.max(40, Math.min(99, Math.round(base - 10))) },
        ];
      case 'DEF':
        return [
          { name: 'Intercepciones', val: Math.min(99, Math.round(base + 11)) },
          { name: 'Fuerza Física', val: Math.min(99, Math.round(base + 9)) },
          { name: 'Juego Aéreo', val: Math.min(99, Math.round(base + 6)) },
          { name: 'Velocidad Corte', val: Math.max(50, Math.min(99, Math.round(base - 2))) },
          { name: 'Pases de Salida', val: Math.max(55, Math.min(99, Math.round(base - 4))) },
        ];
      case 'MC':
        return [
          { name: 'Visión de Juego', val: Math.min(99, Math.round(base + 12)) },
          { name: 'Precisión Pase', val: Math.min(99, Math.round(base + 10)) },
          { name: 'Regate en Corto', val: Math.min(99, Math.round(base + 5)) },
          { name: 'Resistencia / Estamina', val: Math.min(99, Math.round(base + 8)) },
          { name: 'Robo Limpio', val: Math.max(50, Math.min(99, Math.round(base - 3))) },
        ];
      case 'DEL':
        return [
          { name: 'Definición de Cara al Gol', val: Math.min(99, Math.round(base + 14)) },
          { name: 'Velocidad Explosiva', val: Math.min(99, Math.round(base + 11)) },
          { name: 'Regate Dinámico', val: Math.min(99, Math.round(base + 8)) },
          { name: 'Posicionamiento Ofensivo', val: Math.min(99, Math.round(base + 9)) },
          { name: 'Capacidad de Remate', val: Math.min(99, Math.round(base + 6)) },
        ];
      default:
        return [
          { name: 'Velocidad', val: Math.min(99, Math.round(base)) },
          { name: 'Regate', val: Math.min(99, Math.round(base - 2)) },
          { name: 'Pase', val: Math.min(99, Math.round(base - 1)) },
          { name: 'Defensa', val: Math.min(99, Math.round(base - 10)) },
          { name: 'Físico', val: Math.min(99, Math.round(base + 2)) },
        ];
    }
  };

  const getAttrColor = (val: number) => {
    if (val >= 85) return 'text-emerald-450';
    if (val >= 75) return 'text-teal-400';
    if (val >= 65) return 'text-sky-400';
    return 'text-amber-400';
  };

  const getAttrBg = (val: number) => {
    if (val >= 85) return 'bg-emerald-500';
    if (val >= 75) return 'bg-teal-400';
    if (val >= 65) return 'bg-sky-450';
    return 'bg-amber-400';
  };

  const hasStats = match.stats && (match.stats.possessionHome > 0 || match.stats.possessionAway > 0);

  // Group all squad players (titulares + suplentes) to allow comparing anyone!
  const homeSquad = [...match.homeLineup.players, ...(match.homeLineup.substitutes || [])];
  const awaySquad = [...match.awayLineup.players, ...(match.awayLineup.substitutes || [])];

  const attrsA = comparePlayerA ? getPlayerAttributes(comparePlayerA) : [];
  const attrsB = comparePlayerB ? getPlayerAttributes(comparePlayerB) : [];

  return (
    <div className="space-y-6" id="match-details-container">
      {/* 1. Scoreboard Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Background Visual Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute top-[-100px] right-[-100px] w-52 h-52 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center text-center gap-4 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-[10px] text-slate-300 font-mono">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span>{match.date}</span>
          </div>

          <div className="w-full flex items-center justify-between max-w-lg md:max-w-2xl gap-2 mt-2">
            {/* Home Team */}
            <div className="flex-1 text-right flex flex-col items-end">
              <h3 className="text-sm md:text-lg font-bold text-slate-100">{match.homeTeam}</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono mt-0.5">LOCAL</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-inner select-none font-mono">
              <span className="text-2xl md:text-4xl font-black text-white px-1">
                {match.homeScore !== null ? match.homeScore : '-'}
              </span>
              <span className="text-slate-600 font-black text-sm md:text-lg">:</span>
              <span className="text-2xl md:text-4xl font-black text-white px-1">
                {match.awayScore !== null ? match.awayScore : '-'}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-left flex flex-col items-start">
              <h3 className="text-sm md:text-lg font-bold text-slate-100">{match.awayTeam}</h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono mt-0.5">VISITANTE</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400 mt-2 border-t border-slate-800/65 pt-3 w-full max-w-lg">
            {match.stadium && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Estadio: {match.stadium}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                match.status === 'Finalizado' 
                  ? 'bg-slate-500' 
                  : match.status === 'En juego' 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-emerald-500'
              }`} />
              <span className="font-bold text-slate-350">{match.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tactical Chronicle / Summary */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-3">
        <h4 className="font-display font-semibold text-slate-100 text-sm flex items-center gap-2 shadow-xs">
          <Sparkles className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
          Análisis Táctico de IA & Crónica Deportiva
        </h4>
        <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent p-4 rounded-2xl border border-slate-850/50 italic font-mono relative overflow-hidden">
          <span className="absolute top-0 right-0 p-1.5 text-[8px] bg-emerald-950/40 text-emerald-400 font-bold border-l border-b border-emerald-800/20 rounded-bl-xl font-mono uppercase tracking-widest hidden sm:inline">CRÓNICA IA</span>
          "{match.summary}"
        </p>
      </div>

      {/* Grid: 3. Lineup field (Left on Desktop) vs Stats+Events (Right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pitch visualizer col */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Controls for toggling local vs visitor lineup */}
          <div className="bg-slate-950 p-1 border border-slate-850 rounded-2xl flex gap-1.5 shadow-inner">
            <button
              onClick={() => setActiveLineupTeam('home')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeLineupTeam === 'home'
                  ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400" />
              <span>Alineación Local</span>
            </button>
            <button
              onClick={() => setActiveLineupTeam('away')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeLineupTeam === 'away'
                  ? 'bg-slate-900 text-teal-400 shadow-md border border-slate-800/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-teal-500 shadow-sm shadow-teal-400" />
              <span>Alineación Visitante</span>
            </button>
          </div>

          {activeLineupTeam === 'home' ? (
            <FootballPitch 
              lineup={match.homeLineup} 
              teamName={match.homeTeam} 
              isHome={true} 
            />
          ) : (
            <FootballPitch 
              lineup={match.awayLineup} 
              teamName={match.awayTeam} 
              isHome={false} 
            />
          )}
        </div>

        {/* Stats & Events side card col */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 4. Match Statistics */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
            <h4 className="font-display font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Swords className="w-4 h-4 text-slate-400" />
              Estadísticas Clave del Partido
            </h4>

            {hasStats ? (
              <div className="space-y-4 pt-1 font-mono text-xs text-slate-300">
                {/* Possession Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-emerald-400">{match.stats!.possessionHome}%</span>
                    <span className="text-[10px] uppercase font-sans font-black tracking-widest text-slate-500">Posesión</span>
                    <span className="text-teal-400">{match.stats!.possessionAway}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-950 border border-slate-850/50">
                    <div 
                      style={{ width: `${match.stats!.possessionHome}%` }} 
                      className="bg-indigo-600 bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all" 
                    />
                    <div 
                      style={{ width: `${match.stats!.possessionAway}%` }} 
                      className="bg-indigo-500 h-full transition-all" 
                    />
                  </div>
                </div>

                {/* Shots representation */}
                {match.stats!.shotsHome !== undefined && match.stats!.shotsAway !== undefined && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-emerald-400">{match.stats!.shotsHome}</span>
                      <span className="text-[10px] uppercase font-sans font-black tracking-widest text-slate-500">Remates</span>
                      <span className="text-teal-400">{match.stats!.shotsAway}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-950 border border-slate-850/50">
                      {(() => {
                        const total = (match.stats!.shotsHome || 0) + (match.stats!.shotsAway || 0) || 1;
                        const homePct = ((match.stats!.shotsHome || 0) / total) * 100;
                        return (
                          <>
                            <div style={{ width: `${homePct}%` }} className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all" />
                            <div style={{ width: `${100 - homePct}%` }} className="bg-indigo-500 h-full transition-all" />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Fouls representation */}
                {match.stats!.foulsHome !== undefined && match.stats!.foulsAway !== undefined && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-amber-400">{match.stats!.foulsHome}</span>
                      <span className="text-[10px] uppercase font-sans font-black tracking-widest text-slate-500">Faltas castigadas</span>
                      <span className="text-amber-400">{match.stats!.foulsAway}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-950 border border-slate-850/50">
                      {(() => {
                        const total = (match.stats!.foulsHome || 0) + (match.stats!.foulsAway || 0) || 1;
                        const homePct = ((match.stats!.foulsHome || 0) / total) * 100;
                        return (
                          <>
                            <div style={{ width: `${homePct}%` }} className="bg-amber-500 h-full transition-all" />
                            <div style={{ width: `${100 - homePct}%` }} className="bg-amber-600 h-full transition-all" />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 italic text-[11px]">
                Sin estadísticas registradas para este derbi.
              </div>
            )}
          </div>

          {/* 5. Match Key Events Timeline */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
            <h4 className="font-display font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
              Sucesos Clave e Incidencias
            </h4>

            {match.keyEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-500 italic text-[11px]">
                No hay incidencias registradas en la transmisión en directo.
              </div>
            ) : (
              <div className="relative pl-4 border-l-2 border-slate-800 space-y-4">
                {match.keyEvents
                  .sort((a, b) => a.minute - b.minute)
                  .map((evt, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                      {/* Timeline dot custom placement */}
                      <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-950 ring-2 ring-slate-850" />
                      
                      {/* Action Event Symbol */}
                      <div className="w-6 h-6 rounded-lg bg-slate-950/80 border border-slate-800/60 flex items-center justify-center shrink-0 shadow-lg">
                        {renderEventIcon(evt.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-mono font-black text-emerald-400 inline-block shrink-0">
                            {evt.minute}'
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                            [{evt.type}]
                          </span>
                          <span className="text-xs font-black text-slate-100 truncate">
                            {evt.player}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate flex items-center justify-between">
                          <span>{evt.team}</span>
                          {evt.detail && (
                            <span className="text-slate-500 italic font-mono lowercase">
                              {evt.detail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Elite Player Comparison Workbench (Comparador Head-to-Head Pro) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden" id="player-comparison-workbench">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4 mb-5">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart4 className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
              Comparador de Rendimiento Pro: Cara a Cara de Jugadores
            </h4>
            <p className="text-[10px] text-slate-450 font-mono">
              Compara de forma interactiva las fichas de rendimiento y atributos tácticos cruzados.
            </p>
          </div>
          
          <button 
            type="button"
            onClick={() => {
              if (homeSquad.length > 0 && awaySquad.length > 0) {
                // Pick random starter from home and away to quickly randomize exploration
                setComparePlayerA(homeSquad[Math.floor(Math.random() * homeSquad.length)]);
                setComparePlayerB(awaySquad[Math.floor(Math.random() * awaySquad.length)]);
              }
            }}
            className="p-1.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-350 hover:text-white transition-all rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Aleotario</span>
          </button>
        </div>

        {/* Comparison Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Slot A Selection (Home) */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-850 p-4 rounded-2xl flex flex-col gap-4 relative">
            <div className="absolute top-0.5 right-2 text-[8px] font-mono font-black text-rose-500 uppercase tracking-widest">LOCAL</div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9.5px] font-mono font-black text-slate-400 uppercase tracking-widest block">Seleccionar Jugador A:</label>
              <select
                value={comparePlayerA?.name || ''}
                onChange={(e) => {
                  const found = homeSquad.find(p => p.name === e.target.value);
                  if (found) setComparePlayerA(found);
                }}
                className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 font-bold p-2.5 rounded-xl cursor-all-scroll focus:ring-1 focus:ring-emerald-500/50"
              >
                {homeSquad.map((p) => (
                  <option key={p.name} value={p.name} className="bg-slate-950 text-slate-200">
                    #{p.number || 'SB'} - {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            {comparePlayerA ? (
              <div className="mt-2 text-center flex flex-col items-center justify-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-900 to-emerald-700 border-2 border-emerald-450 flex items-center justify-center text-white text-base font-mono font-black shadow-lg shadow-emerald-500/10">
                  #{comparePlayerA.number || 'SB'}
                </div>
                <h5 className="mt-3 text-sm font-black text-slate-100 truncate w-full">{comparePlayerA.name}</h5>
                <span className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase mt-0.5">{comparePlayerA.position} • {match.homeTeam}</span>
                
                {comparePlayerA.rating ? (
                  <div className="mt-3.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-2 px-4 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">VALORACIÓN</span>
                    <span className="text-lg font-black text-emerald-300 font-mono">{comparePlayerA.rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 mt-2">Sin valoración</span>
                )}
              </div>
            ) : (
              <div className="text-center py-10 italic text-xs text-slate-600">No hay jugador seleccionado</div>
            )}
          </div>

          {/* Attributes comparison Bars (Center) */}
          <div className="md:col-span-4 bg-slate-950/30 border border-slate-850 p-4 rounded-2xl flex flex-col justify-center gap-4">
            <h5 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest text-center">Atributos Tácticos Estimados</h5>
            
            {comparePlayerA && comparePlayerB ? (
              <div className="space-y-4 pt-1">
                {attrsA.map((attr, idx) => {
                  const valA = attr.val;
                  const valB = attrsB[idx]?.val || 70;
                  const nameB = attrsB[idx]?.name || attr.name;

                  return (
                    <div key={idx} className="space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between items-center text-[10px] px-1">
                        <span className={`font-black ${getAttrColor(valA)}`}>{valA}</span>
                        <span className="text-[9.5px] font-sans font-extrabold text-slate-400 text-center truncate max-w-[130px]" title={`${attr.name} vs ${nameB}`}>
                          {attr.name}
                        </span>
                        <span className={`font-black ${getAttrColor(valB)}`}>{valB}</span>
                      </div>
                      
                      {/* Side-by-side Comparative Slider */}
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden flex border border-slate-850">
                        {/* Player A bar (starts from middle, goes left) */}
                        <div className="w-1/2 flex justify-end">
                          <div 
                            style={{ width: `${valA}%` }}
                            className={`h-full rounded-l-md ${getAttrBg(valA)} opacity-90`}
                          />
                        </div>
                        {/* Player B bar (starts from middle, goes right) */}
                        <div className="w-1/2 flex justify-start border-l border-slate-800">
                          <div 
                            style={{ width: `${valB}%` }}
                            className={`h-full rounded-r-md ${getAttrBg(valB)} opacity-90`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 text-center border-t border-slate-900/60">
                  <span className="text-[8.5px] uppercase text-emerald-450 font-black font-mono leading-none flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400 inline" />
                    MÉTRICA INTEGRADA POR RENDIMIENTO REAL
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 italic text-[11px] text-slate-500">
                Selecciona futbolistas de ambos lados para dibujar el grafico táctico comparativo.
              </div>
            )}
          </div>

          {/* Slot B Selection (Away) */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-850 p-4 rounded-2xl flex flex-col gap-4 relative">
            <div className="absolute top-0.5 right-2 text-[8px] font-mono font-black text-rose-500 uppercase tracking-widest">VISITANTE</div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9.5px] font-mono font-black text-slate-400 uppercase tracking-widest block">Seleccionar Jugador B:</label>
              <select
                value={comparePlayerB?.name || ''}
                onChange={(e) => {
                  const found = awaySquad.find(p => p.name === e.target.value);
                  if (found) setComparePlayerB(found);
                }}
                className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 font-bold p-2.5 rounded-xl cursor-all-scroll focus:ring-1 focus:ring-emerald-500/50"
              >
                {awaySquad.map((p) => (
                  <option key={p.name} value={p.name} className="bg-slate-950 text-slate-200">
                    #{p.number || 'SB'} - {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            {comparePlayerB ? (
              <div className="mt-2 text-center flex flex-col items-center justify-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-900 to-indigo-700 border-2 border-indigo-400 flex items-center justify-center text-white text-base font-mono font-black shadow-lg shadow-indigo-500/10">
                  #{comparePlayerB.number || 'SB'}
                </div>
                <h5 className="mt-3 text-sm font-black text-slate-100 truncate w-full">{comparePlayerB.name}</h5>
                <span className="text-[10px] text-indigo-400 font-mono font-extrabold uppercase mt-0.5">{comparePlayerB.position} • {match.awayTeam}</span>
                
                {comparePlayerB.rating ? (
                  <div className="mt-3.5 bg-indigo-950/40 border border-indigo-900/60 rounded-xl p-2 px-4 flex items-center gap-2">
                    <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">VALORACIÓN</span>
                    <span className="text-lg font-black text-indigo-300 font-mono">{comparePlayerB.rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 mt-2">Sin valoración</span>
                )}
              </div>
            ) : (
              <div className="text-center py-10 italic text-xs text-slate-600">No hay jugador seleccionado</div>
            )}
          </div>
        </div>

        {/* Dynamic AI-driven comparison analytics text block */}
        {comparePlayerA && comparePlayerB && (
          <div className="mt-5 p-3.5 bg-slate-950/80 border border-slate-850/80 rounded-2xl flex flex-col gap-1.5">
            <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ANÁLISIS COMPARATIVO CRUZADO DE LA IA:
            </span>
            <p className="text-[11.5px] text-slate-300 leading-relaxed font-mono">
              {comparePlayerA.rating && comparePlayerB.rating ? (
                <>
                  Comparando a <strong>{comparePlayerA.name}</strong> ({comparePlayerA.position}) contra <strong>{comparePlayerB.name}</strong> ({comparePlayerB.position}).{' '}
                  {comparePlayerA.rating > comparePlayerB.rating ? (
                    <span>
                      En este encuentro, {comparePlayerA.name} mostró un desempeño táctico superior de <strong>{comparePlayerA.rating.toFixed(1)}</strong> frente al <strong>{comparePlayerB.rating.toFixed(1)}</strong> de su rival, teniendo mayor influencia posicional e impacto xG constructivo en la salida liguera.
                    </span>
                  ) : comparePlayerA.rating < comparePlayerB.rating ? (
                    <span>
                      {comparePlayerB.name} destaca tácticamente con una puntuación de <strong>{comparePlayerB.rating.toFixed(1)}</strong> sobre el <strong>{comparePlayerA.rating.toFixed(1)}</strong> de {comparePlayerA.name}. Sus métricas de recuperación, posicionamiento y efectividad con el balón reflejan una influencia crucial en el once de {match.awayTeam}.
                    </span>
                  ) : (
                    <span>
                      Ambos futbolistas registraron un desempeño equilibrado idéntico de <strong>{comparePlayerA.rating.toFixed(1)}</strong> de promedio, neutralizando sus virtudes y ofreciendo robustez a ambos esquemas competitivos.
                    </span>
                  )}
                </>
              ) : (
                <span>Métricas iniciales asignadas de forma proporcional basados en la convocatoria oficial.</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
