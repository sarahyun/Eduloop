import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

export interface StudentProfile {
  id: number;
  userId: number;
  academicInterests?: string[];
  careerGoals?: string[];
  values?: string[];
  learningStyle?: string;
  extracurriculars?: string[];
  gpa?: number;
  satScore?: number;
  actScore?: number;
  profileCompletion?: number;
}

export interface College {
  id: number;
  name: string;
  location: string;
  type?: string;
  size?: string;
  setting?: string;
  acceptanceRate?: number;
  averageSAT?: number;
  averageACT?: number;
  tuition?: number;
  description?: string;
  website?: string;
  imageUrl?: string;
  programs?: string[];
  tags?: string[];
}

export interface Conversation {
  id: number;
  userId: number;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

export interface CollegeRecommendation {
  id: number;
  userId: number;
  collegeId: number;
  matchScore: number;
  reasoning?: string;
  category?: string;
  college?: College;
}

export interface SavedCollege {
  id: number;
  userId: number;
  collegeId: number;
  notes?: string;
  college?: College;
}

export interface ProfileInsight {
  type: 'strength' | 'growth_area' | 'recommendation' | 'strategy';
  title: string;
  description: string;
  actionItems: string[];
}

export const api = {
  // Auth
  async register(userData: { username: string; password: string; email: string; fullName: string; grade?: string }) {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    return response.json();
  },

  async login(credentials: { username: string; password: string }) {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    return response.json();
  },

  // Profile
  async getProfile(userId: number): Promise<StudentProfile> {
    const response = await apiRequest('GET', `/api/profile/${userId}`);
    return response.json();
  },

  async createProfile(profileData: Omit<StudentProfile, 'id'>): Promise<StudentProfile> {
    const response = await apiRequest('POST', '/api/profile', profileData);
    return response.json();
  },

  async updateProfile(userId: number, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const response = await apiRequest('PUT', `/api/profile/${userId}`, updates);
    return response.json();
  },

  // Colleges
  async getColleges(): Promise<College[]> {
    const response = await apiRequest('GET', '/api/colleges');
    return response.json();
  },

  async searchColleges(query: string): Promise<College[]> {
    const response = await apiRequest('GET', `/api/colleges/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  async aiSearchColleges(query: string, userId?: number): Promise<{ colleges: any[]; searchStrategy: string }> {
    const response = await apiRequest('POST', '/api/colleges/ai-search', { query, userId });
    return response.json();
  },

  // Conversations
  async getConversations(userId: number): Promise<Conversation[]> {
    const response = await apiRequest('GET', `/api/conversations/${userId}`);
    return response.json();
  },

  async createConversation(conversationData: { userId: number; title?: string }): Promise<Conversation> {
    const response = await apiRequest('POST', '/api/conversations', conversationData);
    return response.json();
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await apiRequest('GET', `/api/conversations/${conversationId}/messages`);
    return response.json();
  },

  async sendMessage(conversationId: number, messageData: { role: string; content: string }): Promise<{ userMessage: Message; aiMessage?: Message }> {
    const response = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, messageData);
    return response.json();
  },

  // Recommendations
  async getRecommendations(userId: number): Promise<CollegeRecommendation[]> {
    const response = await apiRequest('GET', `/api/recommendations/${userId}`);
    return response.json();
  },

  async generateRecommendations(userId: number): Promise<CollegeRecommendation[]> {
    const response = await apiRequest('POST', '/api/recommendations/generate', { userId });
    return response.json();
  },

  // Saved Colleges
  async getSavedColleges(userId: number): Promise<SavedCollege[]> {
    const response = await apiRequest('GET', `/api/saved-colleges/${userId}`);
    return response.json();
  },

  async saveCollege(data: { userId: number; collegeId: number; notes?: string }): Promise<SavedCollege> {
    const response = await apiRequest('POST', '/api/saved-colleges', data);
    return response.json();
  },

  async removeSavedCollege(userId: number, collegeId: number): Promise<void> {
    await apiRequest('DELETE', `/api/saved-colleges/${userId}/${collegeId}`);
  },

  // Insights
  async generateInsights(userId: number): Promise<ProfileInsight[]> {
    const response = await apiRequest('POST', '/api/insights/generate', { userId });
    return response.json();
  },

  // Search History
  async getSearchHistory(userId: number): Promise<any[]> {
    const response = await apiRequest('GET', `/api/search-history/${userId}`);
    return response.json();
  }
};
