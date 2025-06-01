export interface ProfileQuestion {
  id: string;
  question: string;
  placeholder?: string;
  profileField: string; // Maps to the actual profile field name
}

export interface ProfileSection {
  id: string;
  title: string;
  description: string;
  questions: ProfileQuestion[];
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'Academic Information',
    title: 'Academic Information',
    description: 'Favorite classes, subjects, academic interests',
    questions: [
      {
        id: '2',
        question: 'What are your 3 favorite classes?',
        placeholder: 'Tell us about the subjects that excite you most...',
        profileField: 'favoriteClasses'
      },
      {
        id: '3',
        question: 'What subjects do you struggle with?',
        placeholder: 'Share any academic challenges you face...',
        profileField: 'strugglingSubjects'
      },
      {
        id: '4',
        question: 'What academic topics, problems in the world, or questions fascinate you?',
        placeholder: 'Describe topics you explore on your own time...',
        profileField: 'academicFascinations'
      }
    ]
  },
  {
    id: 'Extracurriculars and Interests',
    title: 'Extracurriculars and Interests',
    description: 'What you\'re proud of, fields to explore, free time activities',
    questions: [
      {
        id: '2',
        question: 'What are you most proud of outside of academics?',
        placeholder: 'Share your non-academic achievements and activities...',
        profileField: 'proudOfOutsideAcademics'
      },
      {
        id: '3',
        question: 'What fields or problems do you want to explore/solve in the world?',
        placeholder: 'Tell us about areas you\'re curious to learn more about...',
        profileField: 'fieldsToExplore'
      },
      {
        id: '4',
        question: 'Aside from hanging out with friends, how do you like to spend your free time?',
        placeholder: 'Describe your hobbies and interests...',
        profileField: 'freeTimeActivities'
      }
    ]
  },
  {
    id: 'Personal Reflections',
    title: 'Personal Reflections',
    description: 'What makes you happy, challenges overcome, values',
    questions: [
      {
        id: '1',
        question: 'What makes you happy?',
        placeholder: 'Share what brings you joy and fulfillment...',
        profileField: 'whatMakesHappy'
      },
      {
        id: '2',
        question: 'Describe a time you overcame a challenge.',
        placeholder: 'Tell us about a difficult situation you navigated...',
        profileField: 'challengeOvercome'
      },
      {
        id: '3',
        question: 'If you could be remembered for one thing, what would it be?',
        placeholder: 'Share your aspirations for your legacy and impact...',
        profileField: 'rememberedFor'
      },
      {
        id: '4',
        question: 'What\'s the most important lesson you\'ve learned in high school?',
        placeholder: 'Reflect on a significant learning experience...',
        profileField: 'importantLesson'
      }
    ]
  },
  {
    id: 'College Preferences',
    title: 'College Preferences',
    description: 'College experience, school size, location preferences',
    questions: [
      {
        id: '1',
        question: 'What do you want in your college experience?',
        placeholder: 'Describe your ideal college environment and experience...',
        profileField: 'collegeExperience'
      },
      {
        id: '2',
        question: 'Do you prefer small, medium, or large schools?',
        placeholder: 'Describe your preference for school size...',
        profileField: 'schoolSize'
      },
      {
        id: '3',
        question: 'What location experiences matter to you (arts, nature, city life, sports, etc)?',
        placeholder: 'Share your preferences for college location and setting...',
        profileField: 'locationExperiences'
      },
      {
        id: '5',
        question: 'What are your parents\' expectations for college?',
        placeholder: 'Describe your family\'s perspective on your college plans...',
        profileField: 'parentsExpectations'
      },
      {
        id: '6',
        question: 'Describe the type of community or environment where you feel most at home. What qualities or characteristics make you feel a sense of belonging?',
        placeholder: 'Tell us about the social and community aspects you value...',
        profileField: 'communityEnvironment'
      }
    ]
  }
];

// Helper function to get section by ID
export const getSectionById = (sectionId: string): ProfileSection | undefined => {
  return PROFILE_SECTIONS.find(section => section.id === sectionId);
};

// Helper function to get all section IDs
export const getSectionIds = (): string[] => {
  return PROFILE_SECTIONS.map(section => section.id);
};

// Helper function to check if a section is completed based on profile data
export const isSectionCompleted = (sectionId: string, profile: any): boolean => {
  const section = getSectionById(sectionId);
  if (!section || !profile) return false;
  
  // Check if at least half of the questions in the section have answers
  const answeredQuestions = section.questions.filter(question => 
    profile[question.profileField] && profile[question.profileField].trim() !== ''
  );
  
  return answeredQuestions.length >= Math.ceil(section.questions.length / 2);
};

// Helper function to get completion status for all sections
export const getSectionCompletionStatus = (profile: any) => {
  return PROFILE_SECTIONS.map(section => ({
    ...section,
    completed: isSectionCompleted(section.id, profile),
    lastUpdated: profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : null
  }));
}; 