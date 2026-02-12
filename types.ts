
export interface Player {
  id: string;
  name: string;
  photoUrl: string;
  number?: number;
  team?: string;
  goals: number;
  position: string;
  status: 'presente' | 'pendente';
  skills: {
    attack: number;
    defense: number;
    stamina: number;
  };
}

export interface Match {
  id: string;
  location: string;
  date: string;
  time: string;
  type: 'Futsal' | 'Society' | 'Campo';
  price: number;
  confirmedPlayers: number;
  totalSlots: number;
}

export interface PastMatch {
  id: string;
  opponent: string;
  score: { us: number; them: number };
  date: string;
  type: 'Futsal' | 'Society' | 'Campo';
}

export enum Page {
  Login = 'login',
  Dashboard = 'dashboard',
  PlayerList = 'players',
  Ranking = 'ranking',
  CreateMatch = 'create-match',
  Profile = 'profile'
}
