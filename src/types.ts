export type StatusLevel = 'available' | 'moderate' | 'saturated';

export interface Cubicle {
  id: string;
  name: string;
  capacity: number;
  isOccupied: boolean;
  status: 'available' | 'saturated';
  occupiedUntil?: string;
  hasPower: boolean;
}

export interface Floor {
  id: string;
  floorNumber: number;
  levelLabel: string; // e.g. 'Sótano 2', 'Sótano 1', 'Piso 1', 'Piso 2', etc.
  floorName: string;
  occupancyPercent: number;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats?: number;
  availablePlugs: number;
  totalPlugs: number;
  availableComputers: number;
  totalComputers: number;
  cubicles: Cubicle[];
  noiseLevel: 'Bajo' | 'Moderado' | 'Animado';
  studyType: 'Silencioso' | 'Mixto' | 'Trabajo Grupal';
  lastUpdatedMinutesAgo: number;
  description?: string;
}

export interface Building {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: 'Biblioteca' | 'Pabellón' | 'Centro de Servicios' | 'Innovación' | 'Comedor' | string;
  category: 'study' | 'dining';
  structureBadge: string; // e.g. "4 pisos · 2 sótanos", "3 pisos · 1 sótano", "5 pisos · 1 sótano", "1 piso", "2 pisos"
  description: string; // official PUCP location description
  generalOccupancyPercent: number;
  status: StatusLevel;
  totalFloors: number;
  floors: Floor[];
  coordinates: {
    x: number; // percentage on custom map (0 - 100)
    y: number;
    svgCoords?: { cx: number; cy: number };
  };
  campusZone: 'Norte' | 'Centro' | 'Sur' | 'Este' | 'Oeste';
  popularFor: string;
  openingHours: string;
  lastUpdatedMinutesAgo: number;
  walkingMinutesFromMainGate: number;
}

export interface FinderQuery {
  peopleCount: number;
  needsPlug: boolean;
  needsComputer: boolean;
  needsQuiet: boolean;
  needsGroup: boolean;
  duration: '30 min' | '1 hora' | '2 horas' | '3+ horas';
  preferredZone?: string;
}

export interface RecommendationResult {
  building: Building;
  floor: Floor;
  matchScore: number;
  reason: string;
  keyHighlights: string[];
  alternativeOption?: {
    building: Building;
    floor: Floor;
    reason: string;
  };
}

export interface CapacityReport {
  id: string;
  buildingId: string;
  buildingName?: string;
  floorId: string;
  floorNumber?: number;
  occupancyPercent: number;
  status: StatusLevel;
  reporterRole: 'student' | 'liderman' | 'admin';
  reporterName: string;
  timestamp: string;
  comment?: string;
  photoUrl?: string;
  availablePlugs?: number;
  availableComputers?: number;
  availableCubicles?: number;
  helpfulCount?: number;
  helpfulVotedByMe?: boolean;
}

export interface CommunityReport {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'liderman';
  userCode?: string;
  userFaculty?: string;
  userAvatar?: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorNumber: number;
  zoneName: string;
  occupancyPercent: number;
  statusLevel: StatusLevel;
  availablePlugs: number;
  availableComputers?: number;
  availableCubicles?: number;
  photoUrl?: string;
  comment?: string;
  timestamp: string;
  createdAt: number;
  verified: boolean;
  helpfulCount: number;
  helpfulVotedByMe?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetRole: 'student' | 'liderman' | 'both';
  category: 'first' | 'volume' | 'locations' | 'plugs' | 'streak' | 'elite';
  pointsReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  requiredCount?: number;
}

export interface UserGamification {
  points: number;
  level: number;
  levelTitle: string;
  reportsCount: number;
  photosCount: number;
  helpfulVotesReceived: number;
  streakDays: number;
  dailyPointsEarned: number;
  dailyPointsMax: number;
  unlockedBadges: string[];
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  codeOrUnit: string;
  role: 'student' | 'liderman';
  points: number;
  reportsCount: number;
  badgesCount: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export type UserRole = 'student' | 'liderman';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  code: string;
  facultyOrUnit?: string;
  assignedZone?: string;
  shift?: string;
  avatarInitials: string;
  gamification?: UserGamification;
}

export interface LidermanRound {
  id: string;
  timeSlot: string;
  buildingId: string;
  buildingName: string;
  floorNumber: number;
  zoneName: string;
  status: 'completed' | 'pending' | 'upcoming';
  completedAt?: string;
  occupancyReported?: number;
}

export interface LidermanReportItem {
  id: string;
  date: string;
  time: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorNumber: number;
  zoneName: string;
  occupancyPercent: number;
  statusLevel: StatusLevel;
  availablePlugs: number;
  availableComputers: number;
  availableCubicles: number;
  notes?: string;
  photoUrl?: string;
  supervisorChecked?: boolean;
}

export type LidermanTab = 'dashboard' | 'report' | 'history' | 'profile';

export type ActiveTab = 'home' | 'map' | 'availability' | 'profile';
