import React, { useState, useEffect, useRef } from 'react';
import { SoccerMatch, Player } from '../types';
import { 
  Dribbble, 
  Play, 
  Square, 
  RotateCcw, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Gamepad2, 
  Tv, 
  Gauge, 
  Activity, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface PredictiveArenaProps {
  match: SoccerMatch;
}

interface SimulatedEvent {
  minute: number;
  type: 'Gol' | 'Atajada' | 'Falta' | 'Tarjeta Amarilla' | 'Palo' | 'Ocasión Errada' | 'Cambio' | 'Inicio' | 'Fin';
  team: string;
  playerText: string;
  narrative: string;
}

export default function PredictiveArena({ match }: PredictiveArenaProps) {
  // Simulator tactical configurations
  const [strategyHome, setStrategyHome] = useState<'Ataque' | 'Posesión' | 'Contraataque' | 'Cerrojo'>('Ataque');
  const [strategyAway, setStrategyAway] = useState<'Ataque' | 'Posesión' | 'Contraataque' | 'Cerrojo'>('Contraataque');
  const [aggressionHome, setAggressionHome] = useState<'Sutil' | 'Media' | 'Bravía'>('Media');
  const [aggressionAway, setAggressionAway] = useState<'Sutil' | 'Media' | 'Bravía'>('Bravía');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);
  const [xgHome, setXgHome] = useState(0.0);
  const [xgAway, setXgAway] = useState(0.0);
  const [simulationEvents, setSimulationEvents] = useState<SimulatedEvent[]>([]);
  const [shotsHome, setShotsHome] = useState(0);
  const [shotsAway, setShotsAway] = useState(1);
  const [foulsHome, setFoulsHome] = useState(0);
  const [foulsAway, setFoulsAway] = useState(0);
  const [savesHome, setSavesHome] = useState(0);
  const [savesAway, setSavesAway] = useState(0);

  // Chart data matching recharts standard
  const [chartData, setChartData] = useState<{ minute: number; xgHome: number; xgAway: number }[]>([
    { minute: 0, xgHome: 0, xgAway: 0 }
  ]);

  // Simulated events pool
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synthesize custom sound wave feedback
  const playSynthSound = (type: 'kickoff' | 'goal' | 'card' | 'miss') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'kickoff') {
        // High-pitched whistle
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'card') {
        // Quick buzz warning
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'miss') {
        // Deep crowd sigh sweep
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (type === 'goal') {
        // Double whistle + dramatic roar
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.02, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.82);

        // Simulated noise generator for crowd cheer
        const bufferSize = ctx.sampleRate * 1.5; // 1.5s roar
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        // Bandpass filter to make noise sound organic like waves of applause
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 350;
        filter.Q.value = 1.0;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);

        whiteNoise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        whiteNoise.start(now);
      }
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  // Helper to extract official starting player from lineup
  const getRandomSourcedPlayer = (team: 'home' | 'away') => {
    const list = team === 'home' ? match.homeLineup.players : match.awayLineup.players;
    if (list && list.length > 0) {
      return list[Math.floor(Math.random() * list.length)];
    }
    return { name: "Estrella", number: 10, position: "DEL", rating: 8 };
  };

  // Stop simulation on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartSimulation = () => {
    if (currentMinute >= 90) {
      // Auto-restart if already completed
      handleReset();
    }
    setIsSimulating(true);
    playSynthSound('kickoff');
  };

  const handlePauseSimulation = () => {
    setIsSimulating(false);
  };

  const handleReset = () => {
    setIsSimulating(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentMinute(0);
    setScoreHome(0);
    setScoreAway(0);
    setXgHome(0.0);
    setXgAway(0.0);
    setShotsHome(1);
    setShotsAway(1);
    setFoulsHome(0);
    setFoulsAway(0);
    setSavesHome(0);
    setSavesAway(0);
    setSimulationEvents([
      {
        minute: 0,
        type: 'Inicio',
        team: 'Sistema',
        playerText: 'Árbitro Principal',
        narrative: '¡Pitazo inicial! El silbante autoriza el rodaje del balón. Se pone a prueba el software de Arena de Predicción Táctica.'
      }
    ]);
    setChartData([{ minute: 0, xgHome: 0, xgAway: 0 }]);
  };

  // Core ticking effect loop
  useEffect(() => {
    if (!isSimulating) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentMinute(prevMin => {
        const nextMin = prevMin + Math.floor(Math.random() * 3) + 1; // Faster steps (1 to 3 minutes skip)
        
        if (nextMin >= 90) {
          setIsSimulating(false);
          if (timerRef.current) clearInterval(timerRef.current);
          
          // Triple whistle fulltime
          setTimeout(() => playSynthSound('kickoff'), 100);
          setTimeout(() => playSynthSound('kickoff'), 350);
          setTimeout(() => playSynthSound('kickoff'), 600);

          // Add final event
          setSimulationEvents(prev => [
            ...prev,
            {
              minute: 90,
              type: 'Fin',
              team: 'Final',
              playerText: 'Árbitro Principal',
              narrative: `¡Final de la batalla! El marcador se detiene en Local ${scoreHome} - ${scoreAway} Visitante. xG acumulado: ${xgHome.toFixed(2)} vs ${xgAway.toFixed(2)}.`
            }
          ]);
          return 90;
        }

        // Random generator engine to simulate match balance based on strategic coefficients
        const factorHome = strategyHome === 'Ataque' ? 1.3 : strategyHome === 'Posesión' ? 1.0 : strategyHome === 'Contraataque' ? 1.1 : 0.7;
        const factorAway = strategyAway === 'Ataque' ? 1.3 : strategyAway === 'Posesión' ? 1.0 : strategyAway === 'Contraataque' ? 1.1 : 0.7;

        const aggHomeVal = aggressionHome === 'Bravía' ? 1.4 : aggressionHome === 'Media' ? 1.0 : 0.7;
        const aggAwayVal = aggressionAway === 'Bravía' ? 1.4 : aggressionAway === 'Media' ? 1.0 : 0.7;

        // Chance of any tactical occurrence this minute block
        const randVal = Math.random();

        // 1. Expected goals increase math (cumulative)
        const minXgHome = parseFloat(((Math.random() * 0.06) * factorHome).toFixed(2));
        const minXgAway = parseFloat(((Math.random() * 0.05) * factorAway).toFixed(2));
        
        const newXgHome = parseFloat((xgHome + minXgHome).toFixed(2));
        const newXgAway = parseFloat((xgAway + minXgAway).toFixed(2));

        setXgHome(newXgHome);
        setXgAway(newXgAway);

        // Update plot points
        setChartData(prev => [...prev, { minute: nextMin, xgHome: newXgHome, xgAway: newXgAway }]);

        // 2. Play events logic
        if (randVal < 0.22) {
          // Play event happens!
          const isHomeAction = Math.random() * (factorHome + 0.1) > Math.random() * (factorAway + 0.1);
          const activeTeam = isHomeAction ? match.homeTeam : match.awayTeam;
          const defenseTeam = isHomeAction ? match.awayTeam : match.homeTeam;
          const player = getRandomSourcedPlayer(isHomeAction ? 'home' : 'away');
          const defender = getRandomSourcedPlayer(!isHomeAction ? 'home' : 'away');

          let eventType: 'Gol' | 'Atajada' | 'Tarjeta Amarilla' | 'Palo' | 'Ocasión Errada' | 'Falta' = 'Ocasión Errada';
          let localScoreChange = 0;
          let awayScoreChange = 0;
          let narrativeMsg = "";

          const triggerRand = Math.random();

          if (triggerRand < 0.20 && (isHomeAction ? newXgHome > scoreHome : newXgAway > scoreAway)) {
            // GOAL SCORING MOMENT!
            eventType = 'Gol';
            narrativeMsg = `¡¡GOOOOOL DE ${activeTeam.toUpperCase()}!! El dorsal #${player.number} ${player.name} saca un latigazo cruzado inapelable superando al bloque defensivo.`;
            if (isHomeAction) {
              setScoreHome(sh => {
                localScoreChange = sh + 1;
                return sh + 1;
              });
            } else {
              setScoreAway(sa => {
                awayScoreChange = sa + 1;
                return sa + 1;
              });
            }
            if (isHomeAction) setShotsHome(s => s + 1); else setShotsAway(s => s + 1);
            playSynthSound('goal');

          } else if (triggerRand < 0.45) {
            // Goalkeeper spectacular save
            eventType = 'Atajada';
            narrativeMsg = `¡Espectacular parada! ${player.name} remató con saña abajo, pero el guardameta de ${defenseTeam} desvía al córner con la punta de los guantes.`;
            if (isHomeAction) {
              setShotsHome(s => s + 1);
              setSavesAway(sa => sa + 1);
            } else {
              setShotsAway(s => s + 1);
              setSavesHome(sh => sh + 1);
            }
            playSynthSound('miss');

          } else if (triggerRand < 0.65) {
            // Rough foul / card warning
            eventType = 'Falta';
            const getsCard = Math.random() * (isHomeAction ? aggHomeVal : aggAwayVal) > 0.9;
            if (getsCard) {
              eventType = 'Tarjeta Amarilla';
              narrativeMsg = `¡Tarjeta amarilla! #${defender.number} ${defender.name} de ${defenseTeam} propina una zancadilla táctica descarada para frenar la transición.`;
              playSynthSound('card');
            } else {
              narrativeMsg = `Falta pitada. Choque impetuoso entre ${player.name} y el central ${defender.name}. El árbitro calma los ánimos.`;
            }
            if (isHomeAction) setFoulsAway(f => f + 1); else setFoulsHome(f => f + 1);

          } else if (triggerRand < 0.78) {
            // Hit the woodwork!
            eventType = 'Palo';
            narrativeMsg = `¡¡AL PALO!! Increíble vaselina de ${player.name} que se estrella directametne en la cruceta de pórtico. ¡Se salvó ${defenseTeam}!`;
            if (isHomeAction) setShotsHome(s => s + 1); else setShotsAway(s => s + 1);
            playSynthSound('miss');

          } else {
            // Over the crossbar
            eventType = 'Ocasión Errada';
            narrativeMsg = `Ocasión fallida. #${player.number} ${player.name} saca un disparo desviado que se pierde por encima de la grada de animación.`;
            if (isHomeAction) setShotsHome(s => s + 1); else setShotsAway(s => s + 1);
            playSynthSound('miss');
          }

          setSimulationEvents(prev => [
            ...prev,
            {
              minute: nextMin,
              type: eventType,
              team: activeTeam,
              playerText: player.name,
              narrative: narrativeMsg
            }
          ]);
        }

        return nextMin;
      });
    }, 1200); // Step every 1.2s
  }, [isSimulating, strategyHome, strategyAway, aggressionHome, aggressionAway, xgHome, xgAway, scoreHome, scoreAway]);

  const renderSimEventIcon = (type: string) => {
    switch (type) {
      case 'Gol': return '⚽';
      case 'Atajada': return '🧤';
      case 'Tarjeta Amarilla': return '🟨';
      case 'Palo': return '🥅';
      case 'Falta': return '🛑';
      case 'Inicio': return '⏱️';
      case 'Fin': return '🏁';
      default: return '👟';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden" id="premium-predictive-arena">
      <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[180px] h-[180px] bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Arena Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5 mb-6">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Tactical Simulator Arena v1.0
          </span>
          <h3 className="text-sm md:text-base font-bold text-slate-100 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            Arena de Simulación y Predicción de xG con Coeficiente IA
          </h3>
          <p className="text-[10px] text-slate-400 max-w-xl font-medium leading-relaxed">
            Personaliza los esquemas estratégicos de ambos equipos basados en sus alineaciones y observa la evolución física, estadísticas de posesión, incidencias y Expected Goals (xG) en tiempo real.
          </p>
        </div>

        {/* Audio control button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 px-3 rounded-xl border text-[10px] font-mono font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
            soundEnabled 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
              : 'bg-slate-950 border-slate-850 text-slate-500'
          }`}
          title="Sonar pitidos del árbitro e hinchas"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          <span>{soundEnabled ? 'Efectos Activos' : 'Silencio'}</span>
        </button>
      </div>

      {/* Simulator Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Col: Setup strategies for Home & Away */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 bg-slate-950/60 border border-slate-850 p-4.5 rounded-2xl">
          
          <div className="space-y-4">
            <h4 className="text-[10.5px] font-mono font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Configuración de Directiva Táctica
            </h4>

            {/* Local settings */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest block">{match.homeTeam} (Local)</span>
              <div>
                <label className="text-[9.5px] text-slate-400 block mb-1">Filosofía de Juego:</label>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {(['Ataque', 'Posesión', 'Contraataque', 'Cerrojo'] as const).map(strat => (
                    <button
                      key={strat}
                      disabled={isSimulating}
                      onClick={() => setStrategyHome(strat)}
                      className={`py-1 rounded-md border text-[9.5px] font-bold cursor-pointer transition-colors ${
                        strategyHome === strat
                          ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350 disabled:cursor-not-allowed'
                      }`}
                    >
                      {strat === 'Ataque' ? '🔥 Ataque' : strat === 'Posesión' ? '⚽ Control' : strat === 'Contraataque' ? '⚡ Contra' : '🛡️ Cerrojo'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-1.5">
                <label className="text-[9.5px] text-slate-400 block mb-1">Intensidad Física:</label>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  {(['Sutil', 'Media', 'Bravía'] as const).map(agg => (
                    <button
                      key={agg}
                      disabled={isSimulating}
                      onClick={() => setAggressionHome(agg)}
                      className={`py-1 rounded-md border text-[9px] font-bold cursor-pointer transition-colors ${
                        aggressionHome === agg
                          ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350 disabled:cursor-not-allowed'
                      }`}
                    >
                      {agg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Away settings */}
            <div className="space-y-2.5 pt-4 border-t border-slate-900">
              <span className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-widest block">{match.awayTeam} (Visitante)</span>
              <div>
                <label className="text-[9.5px] text-slate-400 block mb-1">Filosofía de Juego:</label>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {(['Ataque', 'Posesión', 'Contraataque', 'Cerrojo'] as const).map(strat => (
                    <button
                      key={strat}
                      disabled={isSimulating}
                      onClick={() => setStrategyAway(strat)}
                      className={`py-1 rounded-md border text-[9.5px] font-bold cursor-pointer transition-colors ${
                        strategyAway === strat
                          ? 'bg-indigo-505 bg-indigo-500/10 border-indigo-500/60 text-indigo-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-350 disabled:cursor-not-allowed'
                      }`}
                    >
                      {strat === 'Ataque' ? '🔥 Ataque' : strat === 'Posesión' ? '⚽ Control' : strat === 'Contraataque' ? '⚡ Contra' : '🛡️ Cerrojo'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-1.5">
                <label className="text-[9.5px] text-slate-400 block mb-1">Intensidad Física:</label>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  {(['Sutil', 'Media', 'Bravía'] as const).map(agg => (
                    <button
                      key={agg}
                      disabled={isSimulating}
                      onClick={() => setAggressionAway(agg)}
                      className={`py-1 rounded-md border text-[9px] font-bold cursor-pointer transition-colors ${
                        aggressionAway === agg
                          ? 'bg-indigo-500/10 border-indigo-500/60 text-indigo-400'
                          : 'bg-slate-900 border-slate-800 text-slate-405 hover:text-slate-350 disabled:cursor-not-allowed'
                      }`}
                    >
                      {agg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Action Simulation buttons */}
          <div className="pt-4 border-t border-slate-900 flex flex-wrap gap-2">
            {!isSimulating ? (
              <button
                onClick={handleStartSimulation}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all text-center"
              >
                <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                <span>Simular Partido</span>
              </button>
            ) : (
              <button
                onClick={handlePauseSimulation}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-100 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Square className="w-3.5 h-3.5 text-slate-100 fill-slate-100" />
                <span>Pausar</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer transition-colors active:scale-95"
              title="Reiniciar simulador"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </button>
          </div>

        </div>

        {/* Center/Right Col: Real-time Live Metrics, Scores & Interactive charts */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Live scoreboard */}
          <div className="bg-slate-950 border border-slate-850 p-4.5 rounded-2xl relative overflow-hidden">
            {/* Field vertical pitch grid overlay */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] border-b border-dashed border-slate-800" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="text-right flex-1 pr-4">
                <span className="text-xs font-black text-slate-100 block truncate">{match.homeTeam}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-black italic">{strategyHome} • {aggressionHome}</span>
              </div>

              {/* Large Score Plate */}
              <div className="flex flex-col items-center justify-center px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl shadow-inner font-mono text-center shrink-0 min-w-[130px]">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-black text-white">{scoreHome}</span>
                  <span className="text-slate-600 font-black">:</span>
                  <span className="text-2xl font-black text-white">{scoreAway}</span>
                </div>
                
                <div className="mt-1 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[11px] font-black text-rose-500">{currentMinute}'</span>
                </div>
              </div>

              <div className="text-left flex-1 pl-4">
                <span className="text-xs font-black text-slate-100 block truncate">{match.awayTeam}</span>
                <span className="text-[10px] text-indigo-400 font-mono font-black italic">{strategyAway} • {aggressionAway}</span>
              </div>
            </div>

            {/* Quick Simulated Stat bars */}
            <div className="grid grid-cols-3 gap-2.5 mt-5 pt-3.5 border-t border-slate-900 text-center font-mono text-[10.5px] text-slate-400">
              <div>
                <div className="flex justify-between items-center text-[9.5px]">
                  <span className="text-emerald-400 font-black">{xgHome.toFixed(2)}</span>
                  <span className="uppercase text-[8px] font-sans font-black text-slate-655">xG Acumulado</span>
                  <span className="text-indigo-400 font-black">{xgAway.toFixed(2)}</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden flex">
                  <div style={{ width: `${(xgHome / (xgHome + xgAway || 1)) * 100}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${(xgAway / (xgHome + xgAway || 1)) * 100}%` }} className="bg-indigo-500 h-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[9.5px]">
                  <span className="text-emerald-400 font-black">{shotsHome}</span>
                  <span className="uppercase text-[8px] font-sans font-black text-slate-655">Remates</span>
                  <span className="text-indigo-400 font-black">{shotsAway}</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden flex">
                  <div style={{ width: `${(shotsHome / (shotsHome + shotsAway || 1)) * 100}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${(shotsAway / (shotsHome + shotsAway || 1)) * 100}%` }} className="bg-indigo-500 h-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[9.5px]">
                  <span className="text-emerald-400 font-black">{savesHome}</span>
                  <span className="uppercase text-[8px] font-sans font-black text-slate-655">Atajadas</span>
                  <span className="text-indigo-400 font-black">{savesAway}</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden flex">
                  <div style={{ width: `${(savesHome / (savesHome + savesAway || 1)) * 100}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${(savesAway / (savesHome + savesAway || 1)) * 100}%` }} className="bg-indigo-500 h-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Area Chart: xG Evolution */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl">
            <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-3 text-center">Curva de xG Predictiva en vivo (Tiempo Real vs xG esperado)</span>
            
            <div className="h-[140px] w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorXgHome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorXgAway" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="minute" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                    labelFormatter={(label) => `Minuto: ${label}'`}
                  />
                  <Area type="monotone" name={`${match.homeTeam} xG`} dataKey="xgHome" stroke="#10b981" fillOpacity={1} fill="url(#colorXgHome)" strokeWidth={2} />
                  <Area type="monotone" name={`${match.awayTeam} xG`} dataKey="xgAway" stroke="#6366f1" fillOpacity={1} fill="url(#colorXgAway)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live broadcast text commentary ticker */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3 flex-1 min-h-[150px] max-h-[190px] overflow-hidden">
            <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest block shrink-0 border-b border-slate-900 pb-1.5 flex items-center justify-between">
              <span>Relato en directo y Transmisión radial</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 font-bold uppercase text-[8px]">En vivo</span>
            </span>

            {/* Scrollable commentary feed */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1" id="commentary-feed-scroller">
              {simulationEvents
                .slice()
                .reverse()
                .map((evt, idx) => (
                  <div key={idx} className="text-xs font-mono animate-fade-in flex items-start gap-2 text-slate-300">
                    <span className="text-emerald-400 font-extrabold shrink-0">[{evt.minute}']</span>
                    <span className="shrink-0 font-black">{renderSimEventIcon(evt.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="leading-relaxed">
                        <span className="text-slate-100 font-bold mr-1">{evt.playerText}:</span>
                        {evt.narrative}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
