export interface Professional {
  id: number;
  name: string;
  email: string;
  specialty: string;
  license: string;
  avatar: string;
}

export interface Note {
  id: number;
  date: string;
  content: string;
  author: string;
}

export interface Meeting {
  id: number;
  clientId: number;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  link: string;
  notes?: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  lastSession: string;
  sessionsCount: number;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  currentPlan: string;
  notes: string;
  clinicalNotes: Note[];
  order: number;
  meetings?: Meeting[];
}

export interface ProfessionalStats {
  totalClients: number;
  activeClients: number;
  pendingClients: number;
  totalSessions: number;
}

export type ClientStatus = 'all' | 'active' | 'inactive' | 'pending';
export type MoodTrend = 'improving' | 'stable' | 'declining';
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';