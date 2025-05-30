import {
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
  type InsertSearchQuery,
  type QuestionResponse,
  type InsertQuestionResponse,
} from "@shared/schema";
import { connectToMongoDB } from "./mongodb";
import { ObjectId } from "mongodb";

// Interface for storage operations
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUserId(userId: string): Promise<User | undefined>;
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

  // Question responses
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  updateQuestionResponse(userId: number, questionId: string, response: Partial<QuestionResponse>): Promise<QuestionResponse>;
  getUserQuestionResponses(userId: number, section?: string): Promise<QuestionResponse[]>;
  getQuestionResponse(userId: number, questionId: string): Promise<QuestionResponse | undefined>;
}

export class MongoDBStorage implements IStorage {
  private async getDb() {
    return await connectToMongoDB();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const db = await this.getDb();
    const user = await db.collection('users').findOne({ id });
    return user ? { ...user, _id: user._id?.toString() } as User : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await this.getDb();
    const user = await db.collection('users').findOne({ email });
    return user ? { ...user, _id: user._id?.toString() } as User : undefined;
  }

  async getUserByUserId(userId: string): Promise<User | undefined> {
    const db = await this.getDb();
    const user = await db.collection('users').findOne({ userId });
    return user ? { ...user, _id: user._id?.toString() } as User : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const user = {
      ...insertUser,
      createdAt: new Date(),
      lastLogin: null,
    };
    const result = await db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId.toString() } as User;
  }

  // Student profiles
  async getStudentProfile(userId: number): Promise<StudentProfile | undefined> {
    const db = await this.getDb();
    const profile = await db.collection('studentProfiles').findOne({ userId: userId.toString() });
    return profile ? { ...profile, _id: profile._id?.toString() } as StudentProfile : undefined;
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const db = await this.getDb();
    const studentProfile = {
      ...profile,
      createdAt: new Date(),
      updatedAt: null,
    };
    const result = await db.collection('studentProfiles').insertOne(studentProfile);
    return { ...studentProfile, _id: result.insertedId.toString() } as StudentProfile;
  }

  async updateStudentProfile(userId: number, profileUpdate: Partial<StudentProfile>): Promise<StudentProfile> {
    const db = await this.getDb();
    const updated = {
      ...profileUpdate,
      updatedAt: new Date(),
    };
    await db.collection('studentProfiles').updateOne(
      { userId: userId.toString() },
      { $set: updated }
    );
    const profile = await db.collection('studentProfiles').findOne({ userId: userId.toString() });
    return { ...profile, _id: profile._id?.toString() } as StudentProfile;
  }

  // Colleges
  async getCollege(id: number): Promise<College | undefined> {
    const db = await this.getDb();
    const college = await db.collection('colleges').findOne({ _id: new ObjectId(id.toString()) });
    return college ? { ...college, _id: college._id?.toString() } as College : undefined;
  }

  async getColleges(): Promise<College[]> {
    const db = await this.getDb();
    const colleges = await db.collection('colleges').find({}).toArray();
    return colleges.map(c => ({ ...c, _id: c._id?.toString() })) as College[];
  }

  async searchColleges(query: string): Promise<College[]> {
    const db = await this.getDb();
    const colleges = await db.collection('colleges').find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
    return colleges.map(c => ({ ...c, _id: c._id?.toString() })) as College[];
  }

  async createCollege(college: InsertCollege): Promise<College> {
    const db = await this.getDb();
    const result = await db.collection('colleges').insertOne(college);
    return { ...college, _id: result.insertedId.toString() } as College;
  }

  // Conversations
  async getConversation(id: number): Promise<Conversation | undefined> {
    const db = await this.getDb();
    const conversation = await db.collection('conversations').findOne({ _id: new ObjectId(id.toString()) });
    return conversation ? { ...conversation, _id: conversation._id?.toString() } as Conversation : undefined;
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    const db = await this.getDb();
    const conversations = await db.collection('conversations').find({ userId: userId.toString() }).toArray();
    return conversations.map(c => ({ ...c, _id: c._id?.toString() })) as Conversation[];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const db = await this.getDb();
    const newConversation = {
      ...conversation,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('conversations').insertOne(newConversation);
    return { ...newConversation, _id: result.insertedId.toString() } as Conversation;
  }

  async updateConversation(id: number, conversationUpdate: Partial<Conversation>): Promise<Conversation> {
    const db = await this.getDb();
    const updated = {
      ...conversationUpdate,
      updatedAt: new Date(),
    };
    await db.collection('conversations').updateOne(
      { _id: new ObjectId(id.toString()) },
      { $set: updated }
    );
    const conversation = await db.collection('conversations').findOne({ _id: new ObjectId(id.toString()) });
    return { ...conversation, _id: conversation._id?.toString() } as Conversation;
  }

  // Messages
  async getConversationMessages(conversationId: number): Promise<Message[]> {
    const db = await this.getDb();
    const messages = await db.collection('messages').find({ conversationId: conversationId.toString() }).toArray();
    return messages.map(m => ({ ...m, _id: m._id?.toString() })) as Message[];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const db = await this.getDb();
    const newMessage = {
      ...message,
      createdAt: new Date(),
    };
    const result = await db.collection('messages').insertOne(newMessage);
    return { ...newMessage, _id: result.insertedId.toString() } as Message;
  }

  // College recommendations
  async getUserRecommendations(userId: number): Promise<CollegeRecommendation[]> {
    const db = await this.getDb();
    const recommendations = await db.collection('collegeRecommendations').find({ userId: userId.toString() }).toArray();
    return recommendations.map(r => ({ ...r, _id: r._id?.toString() })) as CollegeRecommendation[];
  }

  async createRecommendation(recommendation: InsertCollegeRecommendation): Promise<CollegeRecommendation> {
    const db = await this.getDb();
    const newRecommendation = {
      ...recommendation,
      createdAt: new Date(),
    };
    const result = await db.collection('collegeRecommendations').insertOne(newRecommendation);
    return { ...newRecommendation, _id: result.insertedId.toString() } as CollegeRecommendation;
  }

  // Saved colleges
  async getUserSavedColleges(userId: number): Promise<SavedCollege[]> {
    const db = await this.getDb();
    const savedColleges = await db.collection('savedColleges').find({ userId: userId.toString() }).toArray();
    return savedColleges.map(s => ({ ...s, _id: s._id?.toString() })) as SavedCollege[];
  }

  async createSavedCollege(savedCollege: InsertSavedCollege): Promise<SavedCollege> {
    const db = await this.getDb();
    const newSavedCollege = {
      ...savedCollege,
      createdAt: new Date(),
    };
    const result = await db.collection('savedColleges').insertOne(newSavedCollege);
    return { ...newSavedCollege, _id: result.insertedId.toString() } as SavedCollege;
  }

  async deleteSavedCollege(userId: number, collegeId: number): Promise<void> {
    const db = await this.getDb();
    await db.collection('savedColleges').deleteOne({ 
      userId: userId.toString(), 
      collegeId: collegeId.toString() 
    });
  }

  // Search queries
  async createSearchQuery(searchQuery: InsertSearchQuery): Promise<SearchQuery> {
    const db = await this.getDb();
    const newSearchQuery = {
      ...searchQuery,
      createdAt: new Date(),
    };
    const result = await db.collection('searchQueries').insertOne(newSearchQuery);
    return { ...newSearchQuery, _id: result.insertedId.toString() } as SearchQuery;
  }

  async getUserSearchHistory(userId: number): Promise<SearchQuery[]> {
    const db = await this.getDb();
    const searches = await db.collection('searchQueries').find({ userId: userId.toString() }).toArray();
    return searches.map(s => ({ ...s, _id: s._id?.toString() })) as SearchQuery[];
  }

  // Question responses
  async createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse> {
    const db = await this.getDb();
    const newResponse = {
      ...response,
      createdAt: new Date(),
    };
    const result = await db.collection('questionResponses').insertOne(newResponse);
    return { ...newResponse, _id: result.insertedId.toString() } as QuestionResponse;
  }

  async updateQuestionResponse(userId: number, questionId: string, response: Partial<QuestionResponse>): Promise<QuestionResponse> {
    const db = await this.getDb();
    await db.collection('questionResponses').updateOne(
      { userId: userId.toString(), questionId },
      { $set: response },
      { upsert: true }
    );
    const updated = await db.collection('questionResponses').findOne({ userId: userId.toString(), questionId });
    return { ...updated, _id: updated._id?.toString() } as QuestionResponse;
  }

  async getUserQuestionResponses(userId: number, section?: string): Promise<QuestionResponse[]> {
    const db = await this.getDb();
    const filter: any = { userId: userId.toString() };
    if (section) {
      filter.sectionId = section;
    }
    const responses = await db.collection('questionResponses').find(filter).toArray();
    return responses.map(r => ({ ...r, _id: r._id?.toString() })) as QuestionResponse[];
  }

  async getQuestionResponse(userId: number, questionId: string): Promise<QuestionResponse | undefined> {
    const db = await this.getDb();
    const response = await db.collection('questionResponses').findOne({ 
      userId: userId.toString(), 
      questionId 
    });
    return response ? { ...response, _id: response._id?.toString() } as QuestionResponse : undefined;
  }
}

export const storage = new MongoDBStorage();