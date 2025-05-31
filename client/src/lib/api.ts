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
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  async login(credentials: { username: string; password: string }) {
    try {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Profile
  async getProfile(userId: number): Promise<StudentProfile> {
    try {
      const response = await apiRequest('GET', `/api/profiles/${userId}`);
      return response.json();
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  },

  async createProfile(profileData: Omit<StudentProfile, 'id'>): Promise<StudentProfile> {
    try {
      const response = await apiRequest('POST', '/api/profiles', profileData);
      return response.json();
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  },

  async updateProfile(userId: number, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      const response = await apiRequest('PUT', `/api/profiles/${userId}`, updates);
      return response.json();
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Colleges
  async getColleges(): Promise<College[]> {
    try {
      const response = await apiRequest('GET', '/api/colleges');
      return response.json();
    } catch (error) {
      console.error('Failed to get colleges:', error);
      // Return empty array as fallback
      return [];
    }
  },

  async searchColleges(query: string): Promise<College[]> {
    try {
      const response = await apiRequest('GET', `/api/colleges/search?q=${encodeURIComponent(query)}`);
      return response.json();
    } catch (error) {
      console.error('Failed to search colleges:', error);
      return [];
    }
  },

  async aiSearchColleges(query: string, userId?: number): Promise<{ colleges: any[]; searchStrategy: string }> {
    try {
      const response = await apiRequest('POST', '/api/colleges/ai-search', { query, userId });
      return response.json();
    } catch (error) {
      console.error('Failed to perform AI search:', error);
      return { colleges: [], searchStrategy: '' };
    }
  },

  // Conversations
  async getConversations(userId: number): Promise<Conversation[]> {
    try {
      const response = await apiRequest('GET', `/api/conversations/${userId}`);
      return response.json();
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  },

  async createConversation(conversationData: { userId: number; title?: string }): Promise<Conversation> {
    try {
      const response = await apiRequest('POST', '/api/conversations', conversationData);
      return response.json();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    try {
      const response = await apiRequest('GET', `/api/messages/${conversationId}`);
      return response.json();
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  },

  async sendMessage(conversationId: number, messageData: { role: string; content: string }): Promise<{ userMessage: Message; aiMessage?: Message }> {
    try {
      const response = await apiRequest('POST', '/api/messages', { ...messageData, conversationId });
      return response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  // Recommendations
  async getRecommendations(userId: number): Promise<CollegeRecommendation[]> {
    try {
      const response = await apiRequest('GET', `/api/college-recommendations/${userId}`);
      return response.json();
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  },

  async generateRecommendations(userId: number): Promise<CollegeRecommendation[]> {
    try {
      const response = await apiRequest('POST', '/api/college-recommendations/generate', { userId });
      return response.json();
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      throw error;
    }
  },

  // Saved Colleges
  async getSavedColleges(userId: number): Promise<SavedCollege[]> {
    try {
      const response = await apiRequest('GET', `/api/saved-colleges/${userId}`);
      return response.json();
    } catch (error) {
      console.error('Failed to get saved colleges:', error);
      return [];
    }
  },

  async saveCollege(data: { userId: number; collegeId: number; notes?: string }): Promise<SavedCollege> {
    try {
      const response = await apiRequest('POST', '/api/saved-colleges', data);
      return response.json();
    } catch (error) {
      console.error('Failed to save college:', error);
      throw error;
    }
  },

  async removeSavedCollege(userId: number, collegeId: number): Promise<void> {
    try {
      await apiRequest('DELETE', `/api/saved-colleges/${userId}/${collegeId}`);
    } catch (error) {
      console.error('Failed to remove saved college:', error);
      throw error;
    }
  },

  // Insights
  async generateInsights(userId: number): Promise<ProfileInsight[]> {
    try {
      const response = await apiRequest('POST', `/api/profile-insights/${userId}`);
      return response.json();
    } catch (error) {
      console.error('Failed to generate insights:', error);
      return [];
    }
  },

  // Search History
  async getSearchHistory(userId: number): Promise<any[]> {
    try {
      const response = await apiRequest('GET', `/api/search-history/${userId}`);
      return response.json();
    } catch (error) {
      console.error('Failed to get search history:', error);
      return [];
    }
  }
};
