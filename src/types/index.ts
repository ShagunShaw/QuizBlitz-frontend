export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Option {
  text: string;
}

export interface Question {
  _id?: string;
  id?: string; // Sometimes backend uses id, sometimes _id
  question: string;
  options: Option[];
  correctOption: number;
  time: number; // in seconds
}

export interface Quiz {
  _id: string;
  Title: string;
  Description: string;
  roomCode: string;
  startTime: string; // ISO string
  isPermanent: boolean;
  creator: string | User;
  coHosts?: User[];
  Questions?: Question[];
  totalPoints?: number;
  QuestionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  errorMessage: string;
  errorCode: string;
}
