import { mockSchoolRecsData } from '@/data/mockSchoolRecsData';

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
  location: string;
  fit: {
    academic: 'Great' | 'Good' | 'Fair';
    social_cultural: 'Great' | 'Good' | 'Fair';
    financial: 'Great' | 'Good' | 'Fair';
  };
  overall_fit_rationale: string[];
  distinctive_opportunities: SchoolOpportunity[];
  potential_challenges: string[];
  why_school_essay_points: string[];
  userFeedback?: SchoolFeedback;
}

export interface SchoolRecommendationsData {
  recommendations: SchoolRecommendation[];
}

// Service for handling school recommendations data - easy to replace with API calls later
export class SchoolRecommendationsService {
  // For now, return mock data. Replace this method with API call when ready
  static async getSchoolRecommendations(userId?: string): Promise<SchoolRecommendationsData> {
    // TODO: Replace with actual API call
    // return await fetch(`/api/recommendations/${userId}`).then(res => res.json());
    return mockSchoolRecsData as SchoolRecommendationsData;
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
  static calculateFitScore(fit: SchoolRecommendation['fit']): number {
    const scoreMap = { 'Great': 100, 'Good': 75, 'Fair': 50 };
    const scores = [
      scoreMap[fit.academic],
      scoreMap[fit.social_cultural],
      scoreMap[fit.financial]
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