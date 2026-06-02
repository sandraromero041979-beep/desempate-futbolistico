export interface Player {
  name: string;
  number?: number;
  position: 'POR' | 'DEF' | 'MC' | 'DEL'; // Goalkeeper, Defender, Midfielder, Forward
  coordinates?: {
    x: number; // 5 to 95 for field percentage layout
    y: number; // 5 to 95 for field percentage layout
  };
  rating?: number; // Evaluation scale, e.g. 7.5
}

export interface Lineup {
  formation: string; // e.g., "4-3-3", "4-4-2"
  players: Player[];
  substitutes?: Player[]; // Optional array for substitute players
}

export interface MatchEvent {
  minute: number;
  type: 'Gol' | 'Tarjeta Roja' | 'Tarjeta Amarilla' | 'Lesión' | 'Penalti' | 'Cambio';
  team: string; // Nom de la escuadra
  player: string; // Jugador involucrado
  detail?: string; // Asistencias u observaciones
}

export interface MatchStats {
  possessionHome: number;
  possessionAway: number;
  shotsHome?: number;
  shotsAway?: number;
  foulsHome?: number;
  foulsAway?: number;
}

export interface SoccerMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'Finalizado' | 'Por jugar' | 'En juego';
  date: string;
  stadium?: string;
  summary: string;
  keyEvents: MatchEvent[];
  stats?: MatchStats;
  homeLineup: Lineup;
  awayLineup: Lineup;
}

export interface InfoSource {
  url: string;
  name: string;
  category: string;
  snippet?: string;
  credibility?: string;
}

export interface SoccerAnalysisResponse {
  competition: string;
  period: string;
  matches: SoccerMatch[];
  sources?: (string | InfoSource)[];
}

export interface SavedSearch {
  id: string;
  queryTeamOrLeague: string;
  queryDetail: string;
  createdAt: string;
  data: SoccerAnalysisResponse;
}
