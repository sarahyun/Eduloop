import mockStudentProfileData from '@/data/mockStudentProfileData';

export interface ProfileSectionData {
  section_id: string;
  title: string;
  type: 'paragraph' | 'bullets' | 'key_value' | 'timeline' | 'table';
  content: string | string[] | Record<string, any>[] | Record<string, string>;
}

export interface StudentProfileData {
  student_profile: ProfileSectionData[];
}

// Service for handling profile data - easy to replace with API calls later
export class ProfileDataService {
  // For now, return mock data. Replace this method with API call when ready
  static async getStudentProfile(userId?: string): Promise<StudentProfileData> {
    // TODO: Replace with actual API call
    // return await fetch(`/api/profiles/${userId}`).then(res => res.json());
    return mockStudentProfileData as StudentProfileData;
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

  // Get profile completion percentage (replace with real calculation later)
  static calculateProfileCompletion(profileData: ProfileSectionData[]): number {
    // TODO: Replace with actual completion calculation based on filled fields
    return 95;
  }
}