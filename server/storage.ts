import { 
  users, 
  studentProfiles,
  colleges,
  conversations,
  messages,
  collegeRecommendations,
  savedColleges,
  searchQueries,
  questionResponses,
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
  type InsertQuestionResponse
} from "@shared/schema";

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

  // Question responses
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  updateQuestionResponse(userId: number, questionId: string, response: Partial<QuestionResponse>): Promise<QuestionResponse>;
  getUserQuestionResponses(userId: number, section?: string): Promise<QuestionResponse[]>;
  getQuestionResponse(userId: number, questionId: string): Promise<QuestionResponse | undefined>;


}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private studentProfiles: Map<number, StudentProfile>;
  private colleges: Map<number, College>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private collegeRecommendations: Map<number, CollegeRecommendation>;
  private savedColleges: Map<number, SavedCollege>;
  private searchQueries: Map<number, SearchQuery>;
  private questionResponses: Map<string, QuestionResponse>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.studentProfiles = new Map();
    this.colleges = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.collegeRecommendations = new Map();
    this.savedColleges = new Map();
    this.searchQueries = new Map();
    this.questionResponses = new Map();
    this.currentId = 1;

    // Initialize with sample colleges
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const user1: User = {
      id: 1,
      username: "student1",
      password: "password123",
      email: "student1@example.com",
      fullName: "Alex Johnson",
      grade: "12th",
      createdAt: new Date()
    };
    this.users.set(1, user1);

    // Create sample student profile
    const profile1: StudentProfile = {
      id: 1,
      userId: 1,
      // Introduction section - empty for new user
      careerMajor: null,
      dreamSchools: null,
      introFreeTimeActivities: null,
      introCollegeExperience: null,
      extracurriculars: null,
      gpaTestScores: null,
      // Academic Information section
      favoriteClasses: null,
      strugglingSubjects: null,
      academicFascinations: null,
      academicAdditionalInfo: null,
      // Extracurriculars and Interests section
      proudOfOutsideAcademics: null,
      fieldsToExplore: null,
      freeTimeActivities: null,
      extracurricularsAdditionalInfo: null,
      // Personal Reflections section
      whatMakesHappy: null,
      challengeOvercome: null,
      rememberedFor: null,
      importantLesson: null,
      personalAdditionalInfo: null,
      // College Preferences section
      collegeExperience: null,
      schoolSize: null,
      locationExperiences: null,
      parentsExpectations: null,
      communityEnvironment: null,
      collegeAdditionalInfo: null,
      // Basic academic data
      gpa: null,
      satScore: null,
      actScore: null,
      profileCompletion: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.studentProfiles.set(1, profile1);

    const sampleColleges: InsertCollege[] = [
      {
        name: "Stanford University",
        location: "Stanford, CA",
        type: "private",
        size: "medium",
        setting: "suburban",
        acceptanceRate: 0.04,
        averageSAT: 1500,
        averageACT: 34,
        tuition: 58416,
        description: "A leading research university known for innovation and entrepreneurship",
        website: "https://www.stanford.edu",
        imageUrl: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        programs: ["Computer Science", "Engineering", "Business", "Medicine"],
        tags: ["Innovation", "Tech", "Research", "Entrepreneurship"]
      },
      {
        name: "Massachusetts Institute of Technology",
        location: "Cambridge, MA",
        type: "private",
        size: "medium",
        setting: "urban",
        acceptanceRate: 0.07,
        averageSAT: 1520,
        averageACT: 35,
        tuition: 57986,
        description: "World-renowned for science, technology, engineering, and innovation",
        website: "https://www.mit.edu",
        imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        programs: ["Engineering", "Computer Science", "Physics", "Mathematics"],
        tags: ["STEM", "Research", "Innovation", "Technology"]
      },
      {
        name: "University of California, Berkeley",
        location: "Berkeley, CA",
        type: "public",
        size: "large",
        setting: "urban",
        acceptanceRate: 0.17,
        averageSAT: 1430,
        averageACT: 32,
        tuition: 44066,
        description: "Top public research university with strong programs across disciplines",
        website: "https://www.berkeley.edu",
        imageUrl: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        programs: ["Engineering", "Business", "Social Sciences", "Liberal Arts"],
        tags: ["Public Ivy", "Research", "Diversity", "Innovation"]
      }
    ];

    sampleColleges.forEach(college => {
      this.createCollege(college);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getStudentProfile(userId: number): Promise<StudentProfile | undefined> {
    return Array.from(this.studentProfiles.values()).find(profile => profile.userId === userId);
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const id = this.currentId++;
    const studentProfile: StudentProfile = {
      ...profile,
      id,
      updatedAt: new Date()
    };
    this.studentProfiles.set(id, studentProfile);
    return studentProfile;
  }

  async updateStudentProfile(userId: number, profileUpdate: Partial<StudentProfile>): Promise<StudentProfile> {
    const existing = await this.getStudentProfile(userId);
    if (!existing) {
      throw new Error("Student profile not found");
    }
    
    const updated: StudentProfile = {
      ...existing,
      ...profileUpdate,
      updatedAt: new Date()
    };
    this.studentProfiles.set(existing.id, updated);
    return updated;
  }

  async getCollege(id: number): Promise<College | undefined> {
    return this.colleges.get(id);
  }

  async getColleges(): Promise<College[]> {
    return Array.from(this.colleges.values());
  }

  async searchColleges(query: string): Promise<College[]> {
    const queryLower = query.toLowerCase();
    return Array.from(this.colleges.values()).filter(college => 
      college.name.toLowerCase().includes(queryLower) ||
      college.location.toLowerCase().includes(queryLower) ||
      college.description?.toLowerCase().includes(queryLower) ||
      college.programs?.some(program => program.toLowerCase().includes(queryLower)) ||
      college.tags?.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  async createCollege(college: InsertCollege): Promise<College> {
    const id = this.currentId++;
    const newCollege: College = { ...college, id };
    this.colleges.set(id, newCollege);
    return newCollege;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.currentId++;
    const now = new Date();
    const newConversation: Conversation = {
      ...conversation,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: number, conversationUpdate: Partial<Conversation>): Promise<Conversation> {
    const existing = this.conversations.get(id);
    if (!existing) {
      throw new Error("Conversation not found");
    }
    
    const updated: Conversation = {
      ...existing,
      ...conversationUpdate,
      updatedAt: new Date()
    };
    this.conversations.set(id, updated);
    return updated;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const newMessage: Message = {
      ...message,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getUserRecommendations(userId: number): Promise<CollegeRecommendation[]> {
    return Array.from(this.collegeRecommendations.values())
      .filter(rec => rec.userId === userId)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  async createRecommendation(recommendation: InsertCollegeRecommendation): Promise<CollegeRecommendation> {
    const id = this.currentId++;
    const newRecommendation: CollegeRecommendation = {
      ...recommendation,
      id,
      createdAt: new Date()
    };
    this.collegeRecommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  async getUserSavedColleges(userId: number): Promise<SavedCollege[]> {
    return Array.from(this.savedColleges.values())
      .filter(saved => saved.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createSavedCollege(savedCollege: InsertSavedCollege): Promise<SavedCollege> {
    const id = this.currentId++;
    const newSavedCollege: SavedCollege = {
      ...savedCollege,
      id,
      createdAt: new Date()
    };
    this.savedColleges.set(id, newSavedCollege);
    return newSavedCollege;
  }

  async deleteSavedCollege(userId: number, collegeId: number): Promise<void> {
    const saved = Array.from(this.savedColleges.values())
      .find(saved => saved.userId === userId && saved.collegeId === collegeId);
    if (saved) {
      this.savedColleges.delete(saved.id);
    }
  }

  async createSearchQuery(searchQuery: InsertSearchQuery): Promise<SearchQuery> {
    const id = this.currentId++;
    const newSearchQuery: SearchQuery = {
      ...searchQuery,
      id,
      createdAt: new Date()
    };
    this.searchQueries.set(id, newSearchQuery);
    return newSearchQuery;
  }

  async getUserSearchHistory(userId: number): Promise<SearchQuery[]> {
    return Array.from(this.searchQueries.values())
      .filter(query => query.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 10);
  }

  // Question response methods
  async createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse> {
    const id = this.currentId++;
    const newResponse: QuestionResponse = {
      ...response,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const key = `${response.userId}-${response.questionId}`;
    this.questionResponses.set(key, newResponse);
    return newResponse;
  }

  async updateQuestionResponse(userId: number, questionId: string, response: Partial<QuestionResponse>): Promise<QuestionResponse> {
    const key = `${userId}-${questionId}`;
    const existing = this.questionResponses.get(key);
    if (!existing) {
      throw new Error('Question response not found');
    }
    
    const updated: QuestionResponse = {
      ...existing,
      ...response,
      updatedAt: new Date()
    };
    this.questionResponses.set(key, updated);
    return updated;
  }

  async getUserQuestionResponses(userId: number, section?: string): Promise<QuestionResponse[]> {
    return Array.from(this.questionResponses.values())
      .filter(response => response.userId === userId && (!section || response.section === section));
  }

  async getQuestionResponse(userId: number, questionId: string): Promise<QuestionResponse | undefined> {
    const key = `${userId}-${questionId}`;
    return this.questionResponses.get(key);
  }
}

export const storage = new MemStorage();
