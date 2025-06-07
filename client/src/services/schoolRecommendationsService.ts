

export interface SchoolOpportunity {
  title: string;
  url: string;
}

export interface SchoolFeedback {
  schoolName: string;
  userId: string;
  interest: 'very-interested' | 'somewhat-interested' | 'not-interested';
  rating: number; // 1-5 stars
  feedback: string;
  specificConcerns: string[];
  whatAttractsYou: string[];
  submittedAt: Date;
}

export interface SchoolRecommendation {
  type: 'Reach' | 'Match' | 'Safety';
  name: string;
  location?: string; // Made optional since backend doesn't include this
  fit_score?: string; // Added fit_score field from backend
  fit: {
    academic: 'Great' | 'Good' | 'Fair' | 'Minimal';
    social_cultural: 'Great' | 'Good' | 'Fair' | 'Minimal';
    financial: 'Great' | 'Good' | 'Fair' | 'Minimal';
  };
  overall_fit_rationale: string[];
  distinctive_opportunities: SchoolOpportunity[];
  potential_challenges: string[];
  why_school_essay_points: string[];
  how_to_stand_out: string[];
  userFeedback?: SchoolFeedback;
}

export interface SchoolRecommendationsData {
  recommendations: SchoolRecommendation[];
}

export interface GenerationStatus {
  status: 'generating' | 'completed' | 'failed' | 'not_found';
  message?: string;
  error?: string;
  recommendation_count?: number;
  created_at?: string;
  updated_at?: string;
  recommendation_id?: string;
}

// Service for handling school recommendations data
export class SchoolRecommendationsService {
  private static readonly API_BASE_URL = 'http://127.0.0.1:8000';

  // Get school recommendations for a user
  static async getSchoolRecommendations(userId?: string): Promise<SchoolRecommendationsData> {
    if (!userId) {
      throw new Error('User ID is required to fetch recommendations');
    }

    try {
      console.log(`Fetching recommendations for user: ${userId}`);
      
      const response = await fetch(`${this.API_BASE_URL}/recommendations/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!data || !data.recommendations || data.recommendations.length === 0) {
          throw new Error('No recommendations found for this user');
        }

        console.log(`Successfully loaded ${data.recommendations.length} recommendations from API`);
        return {
          recommendations: data.recommendations.map((rec: any) => ({
            ...rec,
            // Ensure all required fields are present with fallbacks
            location: rec.location || 'Location not specified',
            fit_score: rec.fit_score || "50",
            fit: {
              academic: rec.fit?.academic || 'Good',
              social_cultural: rec.fit?.social_cultural || 'Good',
              financial: rec.fit?.financial || 'Good',
            },
            overall_fit_rationale: rec.overall_fit_rationale || [],
            distinctive_opportunities: rec.distinctive_opportunities || [],
            potential_challenges: rec.potential_challenges || [],
            why_school_essay_points: rec.why_school_essay_points || [],
            how_to_stand_out: rec.how_to_stand_out || [],
          }))
        };
      } else if (response.status === 404) {
        throw new Error('No recommendations found for this user');
      } else {
        console.error(`API returned error: ${response.status} ${response.statusText}`);
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching recommendations from API:', error);
      throw error;
    }
  }

  // Check generation status for a user
  static async getGenerationStatus(userId: string): Promise<GenerationStatus> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/recommendations/${userId}/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to get status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error checking generation status:', error);
      return { status: 'not_found', message: 'Could not check status' };
    }
  }

  // Generate new recommendations for a user
  static async generateRecommendations(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/recommendations/generate/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: data.status === 'generating' 
            ? 'Generation started successfully. Please check back in a few minutes.' 
            : 'Recommendations generated successfully!' 
        };
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `API returned ${response.status}`);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return { 
        success: false, 
        message: `Failed to generate recommendations: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Categorize recommendations by type
  static categorizeRecommendations(recommendations: SchoolRecommendation[]) {
    return {
      reach: recommendations.filter(rec => rec.type === 'Reach'),
      match: recommendations.filter(rec => rec.type === 'Match'),
      safety: recommendations.filter(rec => rec.type === 'Safety')
    };
  }

  // Get fit score as percentage
  static calculatefit_score(fit: SchoolRecommendation['fit'], fit_score?: string): number {
    // Use the fit_score from backend if available
    if (fit_score) {
      const score = parseInt(fit_score, 10);
      return isNaN(score) ? 50 : score;
    }
    
    // Fallback to calculated score based on fit levels
    const scoreMap = { 'Great': 100, 'Good': 75, 'Fair': 50, 'Minimal': 25 };
    const scores = [
      scoreMap[fit.academic] || 75,
      scoreMap[fit.social_cultural] || 75,
      scoreMap[fit.financial] || 75
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / 3);
  }

  // Get type color for UI
  static getTypeColor(type: SchoolRecommendation['type']): string {
    switch (type) {
      case 'Reach': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Match': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Safety': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
}