import { 
  users, 
  studentProfiles,
  colleges,
  conversations,
  messages,
  collegeRecommendations,
  savedColleges,
  searchQueries,
  type User, 
  type InsertUser,
  type StudentProfile,
  type InsertStudentProfile,
  type College,
  type InsertCollege,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type CollegeRecommendation,
  type InsertCollegeRecommendation,
  type SavedCollege,
  type InsertSavedCollege,
  type SearchQuery,
  type InsertSearchQuery
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Student profiles
  getStudentProfile(userId: number): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(userId: number, profile: Partial<StudentProfile>): Promise<StudentProfile>;

  // Colleges
  getCollege(id: number): Promise<College | undefined>;
  getColleges(): Promise<College[]>;
  searchColleges(query: string): Promise<College[]>;
  createCollege(college: InsertCollege): Promise<College>;

  // Conversations
  getConversation(id: number): Promise<Conversation | undefined>;
  getUserConversations(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, conversation: Partial<Conversation>): Promise<Conversation>;

  // Messages
  getConversationMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // College recommendations
  getUserRecommendations(userId: number): Promise<CollegeRecommendation[]>;
  createRecommendation(recommendation: InsertCollegeRecommendation): Promise<CollegeRecommendation>;

  // Saved colleges
  getUserSavedColleges(userId: number): Promise<SavedCollege[]>;
  createSavedCollege(savedCollege: InsertSavedCollege): Promise<SavedCollege>;
  deleteSavedCollege(userId: number, collegeId: number): Promise<void>;

  // Search queries
  createSearchQuery(searchQuery: InsertSearchQuery): Promise<SearchQuery>;
  getUserSearchHistory(userId: number): Promise<SearchQuery[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getStudentProfile(userId: number): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId));
    return profile || undefined;
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const [studentProfile] = await db
      .insert(studentProfiles)
      .values(profile)
      .returning();
    return studentProfile;
  }

  async updateStudentProfile(userId: number, profileUpdate: Partial<StudentProfile>): Promise<StudentProfile> {
    const [updated] = await db
      .update(studentProfiles)
      .set({ ...profileUpdate, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getCollege(id: number): Promise<College | undefined> {
    const [college] = await db.select().from(colleges).where(eq(colleges.id, id));
    return college || undefined;
  }

  async getColleges(): Promise<College[]> {
    return await db.select().from(colleges);
  }

  async searchColleges(query: string): Promise<College[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(colleges)
      .where(like(colleges.name, searchTerm));
  }

  async createCollege(college: InsertCollege): Promise<College> {
    const [newCollege] = await db
      .insert(colleges)
      .values(college)
      .returning();
    return newCollege;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateConversation(id: number, conversationUpdate: Partial<Conversation>): Promise<Conversation> {
    const [updated] = await db
      .update(conversations)
      .set({ ...conversationUpdate, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getUserRecommendations(userId: number): Promise<CollegeRecommendation[]> {
    return await db
      .select()
      .from(collegeRecommendations)
      .where(eq(collegeRecommendations.userId, userId))
      .orderBy(desc(collegeRecommendations.createdAt));
  }

  async createRecommendation(recommendation: InsertCollegeRecommendation): Promise<CollegeRecommendation> {
    const [newRecommendation] = await db
      .insert(collegeRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async getUserSavedColleges(userId: number): Promise<SavedCollege[]> {
    return await db
      .select()
      .from(savedColleges)
      .where(eq(savedColleges.userId, userId))
      .orderBy(desc(savedColleges.createdAt));
  }

  async createSavedCollege(savedCollege: InsertSavedCollege): Promise<SavedCollege> {
    const [newSavedCollege] = await db
      .insert(savedColleges)
      .values(savedCollege)
      .returning();
    return newSavedCollege;
  }

  async deleteSavedCollege(userId: number, collegeId: number): Promise<void> {
    await db
      .delete(savedColleges)
      .where(
        and(
          eq(savedColleges.userId, userId),
          eq(savedColleges.collegeId, collegeId)
        )
      );
  }

  async createSearchQuery(searchQuery: InsertSearchQuery): Promise<SearchQuery> {
    const [newSearchQuery] = await db
      .insert(searchQueries)
      .values(searchQuery)
      .returning();
    return newSearchQuery;
  }

  async getUserSearchHistory(userId: number): Promise<SearchQuery[]> {
    return await db
      .select()
      .from(searchQueries)
      .where(eq(searchQueries.userId, userId))
      .orderBy(desc(searchQueries.createdAt));
  }
}

export const storage = new DatabaseStorage();