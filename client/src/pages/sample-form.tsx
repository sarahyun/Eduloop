import React from 'react';
import { FormPage } from '@/components/FormPage';

// Sample form data structure
const sampleFormData = [
  {
    section: "Academic Interests",
    questions: [
      {
        id: "favorite_subjects",
        question: "What are your favorite subjects in school?",
        type: "textarea" as const
      },
      {
        id: "academic_goals",
        question: "What are your academic goals for college?",
        type: "textarea" as const
      },
      {
        id: "gpa_score",
        question: "What is your current GPA?",
        type: "number" as const
      }
    ]
  },
  {
    section: "Personal Interests",
    questions: [
      {
        id: "hobbies",
        question: "What hobbies or activities do you enjoy in your free time?",
        type: "textarea" as const
      },
      {
        id: "career_aspirations",
        question: "What career or field interests you most?",
        type: "text" as const
      },
      {
        id: "personal_values",
        question: "What values are most important to you?",
        type: "textarea" as const
      }
    ]
  },
  {
    section: "College Preferences",
    questions: [
      {
        id: "college_size",
        question: "Do you prefer large universities or smaller colleges?",
        type: "text" as const
      },
      {
        id: "location_preference",
        question: "What type of location appeals to you most?",
        type: "text" as const
      },
      {
        id: "campus_culture",
        question: "What kind of campus culture are you looking for?",
        type: "textarea" as const
      }
    ]
  }
];

export default function SampleFormPage() {
  return (
    <FormPage
      formData={sampleFormData}
      formTitle="Student Information Form"
      formId="student_info"
      userId={1}
    />
  );
}