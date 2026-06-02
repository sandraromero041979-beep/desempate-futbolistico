import React, { useState, useEffect } from 'react';
import SoccerHistory from './components/SoccerHistory';
import MatchDetails from './components/MatchDetails';
import PredictiveArena from './components/PredictiveArena';
import { SoccerAnalysisResponse, SoccerMatch, SavedSearch } from './types';
import { 
  Trophy, 
  Search, 
  Plus, 
  HelpCircle, 
  Compass, 
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  Globe
} from 'lucide-react';

const PRESETS_SOCCER = [
  {
    label: "LaLiga EA Sports 🇪🇸",
    queryTeamOrLeague: "LaLiga EA Sports",
    queryDetail: "Última jornada y resultados de la semana actual"
  },
  {
    label: "UEFA Champions League 🇪🇺",
    queryTeamOrLeague: "UEFA Champions League",
    queryDetail: "Partidos de cuartos, semifinales o final reciente"
  },
  {
    label: "Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    queryTeamOrLeague: "Premier League de Inglaterra",
    queryDetail: "Últimos partidos y posiciones de la semana"
  },
  {
    label: "Real Madrid CF ⚪",
    queryTeamOrLeague: "Real Madrid CF",
    queryDetail: "Resultados de los últimos 2 partidos y alineaciones titulares"
  },
  {
    label: "FC Barcelona 🔵🔴",
    queryTeamOrLeague: "FC Barcelona",
    queryDetail: "Último partido jugado, alineación y marcadores"
  },
  {
    label: "CD Lugo 🔴⚪",
    queryTeamOrLeague: "CD Lugo en Primera Federación",
    queryDetail: "Último partido, clasificación de su grupo y alineación"
  }
];

const CATEGORIZED_LEAGUES = {
  espana: {
    title: "Competiciones de España 🇪🇸",
    description: "Ligas de primera, segunda divisiones, Copa del Rey, ligas femeninas, Primera Federación y clubes destacados como el CD Lugo.",
    items: [
      {
        label: "LaLiga EA Sports 🇪🇸",
        queryTeamOrLeague: "LaLiga EA Sports de España",
        queryDetail: "Última jornada y resultados de la semana actual",
        desc: "Primera División del fútbol profesional español con los mejores clubes como Barcelona y Real Madrid."
      },
      {
        label: "LaLiga Hypermotion 🌪️",
        queryTeamOrLeague: "LaLiga Hypermotion de España",
        queryDetail: "Clasificación y partidos de la última jornada",
        desc: "Segunda División de España. Una de las ligas más competitivas e igualadas de Europa."
      },
      {
        label: "Primera Federación (CD Lugo) 🛡️",
        queryTeamOrLeague: "Primera Federación RFEF Grupo 1 de España",
        queryDetail: "Partidos, clasificación y grupo de la semana",
        desc: "La categoría de bronce del fútbol español donde compite el Club Deportivo Lugo y otros clubes históricos buscando el ascenso al fútbol profesional."
      },
      {
        label: "CD Lugo 🔴⚪",
        queryTeamOrLeague: "CD Lugo en Primera Federacion de España",
        queryDetail: "Últimos resultados del CD Lugo, calendario y alineaciones",
        desc: "Accede directamente al análisis del Club Deportivo Lugo en su categoría actual con fichas de juego detalladas."
      },
      {
        label: "Copa del Rey 👑",
        queryTeamOrLeague: "Copa del Rey de España",
        queryDetail: "Eliminatorias o partidos más recientes jugados",
        desc: "El emocionante campeonato de España que enfrenta a clubes de todas las categorías."
      },
      {
        label: "Supercopa de España ⚡",
        queryTeamOrLeague: "Supercopa de España",
        queryDetail: "Semifinales y final del torneo más reciente",
        desc: "Torneo que enfrenta a los campeones y subcampeones de Liga y Copa en un formato final-four."
      },
      {
        label: "Liga Femenina (Liga F) 👩",
        queryTeamOrLeague: "Liga F Femenina de España",
        queryDetail: "Últimos marcadores de la jornada y clasificación",
        desc: "Primera División Femenina, liderada por potencias globales como el FC Barcelona Femení."
      }
    ]
  },
  europa: {
    title: "Competiciones Europeas 🇪🇺",
    description: "Grandes campeonatos domésticos del continente europeo y torneos de confederación UEFA.",
    items: [
      {
        label: "UEFA Champions League ⭐",
        queryTeamOrLeague: "UEFA Champions League",
        queryDetail: "Última jornada de partidos de liga o fase final",
        desc: "La Champions: mayor competición de clubes europea con partidos de trascendencia mundial."
      },
      {
        label: "UEFA Europa League 🏆",
        queryTeamOrLeague: "UEFA Europa League",
        queryDetail: "Resultados y marcadores de los últimos encuentros",
        desc: "Copa de clubes europea que reúne a grandes escuadras de las ligas más potentes."
      },
      {
        label: "UEFA Conference League 💫",
        queryTeamOrLeague: "UEFA Conference League",
        queryDetail: "Partidos y fase final de la semana pasada",
        desc: "Competido torneo de la UEFA para clubes emergentes de todo el panorama europeo."
      },
      {
        label: "Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        queryTeamOrLeague: "Premier League de Inglaterra",
        queryDetail: "Últimos resultados de la jornada y tabla de clasificación",
        desc: "La máxima división del fútbol inglés conocida por su intensidad y juego directo de alta velocidad."
      },
      {
        label: "Serie A 🇮🇹",
        queryTeamOrLeague: "Serie A de Italia",
        queryDetail: "Partidos jugados esta semana e incidencias de goles",
        desc: "La Primera División italiana: rigurosidad táctica, históricos clubes y estrellas mundiales."
      },
      {
        label: "Bundesliga Alemán 🇩🇪",
        queryTeamOrLeague: "Bundesliga de Alemania",
        queryDetail: "Resultados de la jornada y goleadores actuales",
        desc: "Liga de fútbol de Alemania, famosa por estadios repletos, ritmo ofensivo y gran cantera."
      },
      {
        label: "Ligue 1 de Francia 🇫🇷",
        queryTeamOrLeague: "Ligue 1 de Francia",
        queryDetail: "Marcadores de los últimos partidos disputados",
        desc: "Liga nacional de Francia presidida por el talento joven y la velocidad atlética."
      },
      {
        label: "Eredivisie Holanda 🇳🇱",
        queryTeamOrLeague: "Eredivisie de Países Bajos",
        queryDetail: "Resultados recientes de la jornada de fútbol",
        desc: "Fútbol ofensivo neerlandés donde se forman talentos emblemáticos de Europa."
      },
      {
        label: "Primeira Liga Portugal 🇵🇹",
        queryTeamOrLeague: "Primeira Liga de Portugal",
        queryDetail: "Última jornada jugada, marcadores y goles",
        desc: "La máxima categoría portuguesa protagonizada por Benfica, Porto y Sporting."
      }
    ]
  },
  mundo: {
    title: "Campeonatos Mundiales y de América 🌎",
    description: "Torneos intercontinentales, copas de selecciones de prestigio y las mejores ligas de América.",
    items: [
      {
        label: "Copa Mundial de la FIFA 🌍",
        queryTeamOrLeague: "Copa Mundial de la FIFA",
        queryDetail: "Últimos partidos disputados, clasificaciones o eliminatorias",
        desc: "El torneo absoluto de selecciones nacionales masculinas organizado por la FIFA."
      },
      {
        label: "Copa América 🏆",
        queryTeamOrLeague: "Copa América de Fútbol",
        queryDetail: "Resultados de partidos, grupos o eliminatorias",
        desc: "La corona de selecciones de CONMEBOL que reúne el vibrante y apasionado balompié americano."
      },
      {
        label: "Eurocopa de Selecciones 🇪🇺",
        queryTeamOrLeague: "Eurocopa de Fútbol UEFA",
        queryDetail: "Resultados más recientes y partidos jugados",
        desc: "El máximo galardón para las selecciones nacionales afiliadas a la UEFA."
      },
      {
        label: "Copa Libertadores 🌋",
        queryTeamOrLeague: "Copa CONMEBOL Libertadores de América",
        queryDetail: "Partidos de la fase de grupos o de eliminación esta semana",
        desc: "La gloria eterna sudamericana. La copa de clubes con mayor mística y pasión del planeta."
      },
      {
        label: "MLS Major League Soccer 🇺🇸",
        queryTeamOrLeague: "MLS Major League Soccer de Estados Unidos",
        queryDetail: "Últimos partidos y clasificación de la conferencia",
        desc: "Liga de fútbol norteamericana que goza de gran crecimiento y estrellas franquicia."
      },
      {
        label: "Liga MX de México 🇲🇽",
        queryTeamOrLeague: "Liga MX de Fútbol Mexicano",
        queryDetail: "Marcadores e incidencias de la última jornada o liguilla",
        desc: "Vistoso torneo mexicano caracterizado por liguillas de enorme emoción y afición fiel."
      },
      {
        label: "Brasileirão Série A 🇧🇷",
        queryTeamOrLeague: "Campeonato Brasileiro Série A",
        queryDetail: "Resultados y tabla de posiciones de la última fecha",
        desc: "Primera división de Brasil donde reside el 'jogo bonito' y las futuras leyendas del fútbol."
      },
      {
        label: "Mundial de Clubes FIFA 🌐",
        queryTeamOrLeague: "Copa Mundial de Clubes de la FIFA",
        queryDetail: "Resultados de la última edición y fixtures de la fase final",
        desc: "El torneo que engloba a los clubes ganadores de las copas continentales de cada confederación."
      }
    ]
  }
};

// High fidelity offline dataset fallback for amazing initial UX and backup
const INITIAL_DEMO_DATA: SoccerAnalysisResponse = {
  competition: "LaLiga EA Sports (El Clásico)",
  period: "Última Jornada Consultada",
  matches: [
    {
      id: "preset_1",
      homeTeam: "FC Barcelona",
      awayTeam: "Real Madrid CF",
      homeScore: 3,
      awayScore: 2,
      status: "Finalizado",
      date: "Último Domingo - 21:00",
      stadium: "Estadi Olímpic Lluís Companys",
      summary: "Un Clásico vibrante donde el FC Barcelona controló el juego mediante una posesión asfixiante por las bandas. Los cambios en el mediotiempo inyectaron dinamismo y el gol final de Pedri selló el triunfo del derbi español.",
      keyEvents: [
        { minute: 15, type: "Gol", team: "Real Madrid CF", player: "Vinícius Jr.", detail: "Asistencia: Jude Bellingham" },
        { minute: 32, type: "Tarjeta Amarilla", team: "FC Barcelona", player: "Ronald Araújo", detail: "Falta táctica en el mediocampo" },
        { minute: 42, type: "Gol", team: "FC Barcelona", player: "Robert Lewandowski", detail: "Cabezazo tras tiro de esquina" },
        { minute: 58, type: "Gol", team: "FC Barcelona", player: "Lamine Yamal", detail: "Remate al ángulo desde el borde del área" },
        { minute: 65, type: "Cambio", team: "Real Madrid CF", player: "Luka Modrić", detail: "Entra por Toni Kroos" },
        { minute: 76, type: "Gol", team: "Real Madrid CF", player: "Kylian Mbappé", detail: "Penalti ejecutado al poste izquierdo" },
        { minute: 81, type: "Tarjeta Roja", team: "Real Madrid CF", player: "Antonio Rüdiger", detail: "Doble amarilla por obstrucción" },
        { minute: 89, type: "Gol", team: "FC Barcelona", player: "Pedri", detail: "Remate cruzado raso. Asistencia: Gavi" }
      ],
      stats: {
        possessionHome: 58,
        possessionAway: 42,
        shotsHome: 14,
        shotsAway: 11,
        foulsHome: 8,
        foulsAway: 12
      },
      homeLineup: {
        formation: "4-3-3",
        players: [
          { name: "M. ter Stegen", number: 1, position: "POR", coordinates: { x: 50, y: 10 }, rating: 7.4 },
          { name: "Jules Koundé", number: 23, position: "DEF", coordinates: { x: 80, y: 30 }, rating: 7.1 },
          { name: "Ronald Araújo", number: 4, position: "DEF", coordinates: { x: 60, y: 28 }, rating: 6.8 },
          { name: "A. Christensen", number: 15, position: "DEF", coordinates: { x: 40, y: 28 }, rating: 7.2 },
          { name: "Alejandro Balde", number: 3, position: "DEF", coordinates: { x: 20, y: 30 }, rating: 7.5 },
          { name: "Frenkie de Jong", number: 21, position: "MC", coordinates: { x: 50, y: 48 }, rating: 8.0 },
          { name: "Pedri", number: 8, position: "MC", coordinates: { x: 30, y: 58 }, rating: 8.8 },
          { name: "Ilkay Gündogan", number: 22, position: "MC", coordinates: { x: 70, y: 58 }, rating: 7.9 },
          { name: "Lamine Yamal", number: 27, position: "DEL", coordinates: { x: 80, y: 80 }, rating: 8.6 },
          { name: "Robert Lewandowski", number: 9, position: "DEL", coordinates: { x: 50, y: 85 }, rating: 8.2 },
          { name: "Raphinha", number: 11, position: "DEL", coordinates: { x: 20, y: 80 }, rating: 7.7 }
        ],
        substitutes: [
          { name: "Iñaki Peña", number: 13, position: "POR", rating: 6.5 },
          { name: "Íñigo Martínez", number: 5, position: "DEF", rating: 7.0 },
          { name: "Marcos Alonso", number: 17, position: "DEF", rating: 6.2 },
          { name: "Sergi Roberto", number: 20, position: "MC", rating: 6.8 },
          { name: "Gavi", number: 6, position: "MC", rating: 7.7 },
          { name: "Ferran Torres", number: 7, position: "DEL", rating: 7.1 },
          { name: "João Félix", number: 14, position: "DEL", rating: 7.3 }
        ]
      },
      awayLineup: {
        formation: "4-3-1-2",
        players: [
          { name: "Thibaut Courtois", number: 1, position: "POR", coordinates: { x: 50, y: 10 }, rating: 7.2 },
          { name: "Dani Carvajal", number: 2, position: "DEF", coordinates: { x: 80, y: 30 }, rating: 7.0 },
          { name: "Eder Militao", number: 3, position: "DEF", coordinates: { x: 60, y: 28 }, rating: 6.5 },
          { name: "Antonio Rüdiger", number: 22, position: "DEF", coordinates: { x: 40, y: 28 }, rating: 5.9 },
          { name: "Ferland Mendy", number: 23, position: "DEF", coordinates: { x: 20, y: 30 }, rating: 6.8 },
          { name: "A. Tchouaméni", number: 18, position: "MC", coordinates: { x: 50, y: 45 }, rating: 7.0 },
          { name: "Fede Valverde", number: 15, position: "MC", coordinates: { x: 70, y: 55 }, rating: 7.4 },
          { name: "Eduardo Camavinga", number: 12, position: "MC", coordinates: { x: 30, y: 55 }, rating: 7.2 },
          { name: "Jude Bellingham", number: 5, position: "MC", coordinates: { x: 50, y: 68 }, rating: 8.3 },
          { name: "Kylian Mbappé", number: 9, position: "DEL", coordinates: { x: 60, y: 82 }, rating: 7.9 },
          { name: "Vinícius Jr.", number: 7, position: "DEL", coordinates: { x: 40, y: 82 }, rating: 8.1 }
        ],
        substitutes: [
          { name: "Andriy Lunin", number: 13, position: "POR", rating: 7.2 },
          { name: "Nacho Fernández", number: 6, position: "DEF", rating: 6.9 },
          { name: "Lucas Vázquez", number: 17, position: "DEF", rating: 7.0 },
          { name: "Luka Modrić", number: 10, position: "MC", rating: 7.8 },
          { name: "Dani Ceballos", number: 19, position: "MC", rating: 6.5 },
          { name: "Arda Güler", number: 24, position: "MC", rating: 7.5 },
          { name: "Joselu", number: 14, position: "DEL", rating: 7.4 }
        ]
      }
    },
    {
      id: "preset_2",
      homeTeam: "Atlético de Madrid",
      awayTeam: "Real Sociedad",
      homeScore: 1,
      awayScore: 1,
      status: "Finalizado",
      date: "Último Sábado - 18:30",
      stadium: "Cívitas Metropolitano",
      summary: "Un choque tácticamente ordenado caracterizado por la solidez defensiva del Atlético de Madrid y el magnífico contraataque estructurado por Kubo en la Real Sociedad, repartiendo puntos de forma justa.",
      keyEvents: [
        { minute: 23, type: "Gol", team: "Atlético de Madrid", player: "Antoine Griezmann", detail: "Remate con la pierna zurda" },
        { minute: 45, type: "Tarjeta Amarilla", team: "Real Sociedad", player: "Martin Zubimendi", detail: "Falta táctica" },
        { minute: 71, type: "Gol", team: "Real Sociedad", player: "Mikel Oyarzabal", detail: "Asistencia de Takefusa Kubo" },
        { minute: 82, type: "Tarjeta Amarilla", team: "Atlético de Madrid", player: "José Giménez", detail: "Protesta al árbitro" }
      ],
      stats: {
        possessionHome: 46,
        possessionAway: 54,
        shotsHome: 8,
        shotsAway: 12,
        foulsHome: 14,
        foulsAway: 9
      },
      homeLineup: {
        formation: "5-3-2",
        players: [
          { name: "Jan Oblak", number: 13, position: "POR", coordinates: { x: 50, y: 10 }, rating: 7.5 },
          { name: "Nahuel Molina", number: 16, position: "DEF", coordinates: { x: 80, y: 32 }, rating: 6.9 },
          { name: "Stefan Savić", number: 15, position: "DEF", coordinates: { x: 65, y: 25 }, rating: 7.0 },
          { name: "José Giménez", number: 2, position: "DEF", coordinates: { x: 50, y: 24 }, rating: 7.3 },
          { name: "Mario Hermoso", number: 22, position: "DEF", coordinates: { x: 35, y: 25 }, rating: 7.1 },
          { name: "R. De Paul", number: 5, position: "MC", coordinates: { x: 65, y: 50 }, rating: 7.4 },
          { name: "Koke", number: 6, position: "MC", coordinates: { x: 50, y: 46 }, rating: 7.2 },
          { name: "S. Lino", number: 12, position: "DEF", coordinates: { x: 20, y: 32 }, rating: 7.5 },
          { name: "Antoine Griezmann", number: 7, position: "DEL", coordinates: { x: 40, y: 78 }, rating: 8.5 },
          { name: "A. Morata", number: 19, position: "DEL", coordinates: { x: 60, y: 80 }, rating: 6.8 },
          { name: "Pablo Barrios", number: 25, position: "MC", coordinates: { x: 35, y: 50 }, rating: 7.0 }
        ],
        substitutes: [
          { name: "Horațiu Moldovan", number: 1, position: "POR", rating: 6.0 },
          { name: "Reinildo Mandava", number: 23, position: "DEF", rating: 6.7 },
          { name: "Saúl Ñíguez", number: 8, position: "MC", rating: 6.4 },
          { name: "Rodrigo Riquelme", number: 17, position: "MC", rating: 6.8 },
          { name: "Ángel Correa", number: 10, position: "DEL", rating: 7.2 },
          { name: "Memphis Depay", number: 9, position: "DEL", rating: 7.0 }
        ]
      },
      awayLineup: {
        formation: "4-3-3",
        players: [
          { name: "Álex Remiro", number: 1, position: "POR", coordinates: { x: 50, y: 10 }, rating: 7.3 },
          { name: "H. Traoré", number: 18, position: "DEF", coordinates: { x: 80, y: 30 }, rating: 7.0 },
          { name: "Zubeldia", number: 5, position: "DEF", coordinates: { x: 60, y: 28 }, rating: 7.1 },
          { name: "Robin Le Normand", number: 24, position: "DEF", coordinates: { x: 40, y: 28 }, rating: 7.2 },
          { name: "Javi Galán", number: 12, position: "DEF", coordinates: { x: 20, y: 30 }, rating: 6.9 },
          { name: "M. Zubimendi", number: 4, position: "MC", coordinates: { x: 50, y: 48 }, rating: 7.8 },
          { name: "Mikel Merino", number: 8, position: "MC", coordinates: { x: 30, y: 58 }, rating: 7.6 },
          { name: "Brais Méndez", number: 23, position: "MC", coordinates: { x: 70, y: 58 }, rating: 7.5 },
          { name: "Takefusa Kubo", number: 14, position: "DEL", coordinates: { x: 80, y: 80 }, rating: 8.1 },
          { name: "Mikel Oyarzabal", number: 10, position: "DEL", coordinates: { x: 50, y: 85 }, rating: 8.0 },
          { name: "Ander Barrenetxea", number: 7, position: "DEL", coordinates: { x: 20, y: 80 }, rating: 7.3 }
        ],
        substitutes: [
          { name: "Unai Marrero", number: 13, position: "POR", rating: 6.1 },
          { name: "Jon Pacheco", number: 20, position: "DEF", rating: 6.6 },
          { name: "Aihen Muñoz", number: 3, position: "DEF", rating: 6.5 },
          { name: "Beñat Turrientes", number: 22, position: "MC", rating: 6.7 },
          { name: "Arsen Zakharyan", number: 12, position: "MC", rating: 6.8 },
          { name: "Sheraldo Becker", number: 11, position: "DEL", rating: 7.0 },
          { name: "Umar Sadiq", number: 19, position: "DEL", rating: 6.3 }
        ]
      }
    }
  ],
  sources: [
    {
      url: "https://www.laliga.com",
      name: "LaLiga EA Sports",
      category: "Portal Oficial",
      snippet: "Resultados oficiales de la jornada de primera división liguera y marcadores del Clásico en tiempo real.",
      credibility: "Oficial"
    },
    {
      url: "https://www.marca.com",
      name: "Diario MARCA",
      category: "Prensa Deportiva",
      snippet: "Análisis pormenorizado del rendimiento de jugadores, crónicas desde el Bernabéu e incidencias de juego.",
      credibility: "Verificado"
    },
    {
      url: "https://www.whoscored.com",
      name: "WhoScored / Opta",
      category: "Estadísticas e Inteligencia",
      snippet: "Calificaciones de rendimiento del sistema táctico xG basado en mapas de calor de posesión.",
      credibility: "Alta Precisión"
    },
    {
      url: "https://www.transfermarkt.com",
      name: "Transfermarkt",
      category: "Base de Datos",
      snippet: "Fichas técnicas de futbolistas convocados, dorsales oficiales asignados y plantillas verídicas.",
      credibility: "Verificado"
    }
  ]
};

export default function App() {
  const [queryTeamOrLeague, setQueryTeamOrLeague] = useState('');
  const [queryDetail, setQueryDetail] = useState('');

  // States
  const [soccerData, setSoccerData] = useState<SoccerAnalysisResponse | null>(null);
  const [activeMatch, setActiveMatch] = useState<SoccerMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [customLoadingMessage, setCustomLoadingMessage] = useState('Buscando partidos actuales...');
  const [error, setError] = useState<string | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [activeDirTab, setActiveDirTab] = useState<'espana' | 'europa' | 'mundo'>('espana');

  // Initial load
  useEffect(() => {
    // Load local history
    try {
      const cached = localStorage.getItem('soccer_center_searches');
      if (cached) {
        const parsed = JSON.parse(cached);
        setSavedSearches(parsed);
        // Load the last successful search as default, or fallback to INITIAL_DEMO_DATA
        if (parsed.length > 0) {
          setSoccerData(parsed[0].data);
          if (parsed[0].data?.matches?.length > 0) {
            setActiveMatch(parsed[0].data.matches[0]);
          }
        } else {
          setSoccerData(INITIAL_DEMO_DATA);
          setActiveMatch(INITIAL_DEMO_DATA.matches[0]);
        }
      } else {
        // First session: load initial high fidelity demo
        setSoccerData(INITIAL_DEMO_DATA);
        setActiveMatch(INITIAL_DEMO_DATA.matches[0]);
      }
    } catch {
      setSoccerData(INITIAL_DEMO_DATA);
      setActiveMatch(INITIAL_DEMO_DATA.matches[0]);
    }
  }, []);

  // Sync saved searches to localStorage
  const handleSaveToLocalStorage = (list: SavedSearch[]) => {
    localStorage.setItem('soccer_center_searches', JSON.stringify(list));
    setSavedSearches(list);
  };

  // Rotating loading messages for premium football feeling
  useEffect(() => {
    if (!loading) return;
    const messages = [
      "Buscando marcadores de la semana en Google Search...",
      "Extrayendo alineaciones oficiales confirmadas...",
      "Sopesando coordenadas tácticas de futbolistas...",
      "Estructurando crónicas ejecutivas de IA...",
      "Finalizando informe deportivo del Desempate Futbolístico..."
    ];

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setCustomLoadingMessage(messages[idx]);
    }, 2500);

    return () => clearInterval(interval);
  }, [loading]);

  const handleApplyPreset = (preset: typeof PRESETS_SOCCER[0]) => {
    setQueryTeamOrLeague(preset.queryTeamOrLeague);
    setQueryDetail(preset.queryDetail);
    setError(null);
    // Instant search on preset click for extreme responsiveness!
    triggerSearch(preset.queryTeamOrLeague, preset.queryDetail);
  };

  const handleFormSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryTeamOrLeague.trim()) {
      setError("Por favor, ingresa el nombre de un equipo, liga o competición.");
      return;
    }
    triggerSearch(queryTeamOrLeague.trim(), queryDetail.trim());
  };

  const triggerSearch = async (teamOrLeague: string, detailText: string) => {
    setLoading(true);
    setError(null);
    setActiveMatch(null);
    setCustomLoadingMessage("Iniciando exploración con Inteligencia Artificial...");

    try {
      const response = await fetch('/api/analyze-soccer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryTeamOrLeague: teamOrLeague,
          queryDetail: detailText || "Partidos recientes de la semana"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "La consulta con IA falló en el servidor.");
      }

      const freshData: SoccerAnalysisResponse = await response.json();

      if (!freshData.matches || freshData.matches.length === 0) {
        throw new Error("No se encontraron partidos o alineaciones para la consulta propocionada. Prueba refinando el nombre.");
      }

      setSoccerData(freshData);
      
      // Select the first match as active automatically
      if (freshData.matches.length > 0) {
        setActiveMatch(freshData.matches[0]);
      }

      // Add to sidebar search history
      const newSearchItem: SavedSearch = {
        id: `search_${Date.now()}`,
        queryTeamOrLeague: teamOrLeague,
        queryDetail: detailText || "Partidos recientes",
        createdAt: new Date().toISOString(),
        data: freshData
      };

      // Filter redundant queries to avoid clutter
      const filteredHistory = savedSearches.filter(
        item => item.queryTeamOrLeague.toLowerCase() !== teamOrLeague.toLowerCase()
      );

      handleSaveToLocalStorage([newSearchItem, ...filteredHistory]);

    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "No se ha podido conectar con el consultor táctico en la nube. Carga un preset local para seguir explorando."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (search: SavedSearch) => {
    setSoccerData(search.data);
    setError(null);
    if (search.data?.matches?.length > 0) {
      setActiveMatch(search.data.matches[0]);
    } else {
      setActiveMatch(null);
    }
    // Pre-fill inputs with history query values
    setQueryTeamOrLeague(search.queryTeamOrLeague);
    setQueryDetail(search.queryDetail);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSearches.filter(item => item.id !== id);
    handleSaveToLocalStorage(updated);
  };

  const loadOfflineDemo = () => {
    setSoccerData(INITIAL_DEMO_DATA);
    setActiveMatch(INITIAL_DEMO_DATA.matches[0]);
    setQueryTeamOrLeague("LaLiga EA Sports");
    setQueryDetail("El Clásico Offline");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Mesh background accents resembling pitch floodlights */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Header bar */}
      <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-slate-900 backdrop-blur-xl bg-slate-900/40 relative z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 cursor-pointer hover:scale-105 active:scale-95 transition-transform" onClick={loadOfflineDemo}>
            <Trophy className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 italic font-black cursor-pointer leading-none" onClick={loadOfflineDemo}>
              El desempate futbolístico
            </h1>
            <span className="text-[9px] font-mono tracking-widest text-emerald-400 font-bold block uppercase mt-1">Tactical Info & Soccer Grounding AI</span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 md:px-4 py-2 border rounded-full text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              showHistory 
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-950/45' 
                : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-300'
            }`}
            title="Mostrar u ocultar favoritos"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showHistory ? 'Ocultar Historial' : 'Ver Historial'}</span>
          </button>

          <button 
            type="button"
            onClick={loadOfflineDemo}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-455 hover:to-teal-455 text-slate-950 rounded-full text-xs font-black shadow-lg shadow-emerald-950/30 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
            title="Cargar derbi offline de muestra"
          >
            <Database className="w-3.5 h-3.5 text-slate-950" />
            <span>Ver Demo</span>
          </button>
        </div>
      </header>

      {/* Main Workspace layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-6 overflow-hidden relative z-10">
        
        {/* Left column history sidebar */}
        {showHistory && (
          <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4 animate-fade-in z-20">
            <SoccerHistory 
              searches={savedSearches}
              onSelectSearch={handleSelectHistory}
              onDeleteSearch={handleDeleteHistory}
              currentActiveId={soccerData ? savedSearches.find(s => s.data.competition === soccerData.competition)?.id : undefined}
            />
          </aside>
        )}

        {/* Central screen column workspace */}
        <div className="flex-1 space-y-6 overflow-y-auto">
          
          {/* A. Search controller console */}
          <section className="bg-slate-900/50 backdrop-blur-md border border-slate-850 rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden">
            <div>
              <h2 className="text-lg md:text-xl font-display font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-400" />
                Consulta tu Liga, Equipo o Amistoso
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Utilizamos el modelo Gemini para realizar una búsqueda web de fútbol en tiempo real. Extraeremos marcadores frescos, fichas tácticas y alineaciones sin base de datos estática.
              </p>
            </div>

            <form onSubmit={handleFormSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold mb-1.5 block font-mono">
                    Nombre del Equipo o Competición
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. LaLiga EA Sports, Real Madrid, Champions League..."
                    value={queryTeamOrLeague}
                    onChange={(e) => setQueryTeamOrLeague(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 rounded-xl p-3 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors font-medium font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold mb-1.5 block font-mono">
                    Especificar Periodo u Opciones (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Jornada 37, Partidos de esta semana, Último Clásico..."
                    value={queryDetail}
                    onChange={(e) => setQueryDetail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 rounded-xl p-3 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors font-medium font-sans"
                  />
                </div>
              </div>

              {/* Warnings & Fallback suggestions */}
              {error && (
                <div className="bg-amber-950/40 border border-amber-900/50 p-3 rounded-xl text-amber-300 text-xs flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p className="leading-relaxed font-semibold">{error}</p>
                    <button
                      type="button"
                      onClick={loadOfflineDemo}
                      className="text-[11px] underline text-emerald-400 font-bold hover:text-emerald-300 block text-left"
                    >
                      Cargar Derbi de FC Barcelona vs Real Madrid de muestra sin conexión
                    </button>
                  </div>
                </div>
              )}

              {/* Actions & Presets */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-800/80 pt-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] text-slate-500 font-extrabold font-mono uppercase shrink-0">Enlaces Rápidos:</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESETS_SOCCER.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1 text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 rounded-lg transition-all cursor-pointer font-bold shrink-0"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 text-slate-950 focus:outline-none disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-955 border-t-transparent rounded-full animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5 text-slate-950" />
                      <span>Explorar Fútbol de la Semana</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Directorio de Ligas Españolas, Europeas y Mundiales */}
          <section className="bg-slate-900/30 backdrop-blur-md border border-slate-900 rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  Directorio de Ligas & Copas Mundiales
                </h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Haz clic en cualquier liga para buscar marcadores reales en vivo, incidencias del juego y fichas de alineaciones visualizadas con IA táctica.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl self-start lg:self-auto shadow-inner min-w-[280px]">
                <button
                  type="button"
                  onClick={() => setActiveDirTab('espana')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                    activeDirTab === 'espana'
                      ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  España 🇪🇸
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDirTab('europa')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                    activeDirTab === 'europa'
                      ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Europa 🇪🇺
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDirTab('mundo')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                    activeDirTab === 'mundo'
                      ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mundial 🌎
                </button>
              </div>
            </div>

            {/* General Description active Tab */}
            <div className="flex items-start gap-2 bg-slate-950/40 border border-slate-900/60 p-3 rounded-xl text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider shrink-0 mt-0.5">Categoría:</span>
              <p>{CATEGORIZED_LEAGUES[activeDirTab].description}</p>
            </div>

            {/* League Directory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIZED_LEAGUES[activeDirTab].items.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQueryTeamOrLeague(item.queryTeamOrLeague);
                    setQueryDetail(item.queryDetail);
                    setError(null);
                    triggerSearch(item.queryTeamOrLeague, item.queryDetail);
                  }}
                  className="group p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850 hover:border-slate-800 hover:bg-slate-900/40 cursor-pointer text-left transition-all flex flex-col justify-between gap-3 shadow hover:shadow-emerald-950/30 active:scale-[0.98]"
                >
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <h4 className="text-xs font-black text-slate-100 group-hover:text-emerald-400 transition-colors leading-tight truncate">
                        {item.label}
                      </h4>
                      <div className="w-5 h-5 rounded-md bg-emerald-950/30 border border-emerald-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-[8px] font-mono font-bold tracking-wider text-slate-500 pt-2 border-t border-slate-850/40 uppercase w-full">
                    <span className="truncate max-w-[130px]">{item.queryDetail}</span>
                    <span className="text-emerald-400/80 group-hover:text-emerald-405 font-extrabold transition-colors shrink-0">EFECTUAR CONSULTA →</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Loader */}
          {loading && (
            <div className="bg-slate-900/50 border border-slate-805 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl min-h-[300px]">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 rounded-full border-4 border-emerald-500/10 animate-ping" />
                <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin flex items-center justify-center shadow-lg bg-slate-950" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-400 uppercase">
                  {customLoadingMessage}
                </span>
                <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                  Buscando en vivo resultados, goleadores, incidencias y coordenadas tácticas oficiales analizadas con el Desempate de Fútbol de IA de Google.
                </p>
              </div>
            </div>
          )}

          {/* B. Core Soccer Workspace view */}
          {!loading && soccerData && (
            <div className="space-y-6">
              
              {/* Competition header strip */}
              <div className="bg-slate-900/60 border border-slate-850 backdrop-blur-md px-4 py-3.5 rounded-2xl flex flex-wrap justify-between items-center gap-3 shadow-xl">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Explorando resultados de:</span>
                  <h3 className="font-sans font-extrabold text-slate-100 text-sm leading-tight flex items-center gap-1.5">
                    {soccerData.competition}
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 font-bold font-mono">
                      {soccerData.period}
                    </span>
                  </h3>
                </div>
                {soccerData.matches && soccerData.matches.length > 1 && (
                  <div className="text-xs text-slate-400 font-medium">
                    Encontrados <span className="font-black text-slate-100">{soccerData.matches.length} partidos</span>
                  </div>
                )}
              </div>

              {/* Slider / match list buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {soccerData.matches.map((match) => {
                  const isActive = activeMatch?.id === match.id;
                  const isFinished = match.status === 'Finalizado';
                  return (
                    <button
                      key={match.id}
                      onClick={() => setActiveMatch(match)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-1.5 cursor-pointer relative group ${
                        isActive
                          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/40 to-slate-950/40 border-emerald-500/70 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/15'
                          : 'bg-slate-950/30 border-slate-850 hover:border-slate-800 hover:bg-slate-900/40'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute right-2.5 top-2.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
                      )}
                      
                      <div className="text-[9px] font-mono font-bold text-slate-500 truncate tracking-tight">{match.date}</div>
                      
                      {/* Teams short representation */}
                      <div className="space-y-1 my-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs truncate ${isActive ? 'font-black text-emerald-400' : 'font-bold text-slate-350 group-hover:text-slate-150'}`}>
                            {match.homeTeam}
                          </span>
                          {isFinished && (
                            <span className="text-xs font-black font-mono text-slate-100">{match.homeScore}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs truncate ${isActive ? 'font-black text-emerald-400' : 'font-bold text-slate-350 group-hover:text-slate-150'}`}>
                            {match.awayTeam}
                          </span>
                          {isFinished && (
                            <span className="text-xs font-black font-mono text-slate-100">{match.awayScore}</span>
                          )}
                        </div>
                      </div>

                      {/* Match state badge */}
                      <div className="flex justify-between items-center mt-1 border-t border-slate-800/60 pt-1.5 text-[9px] uppercase font-bold tracking-wider">
                        <span className={`${
                          match.status === 'Finalizado' 
                            ? 'text-slate-500' 
                            : match.status === 'En juego' 
                              ? 'text-red-400 animate-pulse font-black' 
                              : 'text-emerald-400'
                        }`}>
                          {match.status}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active match comprehensive tactical workspace */}
              {activeMatch ? (
                <div className="space-y-6 animate-fade-in pt-2">
                  <article>
                    <MatchDetails match={activeMatch} />
                  </article>
                  
                  <article>
                    <PredictiveArena match={activeMatch} />
                  </article>
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-850 p-8 rounded-3xl text-center italic text-xs text-slate-500">
                  Selecciona uno de los partidos arriba para abrir las fichas tácticas detalladas y la alineación visualizada sobre el campo de juego.
                </div>
              )}

              {/* 3. Citations & Grounding Source Links */}
              {soccerData.sources && soccerData.sources.length > 0 && (
                <section className="bg-slate-900/45 border border-slate-850 rounded-3xl p-5 space-y-4 relative overflow-hidden" id="sources-grounding-section">
                  <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        Centro de Inteligencia Deportiva: Fuentes Consultadas
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        La Inteligencia Artificial ha extraído los resultados recopilando datos de forma transparente de los siguientes portales deportivos:
                      </p>
                    </div>
                    <div className="text-[9px] bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-md shrink-0 block">
                      En Tiempo Real ({soccerData.sources.length} Fuentes)
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {soccerData.sources.map((src, idx) => {
                      const isObject = typeof src === 'object' && src !== null;
                      const url = isObject ? (src as any).url : src;
                      const name = isObject ? (src as any).name : '';
                      const category = isObject ? (src as any).category : 'Prensa Deportiva';
                      const snippet = isObject ? (src as any).snippet : 'Enlace verificado con las últimas estadísticas e incidencias en vivo.';
                      const credibility = isObject ? (src as any).credibility : 'Verificado';

                      let domain = url;
                      try {
                        const urlObj = new URL(url);
                        domain = urlObj.hostname;
                      } catch {
                        domain = "Enlace Web";
                      }

                      const displayName = name || domain;

                      // Color mapping for categories
                      const getCategoryStyle = (cat: string) => {
                        switch (cat) {
                          case 'Portal Oficial': return 'bg-emerald-950/50 border-emerald-900/50 text-emerald-450';
                          case 'Estadísticas e Inteligencia': return 'bg-indigo-950/50 border-indigo-900/50 text-indigo-400';
                          case 'Base de Datos': return 'bg-purple-950/50 border-purple-900/50 text-purple-400';
                          case 'Prensa Local': return 'bg-teal-950/50 border-teal-900/50 text-teal-400';
                          default: return 'bg-slate-950/50 border-slate-800/80 text-slate-450';
                        }
                      };

                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block p-3 rounded-2xl bg-slate-950/60 border border-slate-850 hover:border-slate-800 hover:bg-slate-900/40 cursor-pointer transition-all duration-200 text-left relative overflow-hidden active:scale-[0.99]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[8.5px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${getCategoryStyle(category)}`}>
                              {category}
                            </span>
                            
                            <span className="text-[8.5px] font-mono font-bold text-slate-500 flex items-center gap-1">
                              Confianza: 
                              <span className="text-emerald-400/90 font-black">{credibility}</span>
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-1">
                            <h5 className="text-[11.5px] font-bold text-slate-100 group-hover:text-emerald-400 transition-colors leading-tight truncate">
                              {displayName}
                            </h5>
                            <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                          </div>

                          {snippet && (
                            <p className="mt-1 text-[10px] text-slate-400 leading-normal line-clamp-2">
                              {snippet}
                            </p>
                          )}

                          <div className="mt-2 pt-1.5 border-t border-slate-900/40 flex items-center justify-between text-[8px] font-mono text-slate-500 font-extrabold tracking-wider uppercase">
                            <span className="truncate max-w-[190px]">{domain}</span>
                            <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-all">VISITAR FUENTE →</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Footer bar */}
      <footer className="h-12 px-4 md:px-8 flex items-center justify-between border-t border-slate-900 bg-slate-950 text-[9px] tracking-widest text-slate-500 font-mono font-bold uppercase shrink-0">
        <div>Plataforma: El desempate_v3.1</div>
        <div className="flex gap-4 md:gap-8">
          <span className="hidden sm:inline">Grounding en vivo con Google Search</span>
          <span className="text-emerald-450 text-emerald-400 italic font-medium lowercase tracking-normal">Alineaciones representadas de abajo hacia arriba</span>
        </div>
      </footer>
    </div>
  );
}
