import { API_BASE_URL } from '@/lib/config';

export interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  role: string;
  grade?: string;
  created_at?: string;
  last_login?: string;
}

class UserService {
  private static cache = new Map<string, { data: UserProfile; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getUserById(userId: string): Promise<UserProfile | null> {
    // Check cache first
    const cached = this.cache.get(userId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log('📦 Retrieved user from cache:', userId);
      return cached.data;
    }

    try {
      console.log('🔍 Fetching user from API:', userId);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Successfully fetched user data:', userData);
        
        // Cache the result
        this.cache.set(userId, {
          data: userData,
          timestamp: now
        });
        
        return userData;
      } else if (response.status === 404) {
        console.warn('👤 User not found:', userId);
        return null;
      } else {
        console.error('❌ API error:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('🚨 Error fetching user:', error);
      return null;
    }
  }

  static clearCache(userId?: string) {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }

  static getCacheSize(): number {
    return this.cache.size;
  }
}

export { UserService }; 