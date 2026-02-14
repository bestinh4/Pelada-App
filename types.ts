
export interface Player {
  id: string;
  name: string;
  email?: string | null;
  photoUrl: string;
  number?: number;
  team?: string;
  goals: number;
  assists: number;
  concededGoals: number;
  position: string;
  status: 'presente' | 'pendente';
  playerType: 'mensalista' | 'avulso';
  paymentStatus?: 'pago' | 'pendente';
  role?: 'admin' | 'player';
  pushEnabled?: boolean;
  skills?: {
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

export enum Page {
  Login = 'login',
  Onboarding = 'onboarding',
  Dashboard = 'dashboard',
  PlayerList = 'players',
  Ranking = 'ranking',
  CreateMatch = 'create-match',
  Profile = 'profile'
}
