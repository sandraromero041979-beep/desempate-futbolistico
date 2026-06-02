import React, { useState, useEffect } from 'react';
import { Lineup, Player } from '../types';
import { Sparkles, HelpCircle, Eye, Sliders, ArrowLeftRight, RotateCcw, AlertTriangle, ChevronDown } from 'lucide-react';

interface FootballPitchProps {
  lineup: Lineup;
  teamName: string;
  isHome: boolean;
}

export default function FootballPitch({ lineup, teamName, isHome }: FootballPitchProps) {
  const [activeLineup, setActiveLineup] = useState<Lineup>(lineup);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [viewMode, setViewMode] = useState<'titulares' | 'suplentes'>('titulares');
  const [fieldPerspective, setFieldPerspective] = useState<'2d' | '3d'>('2d');
  const [subSwapMode, setSubSwapMode] = useState<boolean>(false);
  const [subHistory, setSubHistory] = useState<{ minute: number; outPlayer: string; inPlayer: string }[]>([]);

  // Sound generator using Web Audio API for extreme futuristic tactical feedback
  const playTacticalSound = (type: 'beep' | 'whistle') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'beep') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(650, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.13);
      } else {
        // High fidelity futuristic dynamic sport whistle pitch
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
        oscillator.frequency.linearRampToValueAtTime(750, audioCtx.currentTime + 0.15);
        oscillator.frequency.linearRampToValueAtTime(1100, audioCtx.currentTime + 0.22);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.26);
      }
    } catch {
      // Ignored if browser blocks audio autoplay
    }
  };

  // Reset active lineup state whenever the parent-provided lineup changes
  useEffect(() => {
    setActiveLineup(lineup);
    setSelectedPlayer(null);
    setViewMode('titulares');
    setSubSwapMode(false);
    setSubHistory([]);
  }, [lineup, teamName]);

  // Group active players by position for stats & view
  const goalkeepers = activeLineup.players.filter(p => p.position === 'POR');
  const defenders = activeLineup.players.filter(p => p.position === 'DEF');
  const midfielders = activeLineup.players.filter(p => p.position === 'MC');
  const forwards = activeLineup.players.filter(p => p.position === 'DEL');

  const getPositionName = (type: string) => {
    switch (type) {
      case 'POR': return 'Portero';
      case 'DEF': return 'Defensor';
      case 'MC': return 'Mediocentro';
      case 'DEL': return 'Delantero / Extremo';
      default: return type;
    }
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return 'bg-slate-800 text-slate-350';
    if (rating >= 8.0) return 'bg-emerald-450 border-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20';
    if (rating >= 7.0) return 'bg-teal-450 border-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/10';
    if (rating >= 6.0) return 'bg-sky-450 border-sky-400 text-slate-950 font-medium';
    return 'bg-amber-400 border-amber-350 text-slate-950 font-medium';
  };

  const getPlayerCoords = (player: Player) => {
    if (player.coordinates?.x !== undefined && player.coordinates?.y !== undefined) {
      return {
        x: Math.max(5, Math.min(95, player.coordinates.x)),
        y: Math.max(5, Math.min(95, player.coordinates.y))
      };
    }

    // Dynamic tactical coordinate plotter fallback
    let indexInTier = 0;
    let totalInTier = 1;

    switch (player.position) {
      case 'POR':
        return { x: 50, y: 10 };
      case 'DEF':
        indexInTier = defenders.indexOf(player);
        totalInTier = defenders.length || 1;
        break;
      case 'MC':
        indexInTier = midfielders.indexOf(player);
        totalInTier = midfielders.length || 1;
        break;
      case 'DEL':
        indexInTier = forwards.indexOf(player);
        totalInTier = forwards.length || 1;
        break;
    }

    const xOffset = totalInTier > 1 ? 15 + (70 / (totalInTier - 1)) * indexInTier : 50;
    const yValue = player.position === 'DEF' ? 30 : player.position === 'MC' ? 55 : 80;

    return { x: xOffset, y: yValue };
  };

  // Live calculation of tactical team stats
  const computeAverages = () => {
    const getAvg = (list: Player[]) => {
      const rated = list.filter(p => typeof p.rating === 'number' && p.rating > 0);
      if (rated.length === 0) return 0;
      return rated.reduce((sum, p) => sum + (p.rating || 0), 0) / rated.length;
    };

    return {
      global: getAvg(activeLineup.players),
      gk: getAvg(goalkeepers),
      def: getAvg(defenders),
      mc: getAvg(midfielders),
      del: getAvg(forwards),
    };
  };

  const avgs = computeAverages();

  const getPerformanceBadge = (avg: number) => {
    if (avg === 0) return 'S/C';
    return avg.toFixed(1);
  };

  // Perform interactive simulation swap
  const handlePerformSubstitution = (playerOnField: Player, substitutePlayer: Player) => {
    playTacticalSound('whistle');

    // Transfer field coordinates to the substitute player so they inherit the exact tactical positioning
    const updatedPlayers = activeLineup.players.map(p => {
      if (p.name === playerOnField.name) {
        return { 
          ...substitutePlayer, 
          coordinates: p.coordinates || getPlayerCoords(p) 
        };
      }
      return p;
    });

    const updatedSubstitutes = (activeLineup.substitutes || []).map(s => {
      if (s.name === substitutePlayer.name) {
        return { ...playerOnField, coordinates: undefined };
      }
      return s;
    });

    setActiveLineup({
      ...activeLineup,
      players: updatedPlayers,
      substitutes: updatedSubstitutes
    });

    // Record to substitutions ticker
    const simulatedMinute = Math.floor(Math.random() * 35) + 55; // Realistic substitution minute time
    setSubHistory(prev => [
      ...prev, 
      { minute: simulatedMinute, outPlayer: playerOnField.name, inPlayer: substitutePlayer.name }
    ]);

    // Select the newly swapped player on the field
    setSelectedPlayer({
      ...substitutePlayer,
      coordinates: playerOnField.coordinates || getPlayerCoords(playerOnField)
    });
    
    setSubSwapMode(false);
  };

  const handleResetLineup = () => {
    playTacticalSound('beep');
    setActiveLineup(lineup);
    setSelectedPlayer(null);
    setSubSwapMode(false);
    setSubHistory([]);
  };

  const hasSubstitutes = activeLineup.substitutes && activeLineup.substitutes.length > 0;
  const isModified = subHistory.length > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2x flex flex-col gap-4 relative overflow-hidden" id="football-pitch-visualizer">
      {/* Stadium ambient light overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col gap-3 z-10 w-full border-b border-slate-800/60 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono font-black">
                PIZARRA TÁCTICA ({activeLineup.formation})
              </span>
              {isModified && (
                <span className="text-[8.5px] bg-amber-950/80 text-amber-400 border border-amber-900/40 px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  Modificada Simulador
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-100 leading-tight truncate">{teamName}</h3>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Reset simulated tactical whiteboard */}
            {isModified && (
              <button
                type="button"
                onClick={handleResetLineup}
                title="Restaurar Alineación Original"
                className="p-1 px-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors text-[10px] font-mono flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3 h-3 text-emerald-400" />
                <span>Restaurar</span>
              </button>
            )}

            {/* Toggle standard views */}
            {hasSubstitutes && (
              <div className="flex bg-slate-950 p-1 border border-slate-800/60 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('titulares');
                    setSelectedPlayer(null);
                    setSubSwapMode(false);
                    playTacticalSound('beep');
                  }}
                  className={`px-3 py-1 text-[11px] font-black transition-all cursor-pointer rounded-lg ${
                    viewMode === 'titulares'
                      ? 'bg-slate-900 text-emerald-300 border border-slate-850 shadow-md'
                      : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  Titulares
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('suplentes');
                    setSelectedPlayer(null);
                    setSubSwapMode(false);
                    playTacticalSound('beep');
                  }}
                  className={`px-3 py-1 text-[11px] font-black transition-all cursor-pointer rounded-lg ${
                    viewMode === 'suplentes'
                      ? 'bg-slate-900 text-teal-300 border border-slate-850 shadow-md'
                      : 'text-slate-455 hover:text-slate-200'
                  }`}
                >
                  Banquillo ({activeLineup.substitutes!.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tactical ratings row */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/50 border border-slate-850 p-2.5 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider">Valoración Táctica:</span>
            
            <div className="flex gap-2">
              <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-md text-slate-300 font-bold border border-slate-800 flex items-center gap-1.5" title="Media Global del Once">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                GLO: <span className="text-emerald-300 font-extrabold">{getPerformanceBadge(avgs.global)}</span>
              </span>

              <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-md text-slate-400 font-medium border border-slate-800/50 hidden sm:inline" title="Media Defensiva">
                DEF: <span className="text-slate-200 font-bold">{getPerformanceBadge(avgs.def)}</span>
              </span>

              <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-md text-slate-400 font-medium border border-slate-800/50 hidden sm:inline" title="Media Mediocentros">
                MED: <span className="text-slate-200 font-bold">{getPerformanceBadge(avgs.mc)}</span>
              </span>

              <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-md text-slate-400 font-medium border border-slate-800/50 hidden sm:inline" title="Media Delantera">
                ATA: <span className="text-slate-200 font-bold">{getPerformanceBadge(avgs.del)}</span>
              </span>
            </div>
          </div>

          {/* Isometric Perspective Switcher */}
          {viewMode === 'titulares' && (
            <div className="flex bg-slate-900 p-0.5 border border-slate-800/80 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => {
                  setFieldPerspective('2d');
                  playTacticalSound('beep');
                }}
                className={`px-2.5 py-1 text-[9px] font-bold font-mono transition-all cursor-pointer rounded-md flex items-center gap-1 ${
                  fieldPerspective === '2d'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>2D</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFieldPerspective('3d');
                  playTacticalSound('beep');
                }}
                className={`px-2.5 py-1 text-[9px] font-bold font-mono transition-all cursor-pointer rounded-md flex items-center gap-1 ${
                  fieldPerspective === '3d'
                    ? 'bg-gradient-to-r from-emerald-950 to-emerald-900 hover:opacity-90 text-emerald-300 shadow-sm border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Pizarra 3D Isométrica Avanzada"
              >
                <Sliders className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>3D PRO</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Field area */}
      <div className="relative w-full overflow-hidden rounded-2xl [perspective:1400px]" id="perspective-pitch-fieldbox">
        <div 
          style={{
            transformStyle: 'preserve-3d',
            transform: fieldPerspective === '3d' 
              ? 'rotateX(33deg) rotateY(0deg) scale(0.95) translateY(-25px)' 
              : 'rotateX(0deg) scale(1)',
          }}
          className="relative w-full aspect-[4/5] bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-700 ease-out flex flex-col justify-between"
        >
          {/* Field lines and markings */}
          <div className="absolute inset-0 flex flex-col pointer-events-none opacity-[0.12]">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`flex-1 w-full ${idx % 2 === 0 ? 'bg-emerald-950' : 'bg-transparent'}`} 
              />
            ))}
          </div>

          {/* Markings */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/20 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Penalty boxes */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[62%] h-[20%] border-2 border-white/20 border-b-0 rounded-t-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[8%] border-2 border-white/20 border-b-0 rounded-t-lg pointer-events-none" />
          <div className="absolute bottom-1/2 translate-y-[200px] left-1/2 w-1.5 h-1.5 bg-white/40 rounded-full -translate-x-1/2 pointer-events-none" />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[62%] h-[20%] border-2 border-white/20 border-t-0 rounded-b-2xl pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[8%] border-2 border-white/20 border-t-0 rounded-b-lg pointer-events-none" />

          {/* Rendering starters */}
          {viewMode === 'titulares' ? (
            <div className="absolute inset-0 z-20 overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
              {activeLineup.players.map((player) => {
                const { x, y } = getPlayerCoords(player);
                const isSelected = selectedPlayer?.name === player.name;

                return (
                  <button
                    key={player.name}
                    style={{
                      left: `${x}%`,
                      top: `${100 - y}%`,
                      transformStyle: 'preserve-3d',
                      transform: `translate(-50%, -50%) ${
                        fieldPerspective === '3d' 
                          ? 'rotateX(-33deg) scale(1.18) translateY(-8px)' 
                          : 'none'
                      }`,
                    }}
                    onClick={() => {
                      setSelectedPlayer(player);
                      setSubSwapMode(false);
                      playTacticalSound('beep');
                    }}
                    className="absolute cursor-pointer group select-none transition-all duration-500 ease-out hover:scale-110 z-20 focus:outline-none"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`relative w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-tr from-yellow-400 to-amber-300 text-slate-950 border-white ring-4 ring-yellow-450/30 font-black' 
                          : isHome 
                            ? 'bg-gradient-to-tr from-slate-950 via-emerald-800 to-emerald-500 text-white border-emerald-300/40 shadow-emerald-950/60' 
                            : 'bg-gradient-to-tr from-slate-950 via-indigo-850 to-indigo-500 text-white border-indigo-300/40 shadow-indigo-950/60'
                      }`}>
                        <span className="text-[10px] font-mono font-black leading-none">
                          {player.number || player.name.slice(0, 2).toUpperCase()}
                        </span>

                        {player.rating && (
                          <span className={`absolute -top-1.5 -right-2 text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border border-slate-950 select-none ${getRatingColor(player.rating)}`}>
                            {player.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className={`mt-1 font-sans text-[8.5px] font-black px-1.5 py-0.5 rounded-md text-center max-w-[80px] truncate border transition-all duration-200 shadow-md ${
                        isSelected 
                          ? 'bg-yellow-400 text-slate-955 border-transparent font-black' 
                          : 'bg-slate-950/95 text-slate-100 border-slate-800/80 hover:border-slate-700/80'
                      }`}>
                        {player.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Backup bench list */
            <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 overflow-y-auto">
              <div className="mb-3 border-b border-slate-800/60 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block" />
                    Banquillo Inteligente ({activeLineup.substitutes!.length} suplentes)
                  </h4>
                  <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Listos para realizar cambios interactivos.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeLineup.substitutes?.map((player) => {
                  const isSelected = selectedPlayer?.name === player.name;
                  return (
                    <button
                      type="button"
                      key={player.name}
                      onClick={() => {
                        setSelectedPlayer(player);
                        setSubSwapMode(false);
                        playTacticalSound('beep');
                      }}
                      className={`p-2 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer select-none text-left focus:outline-none ${
                        isSelected
                          ? 'bg-gradient-to-tr from-yellow-400/20 to-amber-500/5 border-yellow-400 text-white'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6.5 h-6.5 rounded-lg text-[9.5px] font-mono font-black flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-yellow-400 text-slate-950 border-white'
                            : isHome
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                              : 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40'
                        }`}>
                          {player.number || 'SB'}
                        </div>
                        
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{player.name}</div>
                          <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                            <span className="font-extrabold text-[8px] text-slate-450 uppercase">{player.position}</span>
                            <span>•</span>
                            <span>{getPositionName(player.position)}</span>
                          </div>
                        </div>
                      </div>

                      {player.rating && (
                        <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-md border border-slate-950 shrink-0 ${getRatingColor(player.rating)}`}>
                          {player.rating.toFixed(1)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Substitutions simulated feed log */}
      {subHistory.length > 0 && (
        <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-2xl flex flex-col gap-1.5 z-10">
          <span className="text-[8.5px] font-mono font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <ArrowLeftRight className="w-3 h-3 text-emerald-400 animate-pulse" />
            HISTORIAL DE CAMBIOS SIMULADOS ({subHistory.length}):
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-[50px] overflow-y-auto">
            {subHistory.map((h, index) => (
              <span key={index} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 font-mono font-medium px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="text-emerald-450 font-extrabold">{h.minute}'</span>
                <span className="text-red-400 line-through max-w-[65px] truncate">{h.outPlayer}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400 font-bold max-w-[65px] truncate">{h.inPlayer}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interactive substitute controls */}
      {selectedPlayer ? (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 z-10 animate-fade-in flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
                isHome ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                #{selectedPlayer.number || '--'}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {selectedPlayer.name}
                  {activeLineup.substitutes?.some(s => s.name === selectedPlayer.name) && (
                    <span className="text-[8px] bg-sky-950 text-sky-400 border border-sky-900/50 px-1 py-0.2 rounded font-mono uppercase">
                      BANQUILLO
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9.5px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {getPositionName(selectedPlayer.position)}
                  </span>
                  <span className="text-[9.5px] text-slate-500 font-extrabold uppercase">{selectedPlayer.position}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedPlayer.rating && (
                <div className="text-right">
                  <div className="text-[9px] text-slate-500 font-mono font-bold uppercase">Rendimiento</div>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <span className={`text-xs font-black px-1.5 py-0.5 rounded-md border border-slate-950 ${getRatingColor(selectedPlayer.rating)}`}>
                      {selectedPlayer.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
              <button 
                onClick={() => {
                  setSelectedPlayer(null);
                  setSubSwapMode(false);
                  playTacticalSound('beep');
                }} 
                className="text-slate-500 hover:text-slate-300 p-1 bg-slate-900 border border-slate-800/80 hover:bg-slate-800 rounded-lg transition-all ml-1 font-black text-sm cursor-pointer w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>

          {/* Interactive swap action triggers */}
          {hasSubstitutes && (
            <div className="border-t border-slate-900/60 pt-2.5 flex flex-col gap-2">
              {!subSwapMode ? (
                /* Starter selected: options to trigger swap panel */
                activeLineup.players.some(p => p.name === selectedPlayer.name) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSubSwapMode(true);
                      playTacticalSound('beep');
                    }}
                    className="w-full bg-emerald-950/40 border border-emerald-900/50 hover:bg-emerald-900/40 text-emerald-450 hover:text-emerald-300 py-1.5 px-3 rounded-xl text-[10.5px] font-black font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>REALIZAR CAMBIO INTERACTIVO</span>
                  </button>
                ) : (
                  /* Substitute player selected: option to insert into eleven */
                  <button
                    type="button"
                    onClick={() => {
                      setSubSwapMode(true);
                      playTacticalSound('beep');
                    }}
                    className="w-full bg-teal-950/40 border border-teal-900/40 hover:bg-teal-900/40 text-teal-400 hover:text-teal-300 py-1.5 px-3 rounded-xl text-[10.5px] font-black font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>ALINEAR DE TITULAR (CAMBIAR)</span>
                  </button>
                )
              ) : (
                /* SubSwap Active Swap Options Panel */
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-2 animate-fade-in">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-450 uppercase pb-1.5 border-b border-slate-800/60">
                    <span>
                      {activeLineup.players.some(p => p.name === selectedPlayer.name) 
                        ? 'Selecciona el suplente de entrada:' 
                        : 'Selecciona jugador titular a sustituir:'}
                    </span>
                    <button 
                      onClick={() => setSubSwapMode(false)}
                      className="text-red-400 hover:text-red-300 hover:underline uppercase"
                    >
                      Cancelar
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto">
                    {activeLineup.players.some(p => p.name === selectedPlayer.name) 
                      ? /* STARTER SELECTED: show subs list */
                        activeLineup.substitutes?.map((sub) => (
                          <button
                            key={sub.name}
                            type="button"
                            onClick={() => handlePerformSubstitution(selectedPlayer, sub)}
                            className="p-1 px-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-350 hover:bg-slate-900 hover:border-emerald-500/40 text-[10.5px] text-left truncate hover:text-white font-mono flex justify-between items-center cursor-pointer"
                          >
                            <span className="truncate">#{sub.number || 'SB'} {sub.name}</span>
                            <span className="text-[8.5px] text-emerald-400 font-bold">({sub.position})</span>
                          </button>
                        ))
                      : /* SUB SELECTED: show starters list of matching/any position */
                        activeLineup.players.map((titular) => (
                          <button
                            key={titular.name}
                            type="button"
                            onClick={() => handlePerformSubstitution(titular, selectedPlayer)}
                            className="p-1 px-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-350 hover:bg-slate-900 hover:border-teal-550 text-[10.5px] text-left truncate hover:text-white font-mono flex justify-between items-center cursor-pointer"
                          >
                            <span className="truncate">#{titular.number || 'SB'} {titular.name}</span>
                            <span className="text-[8.5px] text-teal-400 font-bold">({titular.position})</span>
                          </button>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-2.5 px-3 bg-slate-950/35 border border-slate-800/50 rounded-2xl text-[10px] text-slate-500 flex items-center justify-center gap-1.5 z-10">
          <HelpCircle className="w-3.5 h-3.5 text-slate-600 animate-pulse" />
          <span>Haz clic en un futbolista sobre el campo o banquillo para ver su analítica o realizar cambios interactivos.</span>
        </div>
      )}

      {/* Position roster block */}
      <div className="border-t border-slate-800/60 pt-3 z-10">
        <h4 className="text-[10px] font-mono tracking-wider font-extrabold text-slate-500 uppercase mb-2">Alineación Táctica Actual:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-slate-950/30 px-2.5 py-1.5 rounded-xl border border-slate-800/30">
            <span className="text-emerald-450 font-bold block mb-0.5">Portero</span>
            <span className="text-slate-300 font-semibold truncate block">
              {goalkeepers[0]?.name || 'No definido'}
            </span>
          </div>
          <div className="bg-slate-950/30 px-2.5 py-1.5 rounded-xl border border-slate-800/30">
            <span className="text-emerald-450 font-bold block mb-0.5">Defensas ({defenders.length})</span>
            <span className="text-slate-400 truncate block">
              {defenders.map(d => d.name).slice(0, 2).join(', ')}...
            </span>
          </div>
          <div className="bg-slate-950/30 px-2.5 py-1.5 rounded-xl border border-slate-800/30">
            <span className="text-emerald-450 font-bold block mb-0.5">Medios ({midfielders.length})</span>
            <span className="text-slate-400 truncate block">
              {midfielders.map(m => m.name).slice(0, 2).join(', ')}...
            </span>
          </div>
          <div className="bg-slate-950/30 px-2.5 py-1.5 rounded-xl border border-slate-800/30">
            <span className="text-emerald-450 font-bold block mb-0.5">Delanteros ({forwards.length})</span>
            <span className="text-slate-400 truncate block">
              {forwards.map(f => f.name).slice(0, 2).join(', ')}...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
