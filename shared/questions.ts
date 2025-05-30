export const PROFILE_SECTIONS = {
  "Academic Information": [
    { id: "favoriteClasses", question: "What are your 3 favorite classes?" },
    { id: "strugglingSubjects", question: "What subjects do you struggle with?" },
    { id: "academicFascinations", question: "What academic topics, problems in the world, or questions fascinate you?" },
    { id: "academicAdditionalInfo", question: "Additional information" }
  ],
  "Extracurriculars and Interests": [
    { id: "proudOfOutsideAcademics", question: "What are you most proud of outside of academics?" },
    { id: "fieldsToExplore", question: "What fields or problems do you want to explore/solve in the world?" },
    { id: "freeTimeActivities", question: "Aside from hanging out with friends, how do you like to spend your free time?" },
    { id: "extracurricularsAdditionalInfo", question: "Additional information" }
  ],
  "Personal Reflections": [
    { id: "whatMakesHappy", question: "What makes you happy?" },
    { id: "challengeOvercome", question: "Describe a time you overcame a challenge." },
    { id: "rememberedFor", question: "If you could be remembered for one thing, what would it be?" },
    { id: "importantLesson", question: "What's the most important lesson you've learned in high school?" },
    { id: "personalAdditionalInfo", question: "Additional information" }
  ],
  "College Preferences": [
    { id: "collegeExperience", question: "What do you want in your college experience?" },
    { id: "schoolSize", question: "Do you prefer small, medium, or large schools?" },
    { id: "locationExperiences", question: "What location experiences matter to you (arts, nature, city life, sports, etc)?" },
    { id: "parentsExpectations", question: "What are your parents' expectations for college?" },
    { id: "communityEnvironment", question: "Describe the type of community or environment where you feel most at home. What qualities or characteristics make you feel a sense of belonging?" },
    { id: "collegeAdditionalInfo", question: "Additional information" }
  ]
};

export type SectionId = keyof typeof PROFILE_SECTIONS;
export type QuestionId = string;