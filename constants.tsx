
import { Player, Match, PastMatch } from './types.ts';

export const MOCK_PLAYERS: Player[] = [
  {
    id: '1',
    name: 'Luka Modrić',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-6QcgLtmi1iGs74HvNi2ejnR2Uo8luxsB8hSNgFor0I2QMvNoLbac-_9tALyWK67R-SfNXKUkW3vhFYDVwmQbBl3KyNHKLio6PDbzFdAPhh0Asda39jir_kmtx5GnhUXKLY7444fVI_Z7H7LUi7-nQpR9FcSMTaBEz88zEEkUPRWXIb4zl0MmjfDHQ596upCvC0rZRyMTbsdfJ3Nvz9XDEIZqCKxtG9Ae1dJ_bSjypVmK1VL46yRqR6oRJw92wQfFtWwK06-DpZM',
    number: 10,
    team: 'Real Madrid',
    goals: 15,
    assists: 8,
    concededGoals: 0,
    position: 'Central Midfield',
    status: 'presente',
    // Added required playerType property
    playerType: 'mensalista',
    skills: { attack: 85, defense: 75, stamina: 90 }
  },
  {
    id: '2',
    name: 'Ivan Perišić',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3kBR_1BNcs_F2xj-YCW49GrETZMjVqLrNGCIaXFFLgNzRnvRVhtFPtVJI7WeMihcjSpc2fkWVgM4BuFyH-H7U0pFnupxe1zhcvdsyTYu5E7kqQwCUYDmGJNjfw4h0Wf1xEIE5abPBNezgJzakkmgsDSdEChKeo9kYldd5OtYcGQf-MFc_S361IlU7NXKRumiKYVk3d3rgV_sK-zgNMHf2H3EdTqHOOfE9iA-AujSGk3T4Nh-3jHGeicgNyZ_3Pyycql8ylkPj4a4',
    number: 4,
    team: 'Hajduk Split',
    goals: 12,
    assists: 10,
    concededGoals: 0,
    position: 'Winger',
    status: 'presente',
    // Added required playerType property
    playerType: 'mensalista',
    skills: { attack: 88, defense: 60, stamina: 85 }
  },
  {
    id: '3',
    name: 'Mateo Kovačić',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP2qy9SHdlb6SvUqp7RN1Hca-YHopQkmbCnJyoacr0U6NG4OL4mbfkNjgN47nR1eofSv-FYH8OEPgjE55NcHWNz2HvQ0kWP5z81YaglKRopyaLcEW6Io9ul0Ixyh47KiU-0SSMuhtr0Xo2-egvFVi3hONkPXgOkFUnN0pmYgJGDkCP5RrJ_5cGaFsdwWoS9MddIO3T9HMn99GvZptQ-lAaRTKVMUMvjXlkS6rwG3Q23R9oedUS3_Rr7hpIpQFkVRNHDUMeoGGpQAE',
    team: 'Manchester City',
    goals: 8,
    assists: 6,
    concededGoals: 0,
    position: 'Midfielder',
    status: 'presente',
    // Added required playerType property
    playerType: 'mensalista',
    skills: { attack: 75, defense: 80, stamina: 92 }
  },
  {
    id: '4',
    name: 'Joško Gvardiol',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLkBa64rjjAdkDd7p8d53DwbTVtJ_flR0AKKcoDKqHc8bR4JxgdVnsbuhIuCUDScxDW9MlFOUPBNpb-hu7R-29VE_6Npn_cN5RbqpAlQz4DnZv9R3SM1Zdmi-sZwY59_pCmFy6sRh_xOwZnb8P_Pa8BRMkqdkY1UqyyMtEW0MXitJ2T-dc6CroWHogFLAuQ2H7GAZ7xSjFxrdZ8nNSWl-cPv8kW64ggcmPKX4QRMcuqQQSH8-WltPKagRi-5okFrCUGCReWAPUVi4',
    team: 'Manchester City',
    goals: 2,
    assists: 2,
    concededGoals: 0,
    position: 'Defender',
    status: 'pendente',
    // Added required playerType property
    playerType: 'mensalista',
    skills: { attack: 65, defense: 95, stamina: 88 }
  },
  {
    id: '5',
    name: 'Andrej Kramarić',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNmn0mKfjEZd4TzdbCQdnL8JBiv0e7wnyFijlNbYeeHu1jVuzOQmKRKzRJsV_pJ-x_9SPKensU_HYZFEGTGpbH5FjtrncKeyKiOPrOhZS1hjtEtgrKuSqz4tD8dewo8wWwMPjpcCm4DKrdYL9POzn45KDiOWzFG5bunOLw7Sygb51ufhs8gtalRVafKCp-A2RBu4fzRea42DdZEwnfiPYYqMQel_g7aeY63Ry3RUrh4UDwb4F_O651kLdvdZgqpZ9S33w92LmZeW8',
    team: 'Hoffenheim',
    goals: 10,
    assists: 3,
    concededGoals: 0,
    position: 'Forward',
    status: 'presente',
    // Added required playerType property
    playerType: 'avulso',
    skills: { attack: 92, defense: 40, stamina: 80 }
  }
];

export const CURRENT_MATCH: Match = {
  id: 'match-2026-feb',
  location: 'Elite Arena Pro',
  date: '2026-02-15',
  time: '20:00',
  type: 'Society',
  price: 40.00,
  confirmedPlayers: 18,
  fieldSlots: 30,
  gkSlots: 4,
  createdAt: '2026-02-01T10:00:00Z'
};

export const MOCK_HISTORY: PastMatch[] = [
  { id: 'h2026-1', opponent: 'Fúria FC', score: { us: 4, them: 2 }, date: '2026-02-10', type: 'Society' },
  { id: 'h2026-2', opponent: 'Amigos do Pelé', score: { us: 2, them: 2 }, date: '2026-02-05', type: 'Futsal' },
  { id: 'h2026-3', opponent: 'Ajax Elite', score: { us: 3, them: 1 }, date: '2026-01-28', type: 'Campo' },
];
