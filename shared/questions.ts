export const PROFILE_SECTIONS = {
  "Introduction": [
    { id: 1, question: "Do you have a career or major in mind? No worries if not." },
    { id: 2, question: "Got any dream schools in mind, if so why these schools?" },
    { id: 3, question: "Aside from hanging out with friends, how do you like to spend your time outside of school?" },
    { id: 4, question: "What are you looking for in your college experience? Also, anything that worries you about this process?" },
    { id: 5, question: "If you have a resume or a list of extracurriculars, feel free to paste or enter them here." },
    { id: 6, question: "What is your GPA and test scores?" }
  ],
  "Academic Information": [
    { id: 1, question: "What are your 3 favorite classes?" },
    { id: 2, question: "What subjects do you struggle with?" },
    { id: 3, question: "What academic topics, problems in the world, or questions fascinate you?" }
  ],
  "Extracurriculars and Interests": [
    { id: 1, question: "What are you most proud of outside of academics?" },
    { id: 2, question: "What fields or problems do you want to explore/solve in the world?" },
    { id: 3, question: "Aside from hanging out with friends, how do you like to spend your free time?" }
  ],
  "Personal Reflections": [
    { id: 1, question: "What makes you happy?" },
    { id: 2, question: "Describe a time you overcame a challenge." },
    { id: 3, question: "If you could be remembered for one thing, what would it be?" },
    { id: 4, question: "What's the most important lesson you've learned in high school?" }
  ],
  "College Preferences": [
    { id: 1, question: "What do you want in your college experience?" },
    { id: 2, question: "Do you prefer small, medium, or large schools?" },
    { id: 3, question: "What location experiences matter to you (arts, nature, city life, sports, etc)?" },
    { id: 4, question: "What are your parents' expectations for college?" },
    { id: 5, question: "Describe the type of community or environment where you feel most at home. What qualities or characteristics make you feel a sense of belonging?" }
  ]
};

export type SectionId = keyof typeof PROFILE_SECTIONS;
export type QuestionId = number;