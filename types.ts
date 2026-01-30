
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum Status {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Assignee {
  ME = 'ME',
  PARTNER = 'PARTNER',
  BOTH = 'BOTH',
}

export enum EventType {
  DATE = 'DATE', // 💕
  BIRTHDAY = 'BIRTHDAY', // 🎂
  TRIP = 'TRIP', // ✈️
  OTHER = 'OTHER', // 📅
}

export interface User {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

// ============================================
// SPACES - Фундамент Life OS
// ============================================

export type SpaceType = 'personal' | 'shared' | 'group';

export interface SpaceMember {
  userId: string;
  role: 'owner' | 'member';
}

export interface Space {
  id: string;
  title: string;
  description?: string;
  type: SpaceType;
  members: SpaceMember[];
  createdAt: string;
  updatedAt: string;
}

export type ClusterColor = 'slate' | 'rose' | 'blue' | 'emerald' | 'amber' | 'violet';
export type ClusterSize = 'sm' | 'md' | 'lg';

export interface Cluster {
  id: string;
  title: string;
  createdAt: number;
  color: ClusterColor;
  size: ClusterSize;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  assignee: Assignee;
  deadline?: string;
  createdAt: number;
  clusterId?: string; // Link to a cluster
  spaceId: string; // ❗ Задачи НЕ существуют без Space
  x?: number; // Dashboard X position (percentage)
  y?: number; // Dashboard Y position (percentage)
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  spaceId: string; // Заметки привязаны к пространству
}

export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  type: EventType;
  description?: string;
  spaceId: string; // События привязаны к пространству
}

export interface ShoppingItem {
  id: string;
  title: string;
  category: string;
  addedBy: Assignee;
  isBought: boolean;
  spaceId: string; // Покупки привязаны к пространству
}

export interface AppState {
  spaces: Space[]; // ❗ Spaces — фундамент
  currentSpaceId: string | null;
  tasks: Task[];
  clusters: Cluster[];
  notes: Note[];
  events: Event[];
  shoppingList: ShoppingItem[];
  currentUser: User;
  partner: User;
}