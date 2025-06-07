

export interface ProfileSectionData {
  section_id: string;
  title: string;
  type: 'paragraph' | 'bullets' | 'key_value' | 'timeline' | 'table';
  content: string | string[] | Record<string, any>[] | Record<string, string>;
}

export interface StudentProfileData {
  student_profile: ProfileSectionData[];
}

// Service for handling profile data
export class ProfileDataService {
  private static readonly API_BASE_URL = 'http://127.0.0.1:8000';

  static async getStudentProfile(userId?: string): Promise<StudentProfileData> {
    if (!userId) {
      throw new Error('User ID is required to fetch profile data');
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/profiles/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (!data || !data.student_profile) {
          throw new Error('No profile data found for this user');
        }
        return data as StudentProfileData;
      } else if (response.status === 404) {
        throw new Error('Profile not found for this user');
      } else {
        console.error(`API returned error: ${response.status} ${response.statusText}`);
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching profile data from API:', error);
      throw error;
    }
  }

  // Categorize sections for tab organization
  static categorizeProfileSections(profileData: ProfileSectionData[]) {
    return {
      academic: profileData.filter(section => 
        ['academic_profile', 'intellectual_interests'].includes(section.section_id)
      ),
      personal: profileData.filter(section => 
        ['core_snapshot', 'core_values_and_drives', 'hidden_strengths'].includes(section.section_id)
      ),
      activities: profileData.filter(section => 
        ['extracurriculars'].includes(section.section_id)
      ),
      future: profileData.filter(section => 
        ['college_fit', 'future_direction', 'final_insight'].includes(section.section_id)
      )
    };
  }

  // Get profile completion percentage based on actual data
  static calculateProfileCompletion(profileData: ProfileSectionData[]): number {
    if (!profileData || profileData.length === 0) {
      return 0;
    }

    const totalSections = profileData.length;
    const completedSections = profileData.filter(section => {
      if (typeof section.content === 'string') {
        return section.content.trim().length > 0;
      } else if (Array.isArray(section.content)) {
        return section.content.length > 0;
      } else if (typeof section.content === 'object') {
        return Object.keys(section.content).length > 0;
      }
      return false;
    }).length;

    return Math.round((completedSections / totalSections) * 100);
  }
}