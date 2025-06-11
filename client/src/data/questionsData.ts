export interface Question {
  id: number;
  question: string;
}

export interface QuestionsData {
  [key: string]: Question[];
}

// Configuration for section requirements
export interface SectionConfig {
  isOptional: boolean;
  completionThreshold: number; // Percentage (0-1) of questions needed to mark as complete
}



export const sectionConfigs: Record<string, SectionConfig> = {
  "Introduction": {
    isOptional: true,
    completionThreshold: 0.0 // 0% - any answered question marks it complete since it's optional
  },
  "Academic Information": {
    isOptional: false,
    completionThreshold: 0.5 // 50% - default threshold
  },
  "Extracurriculars and Interests": {
    isOptional: false,
    completionThreshold: 0.5 // 50% - default threshold
  },
  "Personal Reflections": {
    isOptional: false,
    completionThreshold: 0.5 // 50% - default threshold
  },
  "College Preferences": {
    isOptional: false,
    completionThreshold: 0.5 // 50% - default threshold
  }
};

// Helper function to get section configuration
export const getSectionConfig = (sectionId: string): SectionConfig => {
  return sectionConfigs[sectionId] || { isOptional: false, completionThreshold: 0.5 };
};

export const questionsData: QuestionsData = {
  "Introduction": [
    { id: 1, question: "Do you have a career or major in mind? No worries if not." },
    { id: 2, question: "Got any dream schools in mind, if so why these schools?" },
    { id: 3, question: "Aside from hanging out with friends, how do you like to spend your time outside of school?" },
    { id: 4, question: "What are you looking for in your college experience? Also, anything that worries you about this process?" },
    { id: 5, question: "If you have a resume or a list of extracurriculars, feel free to paste or enter them here." },
    { id: 6, question: "What is your GPA and test scores?" }
  ],
    "Academic Information": [
      { id: 1, question: "What are your academic strengths and why?" },
      { id: 2, question: "What are your 3 favorite classes?" },
      { id: 3, question: "What subjects do you struggle with?" },
      { id: 4, question: "What academic topics, problems in the world, or questions fascinate you?" },
      { id: 5, question: "What is your GPA (weighted and unweighted)? What are your scores on the SAT/ACT?" }
    ],
    "Extracurriculars and Interests": [
      { id: 1, question: "What are your top 3 extracurriculars and why?" },
      { id: 2, question: "What are you most proud of outside of academics?" },
      { id: 3, question: "What fields or problems do you want to explore/solve in the world?" },
      { id: 4, question: "Aside from hanging out with friends, how do you like to spend your free time?" },
    ],
    "Personal Reflections": [
      { id: 1, question: "What makes you happy?" },
      { id: 2, question: "Describe a time you overcame a challenge." },
      { id: 3, question: "If you could be remembered for one thing, what would it be?" },
      { id: 4, question: "What's the most important lesson you've learned in high school?" },
    ],
    "College Preferences": [
      { id: 1, question: "What do you want in your college experience?" },
      { id: 2, question: "Do you prefer small, medium, or large schools?" },
      { id: 3, question: "What location experiences matter to you (arts, nature, city life, sports, etc)?" },
      { id: 4, question: "What majors are you interested in? Do you have any careers you're considering?" },
      { id: 5, question: "What are your parents' expectations for college?" },
      { id: 6, question: "Describe the type of community or environment where you feel most at home. What qualities or characteristics make you feel a sense of belonging?" }
    ]
  }; 