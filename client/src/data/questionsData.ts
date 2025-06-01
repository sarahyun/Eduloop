export interface Question {
  id: number;
  question: string;
}

export interface QuestionsData {
  [key: string]: Question[];
}

export const questionsData: QuestionsData = {
    "Academic Information": [
      { id: 2, question: "What are your 3 favorite classes?" },
      { id: 3, question: "What subjects do you struggle with?" },
      { id: 4, question: "What academic topics, problems in the world, or questions fascinate you?" },
    ],
    "Extracurriculars and Interests": [
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
      { id: 5, question: "What are your parents' expectations for college?" },
      { id: 6, question: "Describe the type of community or environment where you feel most at home. What qualities or characteristics make you feel a sense of belonging?" }
    ]
  }; 