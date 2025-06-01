import { z } from "zod";

// MongoDB User Schema
export const userSchema = z.object({
  _id: z.string().optional(),
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

// MongoDB Conversation Schema
export const conversationSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Firebase UID
  title: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().nullable().optional(),
});

// MongoDB Message Schema
export const messageSchema = z.object({
  _id: z.string().optional(),
  conversationId: z.string(), // ObjectId as string
  role: z.string(),
  content: z.string(),
  metadata: z.any().optional(),
  createdAt: z.date().default(() => new Date()),
});

// MongoDB Saved College Schema
export const savedCollegeSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Firebase UID
  collegeId: z.string(), // ObjectId as string
  notes: z.string().nullable().optional(),
  createdAt: z.date().default(() => new Date()),
});

// MongoDB Search Query Schema
export const searchQuerySchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Firebase UID
  query: z.string(),
  results: z.any().optional(),
  createdAt: z.date().default(() => new Date()),
});

// MongoDB Question Response Schema
export const questionResponseSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(), // Firebase UID
  questionId: z.string(),
  sectionId: z.string(),
  response: z.string(),
  createdAt: z.date().default(() => new Date()),
});

// Insert schemas (for validation when creating new documents)
export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });
export const insertConversationSchema = conversationSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = messageSchema.omit({ _id: true, createdAt: true });
export const insertSavedCollegeSchema = savedCollegeSchema.omit({ _id: true, createdAt: true });
export const insertSearchQuerySchema = searchQuerySchema.omit({ _id: true, createdAt: true });
export const insertQuestionResponseSchema = questionResponseSchema.omit({ _id: true, createdAt: true });

// TypeScript types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type SavedCollege = z.infer<typeof savedCollegeSchema>;
export type InsertSavedCollege = z.infer<typeof insertSavedCollegeSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type InsertQuestionResponse = z.infer<typeof insertQuestionResponseSchema>;