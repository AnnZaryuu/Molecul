/**
 * MLBB Public Data API Service
 * Sourced from: Official Mobile Legends REST API
 * PandaScore (Matches): https://pandascore.co/
 */

import { PANDASCORE_TOKEN } from './config';

const PANDASCORE_URL = 'https://api.pandascore.co';
const MLBB_API_BASE = 'https://mapi.mobilelegends.com';

export const MLBBApiService = {
  /**
   * Get Hero Rank Statistics (Meta Analysis)
   * Using REST API fallback
   */
  getHeroRank: async (rank = 'mythic', days = 7) => {
    try {
      const response = await fetch(`https://mapi.mobilelegends.com/hero/rank?lan=en&type=${rank}`);
      
      if (!response.ok) {
        console.warn(`Rank API returned status ${response.status}`);
        return [];
      }

      const text = await response.text();
      let resData;
      try {
        resData = JSON.parse(text);
      } catch (e) {
        console.warn('Rank API returned non-JSON response');
        return [];
      }
      
      const records = resData.data || [];
      
      return records.slice(0, 50).map(record => {
        return {
          id: record.heroid?.toString(),
          heroName: (record.name || 'UNKNOWN').toUpperCase(),
          winRate: (parseFloat(record.win_rate || 0) * 100).toFixed(1),
          pickRate: (parseFloat(record.appearance_rate || 0) * 100).toFixed(1),
          banRate: (parseFloat(record.ban_rate || 0) * 100).toFixed(1),
          imageUrl: record.head
        };
      });
    } catch (error) {
      console.error('Error fetching MLBB Rank stats:', error);
      return [];
    }
  },

  /**
   * Get MLBB Heroes (REST API)
   */
  getHeroes: async () => {
    try {
      const response = await fetch(`https://mapi.mobilelegends.com/hero/list?lan=en`);
      const resData = await response.json();
      const list = resData.data || [];
      
      const ROLE_MAP = {
        'Miya': 'Marksman', 'Balmond': 'Fighter', 'Saber': 'Assassin', 'Alice': 'Mage', 'Nana': 'Mage',
        'Tigreal': 'Tank', 'Alucard': 'Fighter', 'Karina': 'Assassin', 'Akai': 'Tank', 'Franco': 'Tank',
        'Bruno': 'Marksman', 'Clint': 'Marksman', 'Rafaela': 'Support', 'Eudora': 'Mage', 'Zilong': 'Fighter',
        'Fanny': 'Assassin', 'Layla': 'Marksman', 'Minotaur': 'Tank', 'Lolita': 'Support', 'Hayabusa': 'Assassin',
        'Freya': 'Fighter', 'Gord': 'Mage', 'Natalia': 'Assassin', 'Kagura': 'Mage', 'Chou': 'Fighter',
        'Sun': 'Fighter', 'Alpha': 'Fighter', 'Ruby': 'Fighter', 'Yi Sun-shin': 'Marksman', 'Moskov': 'Marksman',
        'Johnson': 'Tank', 'Cyclops': 'Mage', 'Estes': 'Support', 'Hilda': 'Fighter', 'Aurora': 'Mage',
        'Lapu-Lapu': 'Fighter', 'Vexana': 'Mage', 'Roger': 'Fighter', 'Karrie': 'Marksman', 'Gatotkaca': 'Tank',
        'Harley': 'Mage', 'Irithel': 'Marksman', 'Grock': 'Tank', 'Argus': 'Fighter', 'Odette': 'Mage',
        'Lancelot': 'Assassin', 'Diggie': 'Support', 'Hylos': 'Tank', 'Zhask': 'Mage', 'Helcurt': 'Assassin',
        'Pharsa': 'Mage', 'Lesley': 'Marksman', 'Jawhead': 'Fighter', 'Angela': 'Support', 'Gusion': 'Assassin',
        'Valir': 'Mage', 'Martis': 'Fighter', 'Uranus': 'Tank', 'Hanabi': 'Marksman', 'Chang\'e': 'Mage',
        'Kaja': 'Fighter', 'Selena': 'Assassin', 'Aldous': 'Fighter', 'Claude': 'Marksman', 'Vale': 'Mage',
        'Leomord': 'Fighter', 'Lunox': 'Mage', 'Hanzo': 'Assassin', 'Belerick': 'Tank', 'Kimmy': 'Marksman',
        'Thamuz': 'Fighter', 'Harith': 'Mage', 'Minsitthar': 'Fighter', 'Kadita': 'Mage', 'Badang': 'Fighter',
        'Guinevere': 'Fighter', 'Khufra': 'Tank', 'Granger': 'Marksman', 'Faramis': 'Support', 'Terizla': 'Fighter',
        'Esmeralda': 'Mage', 'X.Borg': 'Fighter', 'Lylia': 'Mage', 'Dyrroth': 'Fighter', 'Baxia': 'Tank',
        'Masha': 'Fighter', 'Wanwan': 'Marksman', 'Silvanna': 'Fighter', 'Cecilion': 'Mage', 'Carmilla': 'Support',
        'Atlas': 'Tank', 'Popol and Kupa': 'Marksman', 'Yu Zhong': 'Fighter', 'Luo Yi': 'Mage', 'Benedetta': 'Assassin',
        'Khaleed': 'Fighter', 'Barats': 'Tank', 'Brody': 'Marksman', 'Yve': 'Mage', 'Mathilda': 'Support',
        'Paquito': 'Fighter', 'Gloo': 'Tank', 'Beatrix': 'Marksman', 'Phoveus': 'Fighter', 'Natan': 'Marksman',
        'Aulus': 'Fighter', 'Aamon': 'Assassin', 'Valentina': 'Mage', 'Edith': 'Tank', 'Yin': 'Fighter',
        'Melissa': 'Marksman', 'Xavier': 'Mage', 'Julian': 'Fighter', 'Fredrinn': 'Tank', 'Joy': 'Assassin',
        'Novaria': 'Mage', 'Arlott': 'Fighter', 'Ixia': 'Marksman', 'Nolan': 'Assassin', 'Cici': 'Fighter',
        'Chip': 'Support', 'Zhuxin': 'Mage', 'Suyou': 'Fighter'
      };

      return list.map(hero => {
        const heroId = hero.heroid;
        const apiHead = hero.key ? (hero.key.startsWith('http') ? hero.key : `https:${hero.key}`) : '';
        
        return {
          id: heroId,
          name: hero.name,
          head: apiHead,
          type: ROLE_MAP[hero.name] || 'Fighter'
        };
      });
    } catch (error) {
      console.error('Error fetching MLBB heroes via REST:', error);
      return [];
    }
  },

  /**
   * Get Hero details (REST API)
   */
  getHeroDetails: async (heroId) => {
    try {
      const response = await fetch(`https://mapi.mobilelegends.com/hero/detail?id=${heroId}`);
      const resData = await response.json();
      const data = resData.data;
      if (!data) return null;

      const ensureHttps = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `https:${url}`;
      };

      const headImg = ensureHttps(data.skill?.item?.main?.icon);
      const paintingImg = ensureHttps(data.cover_picture || data.gallery_picture);

      const allSkills = data.skill?.skill || [];
      const passive = allSkills.length > 0 ? allSkills[allSkills.length - 1] : null; 
      const activeSkills = allSkills.slice(0, allSkills.length - 1);

      return {
        id: heroId,
        name: data.name,
        head: headImg,
        painting: paintingImg || headImg,
        type: data.type || 'FIGHTER',
        attribute: {
          'DURABILITY': data.alive || '0',
          'OFFENSE': data.phy || '0',
          'MAGIC POWER': data.mag || '0',
          'DIFFICULTY': data.diff || '0'
        },
        passive: passive ? {
          skillname: passive.name,
          skillicon: ensureHttps(passive.icon),
          skilldesc: passive.des
        } : null,
        skills: activeSkills.map(s => ({
          skillname: s.name,
          skillicon: ensureHttps(s.icon),
          skilldesc: s.des,
          'skillcd&cost': s.tips || ''
        })),
        story: data.skill?.item?.tips || data.des || '',
        relation: {
          strong: { desc: data.counters?.counters?.restrain_hero_tips || '' }
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
      const response = await fetch(`${PANDASCORE_URL}/mlbb/matches/${apiStatus}?token=${PANDASCORE_TOKEN}&per_page=${pageSize}&sort=begin_at`);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn('PandaScore matches returned non-array:', data);
        return [];
      }

      return data.map(match => ({
        id: match.id,
        name: match.name,
        beginAt: match.begin_at,
        status: match.status,
        league: match.league?.name || 'PRO LEAGUE',
        leagueLogo: match.league?.image_url,
        serie: match.serie?.full_name || 'SEASON 2026',
        matchType: match.match_type || 'BO3',
        numberOfGames: match.number_of_games || 3,
        results: match.results || [],
        opponents: (match.opponents || []).map(opp => ({
          id: opp.opponent?.id,
          name: opp.opponent?.name,
          acronym: opp.opponent?.acronym || 'TBD',
          logo: opp.opponent?.image_url
        }))
      }));
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
