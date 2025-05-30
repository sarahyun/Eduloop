export const PROFILE_SECTIONS = {
  "Academic Information": [
    { id: "favoriteClasses", question: "What are your 3 favorite classes you've taken so far, and what makes them special to you?" },
    { id: "strugglingSubjects", question: "What subjects do you find particularly challenging or struggle with?" },
    { id: "academicFascinations", question: "What academic topics, problems in the world, or questions fascinate you most?" },
    { id: "academicAdditionalInfo", question: "Additional information" }
  ],
  "Personal Interests": [
    { id: "hobbiesAndInterests", question: "What do you love doing in your free time? What hobbies or interests bring you joy?" },
    { id: "passionProjects", question: "Tell me about a project, activity, or cause you're passionate about." },
    { id: "personalValues", question: "What values are most important to you? What principles guide your decisions?" },
    { id: "interestsAdditionalInfo", question: "Additional information" }
  ],
  "Background & Goals": [
    { id: "careerAspirations", question: "What career path or field are you considering? What draws you to this area?" },
    { id: "lifeGoals", question: "What do you hope to accomplish in your life? What impact do you want to make?" },
    { id: "personalChallenges", question: "What challenges have you overcome that have shaped who you are today?" },
    { id: "goalsAdditionalInfo", question: "Additional information" }
  ],
  "College Preferences": [
    { id: "idealCollegeEnvironment", question: "Describe your ideal college environment. What kind of campus culture would help you thrive?" },
    { id: "importantCollegeFactors", question: "What factors are most important to you when choosing a college?" },
    { id: "preferredLocation", question: "Do you have preferences about location, climate, or distance from home?" },
    { id: "collegeAdditionalInfo", question: "Additional information" }
  ]
};

export type SectionId = keyof typeof PROFILE_SECTIONS;
export type QuestionId = string;