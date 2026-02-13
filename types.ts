
export interface Player {
  id: string;
  name: string;
  photoUrl: string;
  number?: number;
  team?: string;
  goals: number;
  assists: number;
  concededGoals: number;
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
  fieldSlots: number;
  gkSlots: number;
  confirmedPlayers: number;
  createdAt: string;
}

export interface PastMatch {
  id: string;
  opponent: string;
  score: {
    us: number;
    them: number;
  };
  date: string;
  type: 'Futsal' | 'Society' | 'Campo';
}

export enum Page {
  Login = 'login',
  Onboarding = 'onboarding',
  Dashboard = 'dashboard',
  PlayerList = 'players',
  Ranking = 'ranking',
  CreateMatch = 'create-match',
  Profile = 'profile'
}
