import { z } from "zod";

// MongoDB User Schema
export const userSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(), // Firebase UID
  email: z.string().email(),
  name: z.string(),
  role: z.string().default('student'),
  grade: z.string().nullable().optional(),
  students: z.array(z.string()).nullable().optional(),
  counselorId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  lastLogin: z.date().nullable().optional(),
});

// MongoDB Student Profile Schema
export const studentProfileSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(), // Firebase UID
  // Introduction section
  careerMajor: z.string().nullable().optional(),
  dreamSchools: z.string().nullable().optional(),
  introFreeTimeActivities: z.string().nullable().optional(),
  introCollegeExperience: z.string().nullable().optional(),
  extracurriculars: z.string().nullable().optional(),
  gpaTestScores: z.string().nullable().optional(),
  // Academic Information section
  currentGPA: z.string().nullable().optional(),
  satScore: z.string().nullable().optional(),
  actScore: z.string().nullable().optional(),
  apCourses: z.string().nullable().optional(),
  academicHonors: z.string().nullable().optional(),
  // Personal Information section
  personalBackground: z.string().nullable().optional(),
  personalValues: z.string().nullable().optional(),
  personalChallenges: z.string().nullable().optional(),
  personalGrowth: z.string().nullable().optional(),
  personalLeadership: z.string().nullable().optional(),
  personalCommunity: z.string().nullable().optional(),
  // Goals and Aspirations section
  collegeGoals: z.string().nullable().optional(),
  careerAspirations: z.string().nullable().optional(),
  personalGoals: z.string().nullable().optional(),
  // College Preferences section
  preferredMajors: z.string().nullable().optional(),
  collegeSize: z.string().nullable().optional(),
  collegeLocation: z.string().nullable().optional(),
  collegeCost: z.string().nullable().optional(),
  collegeEnvironment: z.string().nullable().optional(),
  collegeActivities: z.string().nullable().optional(),
  profileCompletion: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().nullable().optional(),
});

// MongoDB College Schema
export const collegeSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string(),
  size: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  location: z.string(),
  setting: z.string().nullable().optional(),
  acceptanceRate: z.number().nullable().optional(),
  averageSAT: z.number().nullable().optional(),
  averageACT: z.number().nullable().optional(),
  tuition: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
});

// MongoDB Conversation Schema
export const conversationSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(), // Firebase UID
  title: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().nullable().optional(),
});

// MongoDB Message Schema
export const messageSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  conversationId: z.string(), // ObjectId as string
  role: z.string(),
  content: z.string(),
  metadata: z.any().optional(),
  createdAt: z.date().default(() => new Date()),
});

// MongoDB College Recommendation Schema
export const collegeRecommendationSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(), // Firebase UID
  collegeId: z.string(), // ObjectId as string
  matchScore: z.number(),
  reasoning: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
});

// MongoDB Saved College Schema
export const savedCollegeSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(), // Firebase UID
  collegeId: z.string(), // ObjectId as string
  notes: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
});

// MongoDB Search Query Schema
export const searchQuerySchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(), // Firebase UID
  query: z.string(),
  results: z.any().optional(),
  createdAt: z.date().default(() => new Date()),
});

// MongoDB Question Response Schema
export const questionResponseSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(), // Firebase UID
  questionId: z.string(),
  sectionId: z.string(),
  response: z.string(),
  createdAt: z.date().default(() => new Date()),
});

// Insert schemas (for validation when creating new documents)
export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });
export const insertStudentProfileSchema = studentProfileSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export const insertCollegeSchema = collegeSchema.omit({ _id: true });
export const insertConversationSchema = conversationSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = messageSchema.omit({ _id: true, createdAt: true });
export const insertCollegeRecommendationSchema = collegeRecommendationSchema.omit({ _id: true, createdAt: true });
export const insertSavedCollegeSchema = savedCollegeSchema.omit({ _id: true, createdAt: true });
export const insertSearchQuerySchema = searchQuerySchema.omit({ _id: true, createdAt: true });
export const insertQuestionResponseSchema = questionResponseSchema.omit({ _id: true, createdAt: true });

// TypeScript types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type StudentProfile = z.infer<typeof studentProfileSchema>;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type College = z.infer<typeof collegeSchema>;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type CollegeRecommendation = z.infer<typeof collegeRecommendationSchema>;
export type InsertCollegeRecommendation = z.infer<typeof insertCollegeRecommendationSchema>;
export type SavedCollege = z.infer<typeof savedCollegeSchema>;
export type InsertSavedCollege = z.infer<typeof insertSavedCollegeSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type InsertQuestionResponse = z.infer<typeof insertQuestionResponseSchema>;