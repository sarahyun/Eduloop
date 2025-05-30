import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  grade: text("grade"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // Academic Information section
  favoriteClasses: text("favorite_classes"),
  strugglingSubjects: text("struggling_subjects"), 
  academicFascinations: text("academic_fascinations"),
  academicAdditionalInfo: text("academic_additional_info"),
  // Extracurriculars and Interests section
  proudOfOutsideAcademics: text("proud_of_outside_academics"),
  fieldsToExplore: text("fields_to_explore"),
  freeTimeActivities: text("free_time_activities"),
  extracurricularsAdditionalInfo: text("extracurriculars_additional_info"),
  // Personal Reflections section
  whatMakesHappy: text("what_makes_happy"),
  challengeOvercome: text("challenge_overcome"),
  rememberedFor: text("remembered_for"),
  importantLesson: text("important_lesson"),
  personalAdditionalInfo: text("personal_additional_info"),
  // College Preferences section
  collegeExperience: text("college_experience"),
  schoolSize: text("school_size"),
  locationExperiences: text("location_experiences"),
  parentsExpectations: text("parents_expectations"),
  communityEnvironment: text("community_environment"),
  collegeAdditionalInfo: text("college_additional_info"),
  // Basic academic data
  gpa: real("gpa"),
  satScore: integer("sat_score"),
  actScore: integer("act_score"),
  profileCompletion: integer("profile_completion").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  type: text("type"), // public, private, liberal arts, etc.
  size: text("size"), // small, medium, large
  setting: text("setting"), // urban, suburban, rural
  acceptanceRate: real("acceptance_rate"),
  averageSAT: integer("average_sat"),
  averageACT: integer("average_act"),
  tuition: integer("tuition"),
  description: text("description"),
  website: text("website"),
  imageUrl: text("image_url"),
  programs: text("programs").array(),
  tags: text("tags").array(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // for storing additional context
  createdAt: timestamp("created_at").defaultNow(),
});

export const collegeRecommendations = pgTable("college_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  collegeId: integer("college_id").notNull(),
  matchScore: real("match_score").notNull(),
  reasoning: text("reasoning"),
  category: text("category"), // reach, match, safety
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedColleges = pgTable("saved_colleges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  collegeId: integer("college_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  query: text("query").notNull(),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  grade: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  updatedAt: true,
});

export const insertCollegeSchema = createInsertSchema(colleges).omit({
  id: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertCollegeRecommendationSchema = createInsertSchema(collegeRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertSavedCollegeSchema = createInsertSchema(savedColleges).omit({
  id: true,
  createdAt: true,
});

export const insertSearchQuerySchema = createInsertSchema(searchQueries).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type College = typeof colleges.$inferSelect;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type CollegeRecommendation = typeof collegeRecommendations.$inferSelect;
export type InsertCollegeRecommendation = z.infer<typeof insertCollegeRecommendationSchema>;
export type SavedCollege = typeof savedColleges.$inferSelect;
export type InsertSavedCollege = z.infer<typeof insertSavedCollegeSchema>;
export type SearchQuery = typeof searchQueries.$inferSelect;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
