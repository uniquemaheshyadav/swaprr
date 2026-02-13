
export type Category = 'Item' | 'Study' | 'Skill';

export interface Location {
  lat: number;
  lng: number;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category: Category;
  price: string; // "₹500" or "20 Karma"
  image: string;
  owner: string;
  ownerId: string; // Added ownerId for chat
  college: string; // Added college field
  location: Location;
  marketPrice?: string; // Populated by AI
}

export interface UserProfile {
  uid: string; // Added uid
  name: string;
  college: string;
  bio: string;
  karma: number;
  sales: number;
  earnings: string;
  avatar: string;
}

export interface Notification {
  id: number;
  text: string;
  isRead: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
  participants: string[]; // [userId1, userId2]
  messages: Message[];
}

export enum Tab {
  HOME = 'home',
  SEARCH = 'search',
  SELL = 'sell', // Conceptual, mostly triggers modal
  CHAT = 'chat',
  PROFILE = 'profile',
}
