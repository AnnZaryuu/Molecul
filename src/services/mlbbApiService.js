/**
 * MLBB Public Data API Service
 * Sourced from: Official Mobile Legends REST API
 * PandaScore (Matches): https://pandascore.co/
 */

import { PANDASCORE_TOKEN } from './config';

const PANDASCORE_URL = 'https://api.pandascore.co';
const MLBB_API_BASE = 'https://mlbb.rone.dev/api';

/**
 * PETA ROLE MANUAL (FALLBACK)
 * Karena list API tidak mengembalikan data role,
 * kita memetakan beberapa hero terkenal secara manual.
 */
const ROLE_MAP = {
  'Miya': 'Marksman', 'Balmond': 'Fighter', 'Saber': 'Assassin', 'Alice': 'Mage', 'Nana': 'Support',
  'Tigreal': 'Tank', 'Alucard': 'Fighter', 'Karina': 'Assassin', 'Akai': 'Tank', 'Franco': 'Tank',
  'Bane': 'Fighter', 'Bruno': 'Marksman', 'Clint': 'Marksman', 'Rafaela': 'Support', 'Eudora': 'Mage', 'Zilong': 'Fighter',
  'Fanny': 'Assassin', 'Layla': 'Marksman', 'Minotaur': 'Tank', 'Lolita': 'Tank', 'Hayabusa': 'Assassin',
  'Freya': 'Fighter', 'Gord': 'Mage', 'Natalia': 'Assassin', 'Kagura': 'Mage', 'Chou': 'Fighter',
  'Sun': 'Fighter', 'Alpha': 'Fighter', 'Ruby': 'Fighter', 'Yi Sun-shin': 'Marksman', 'Moskov': 'Marksman',
  'Johnson': 'Tank', 'Cyclops': 'Mage', 'Estes': 'Support', 'Hilda': 'Fighter', 'Aurora': 'Mage',
  'Lapu-Lapu': 'Fighter', 'Vexana': 'Mage', 'Roger': 'Fighter', 'Karrie': 'Marksman', 'Gatotkaca': 'Tank',
  'Argus': 'Fighter', 'Diggie': 'Support', 'Irithel': 'Marksman', 'Grock': 'Tank', 'Odette': 'Mage',
  'Lancelot': 'Assassin', 'Pharsa': 'Mage', 'Jawhead': 'Fighter', 'Angela': 'Support', 'Gusion': 'Assassin',
  'Valir': 'Mage', 'Martis': 'Fighter', 'Uranus': 'Tank', 'Hanabi': 'Marksman', 'Chang\'e': 'Mage',
  'Kaja': 'Support', 'Selena': 'Assassin', 'Aldous': 'Fighter', 'Claude': 'Marksman', 'Vale': 'Mage',
  'Leomord': 'Fighter', 'Lunox': 'Mage', 'Hanzo': 'Assassin', 'Belerick': 'Tank', 'Kimmy': 'Marksman',
  'Thamuz': 'Fighter', 'Harith': 'Mage', 'Minsitthar': 'Fighter', 'Kadita': 'Mage', 'Faramis': 'Support', 'Badang': 'Fighter',
  'Khufra': 'Tank', 'Granger': 'Marksman', 'Guinevere': 'Fighter', 'Esmeralda': 'Mage', 'Terizla': 'Fighter',
  'X.Borg': 'Fighter', 'Ling': 'Assassin', 'Dyrroth': 'Fighter', 'Lylia': 'Mage', 'Baxia': 'Tank',
  'Masha': 'Fighter', 'Wanwan': 'Marksman', 'Silvanna': 'Fighter', 'Cecilion': 'Mage', 'Carmilla': 'Support',
  'Atlas': 'Tank', 'Popol and Kupa': 'Marksman', 'Yu Zhong': 'Fighter', 'Luo Yi': 'Mage', 'Benedetta': 'Assassin',
  'Khaleed': 'Fighter', 'Barats': 'Tank', 'Brody': 'Marksman', 'Yve': 'Mage', 'Mathilda': 'Support',
  'Paquito': 'Fighter', 'Gloo': 'Tank', 'Beatrix': 'Marksman', 'Phoveus': 'Fighter', 'Natan': 'Marksman',
  'Aulus': 'Fighter', 'Aamon': 'Assassin', 'Valentina': 'Mage', 'Edith': 'Tank', 'Yin': 'Fighter',
  'Melissa': 'Marksman', 'Xavier': 'Mage', 'Julian': 'Fighter', 'Fredrinn': 'Tank', 'Joy': 'Assassin',
  'Novaria': 'Mage', 'Arlott': 'Fighter', 'Ixia': 'Marksman', 'Nolan': 'Assassin', 'Cici': 'Fighter',
  'Chip': 'Support', 'Suyou': 'Assassin', 'Zhuxin': 'Mage', 'Marcel': 'Support', 'Lukas': 'Fighter'
};

/**
 * In-memory role cache — persists for the duration of the app session.
 * Populated automatically when a hero detail is fetched (user taps a hero).
 * Key: hero name (string), Value: role string e.g. 'Mage', 'Tank', etc.
 *
 * This allows the hero list role filter to self-heal over time:
 * heroes not in ROLE_MAP will show the correct role after their detail
 * has been viewed at least once — including any new heroes Moonton releases.
 */
const roleCache = {};

export const MLBBApiService = {
  /**
   * Get MLBB Heroes
   */
  getHeroes: async () => {
    try {
      const response = await fetch(`${MLBB_API_BASE}/heroes?size=200`);
      if (!response.ok) {
        console.warn(`Heroes API returned status ${response.status}`);
        return [];
      }
      
      const resData = await response.json();
      const records = resData.data?.records || [];

      return records.map(record => {
        const heroData = record.data?.hero?.data;
        // Priority: ROLE_MAP -> roleCache (from detail view) -> fallback
        const type = ROLE_MAP[heroData?.name] || roleCache[heroData?.name] || 'Fighter';
        return {
          id: record.data?.hero_id?.toString() || heroData?.heroid?.toString(),
          name: heroData?.name,
          head: heroData?.head || '',
          type: type
        };
      });
    } catch (error) {
      console.error('Error fetching MLBB heroes via rone.dev:', error);
      return [];
    }
  },

  /**
   * Get Hero details (rone.dev)
   */
  getHeroDetails: async (heroId) => {
    try {
      const response = await fetch(`${MLBB_API_BASE}/heroes/${heroId}`);
      if (!response.ok) {
        console.warn(`Hero detail API returned status ${response.status}`);
        return null;
      }
      const resData = await response.json();
      const records = resData.data?.records || [];
      if (records.length === 0) return null;
      
      const record = records[0];
      const data = record.data?.hero?.data;
      if (!data) return null;

      // Extract skills
      const allSkills = data.heroskilllist?.[0]?.skilllist || [];
      let passive = null;
      let activeSkills = [];

      if (allSkills.length > 0) {
        passive = allSkills[0]; // the first skill is usually the passive
        activeSkills = allSkills.slice(1);
      }

      // Map abilityshow
      const ability = data.abilityshow || ["0", "0", "0", "0"];

      // Update roleCache just in case
      if (data.name && data.sortlabel?.[0]) {
        roleCache[data.name] = data.sortlabel[0];
      }

      return {
        id: heroId,
        name: data.name,
        head: data.head || '',
        // Gunakan smallmap (portrait image) sebagai header agar lebih estetik, fallback ke painting/head
        painting: data.smallmap || record.data?.painting || data.head || '',
        type: data.sortlabel?.[0] || 'FIGHTER',
        attribute: {
          'DURABILITY': parseInt(ability[0], 10),
          'OFFENSE': parseInt(ability[1], 10),
          'MAGIC POWER': parseInt(ability[2], 10),
          'DIFFICULTY': parseInt(ability[3], 10)
        },
        passive: passive ? {
          skillname: passive.skillname,
          skillicon: passive.skillicon,
          skilldesc: passive.skilldesc
        } : null,
        skills: activeSkills.map(s => ({
          skillname: s.skillname,
          skillicon: s.skillicon,
          skilldesc: s.skilldesc,
          skilltag: s.skilltag || [],
          'skillcd&cost': s['skillcd&cost'] || ''
        })),
        story: data.story || '',
        relation: {
          strong: { desc: record.data?.relation?.strong?.desc || '' }
        }
      };
    } catch (error) {
      console.error(`Error fetching hero details for ${heroId}:`, error);
      return null;
    }
  },

  /**
   * Get MLBB Matches (PandaScore)
   */
  getMLBBMatches: async (status = 'upcoming', pageSize = 10) => {
    try {
      // Map 'not_started' to 'upcoming' for PandaScore compatibility
      const apiStatus = status === 'not_started' ? 'upcoming' : status;
      
      if (!PANDASCORE_TOKEN || PANDASCORE_TOKEN === 'YOUR_PANDASCORE_TOKEN_HERE') {
        console.warn('PandaScore token is missing or invalid.');
        return [];
      }

      const response = await fetch(`${PANDASCORE_URL}/mlbb/matches/${apiStatus}?token=${PANDASCORE_TOKEN}&per_page=${pageSize}&sort=begin_at`);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn('PandaScore matches returned non-array:', data);
        return [];
      }

      return data.map(match => {
        const opponents = (match.opponents || []).map(opp => ({
          id: opp.opponent?.id,
          name: opp.opponent?.name,
          acronym: opp.opponent?.acronym || 'TBD',
          logo: opp.opponent?.image_url
        }));

        // Map results to exactly match the opponents order using team_id
        const results = opponents.map(opp => {
          const res = (match.results || []).find(r => r.team_id === opp.id);
          return { score: res?.score || 0 };
        });

        return {
          id: match.id,
          name: match.name,
          beginAt: match.begin_at,
          status: match.status,
          league: match.league?.name || 'PRO LEAGUE',
          leagueLogo: match.league?.image_url,
          serie: match.serie?.full_name || 'SEASON 2026',
          matchType: match.match_type || 'BO3',
          numberOfGames: match.number_of_games || 3,
          streamUrl: match.official_stream_url || (match.streams_list && match.streams_list.length > 0 ? match.streams_list[0].raw_url : null),
          results: results,
          opponents: opponents
        };
      });
    } catch (error) {
      console.error('Error fetching MLBB matches:', error);
      return [];
    }
  },

  /**
   * Get MLBB Standings (PandaScore)
   */
  getMLBBStandings: async (tournamentSlug) => {
    try {
      if (!tournamentSlug) return [];
      
      if (!PANDASCORE_TOKEN || PANDASCORE_TOKEN === 'YOUR_PANDASCORE_TOKEN_HERE') {
        console.warn('PandaScore token is missing or invalid.');
        return [];
      }

      const response = await fetch(`${PANDASCORE_URL}/tournaments/${tournamentSlug}/standings?token=${PANDASCORE_TOKEN}`);
      
      if (!response.ok) {
        console.warn(`PandaScore error ${response.status} for ${tournamentSlug}`);
        return [];
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn('PandaScore standings returned non-array:', data);
        return [];
      }

      return data.map(item => {
        const team = item.team || {};
        let name = team.name || 'UNKNOWN';
        // Data Correction Layer
        if (name === 'Fnatic ONIC') name = 'ONIC';
        
        return {
          id: team.id,
          rank: item.rank,
          teamName: name,
          acronym: (team.acronym || name.substring(0, 3) || '').toUpperCase(),
          wins: item.wins || 0,
          losses: item.losses || 0,
          gameWins: item.stats?.for || 0,
          winRate: (item.wins + item.losses) > 0 ? ((item.wins / (item.wins + item.losses)) * 100).toFixed(0) : 0,
          logo: team.image_url
        };
      });
    } catch (error) {
      console.error('Error fetching MLBB standings:', error);
      return [];
    }
  },

  /**
   * Get MLBB Teams (PandaScore)
   */
  getMLBBTeams: async (pageSize = 50) => {
    try {
      const response = await fetch(`${PANDASCORE_URL}/mlbb/teams?token=${PANDASCORE_TOKEN}&per_page=${pageSize}`);
      const data = await response.json();
      
      return data.map(team => {
        let name = team.name;
        // Data Correction Layer
        if (name === 'Fnatic ONIC') name = 'ONIC';
        
        return {
          id: team.id,
          name: name,
          acronym: team.acronym,
          logo: team.image_url,
          players: team.players.map(p => ({
            id: p.id,
            name: p.name,
            fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            role: p.role,
            nationality: p.nationality
          }))
        };
      });
    } catch (error) {
      console.error('Error fetching MLBB teams:', error);
      return [];
    }
  }
};
