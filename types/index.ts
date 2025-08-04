// Central type definitions for OpenScholar Hub

// User & Authentication Types
export interface User {
  id: string;
  uid: string; // Firebase uid - alias for id for compatibility
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface UserProfile extends User {
  bio?: string;
  institution?: string;
  researchAreas?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    orcid?: string;
  };
}

// Project Types
export interface Project {
  id: string;
  title: string;
  description: string;
  category?: string;
  featured?: boolean;
  tags?: string[];
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  members: number;
  status: 'active' | 'planning' | 'completed' | 'archived';
  relatedResearch?: ResearchPaper[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface ProjectFilters {
  category?: string;
  featured?: boolean;
  sortBy?: 'recent' | 'popular';
  searchTerm?: string;
  lastVisible?: any;
  pageSize?: number;
}

export interface ProjectsResponse {
  projects: Project[];
  lastVisible: any;
  hasMore: boolean;
}

// Research & Article Types
export interface ResearchPaper {
  id: string;
  originalId?: string;
  title: string;
  authors: string | string[];
  year: string | number;
  journal?: string;
  abstract?: string;
  url?: string;
  citations?: number;
  createdAt?: string;
  storedInFirestore?: boolean;
}

export interface SavedPaper extends ResearchPaper {
  paperId: string;
  userId: string;
  savedAt: string;
  notes?: string;
  tags?: string[];
}

export interface ScholarSearchParams {
  query: string;
  author?: string;
  publication?: string;
  yearFrom?: number;
  yearTo?: number;
  proxyLocation?: string;
  userAgent?: string;
}

export interface ScholarArticle {
  id: string;
  title: string;
  authors: string;
  year: string;
  journal?: string;
  abstract?: string;
  url?: string;
  citations?: number;
  extras?: {
    citations?: {
      count?: string;
    };
  };
}

export interface CitationData {
  count: number;
  citingArticles: ScholarArticle[];
}

// Chat & Messaging Types
export interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  topic?: string;
  memberCount: number;
  isArchived: boolean;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: string;
  text?: string;
  user: string;
  timestamp: string;
  threadTs?: string;
  replyCount?: number;
  reactions?: Reaction[];
  files?: MessageFile[];
  blocks?: any[];
  isBot?: boolean;
  channel?: string;
}

export interface Reaction {
  name: string;
  count: number;
  users: string[];
}

export interface MessageFile {
  id: string;
  name: string;
  url: string;
  mimetype: string;
  size: number;
}

export interface ChatState {
  channels: Channel[];
  directMessages: DirectMessage[];
  currentChannel: Channel | null;
  currentDM: DirectMessage | null;
  messages: Message[];
  hasMoreMessages: boolean;
  nextCursor: string | null;
  isLoading: boolean;
  error: string | null;
  unreadCounts: Record<string, number>;
}

export interface ChatContextValue extends ChatState {
  fetchChannels: () => Promise<void>;
  fetchDirectMessages: () => Promise<void>;
  fetchMessages: (channelId: string, reset?: boolean) => Promise<void>;
  sendMessage: (channelId: string, text: string, blocks?: any[], threadTs?: string) => Promise<Message>;
  createChannel: (name: string, isPrivate?: boolean, userIds?: string[]) => Promise<Channel>;
  setCurrentChannel: (channelId: string) => Promise<void>;
  setCurrentDM: (dmId: string) => Promise<void>;
  loadMoreMessages: () => void;
  handleNewMessage: (message: Message) => void;
  addReaction: (channelId: string, messageId: string, emoji: string) => Promise<boolean>;
  removeReaction: (channelId: string, messageId: string, emoji: string) => Promise<boolean>;
  createDirectMessage: (userId: string) => Promise<DirectMessage>;
  sendTypingIndicator: (channelId: string) => void;
}

// Chat Reducer Action Types
export type ChatAction =
  | { type: 'SET_CHANNELS'; payload: Channel[] }
  | { type: 'SET_DIRECT_MESSAGES'; payload: DirectMessage[] }
  | { type: 'SET_CURRENT_CHANNEL'; payload: Channel }
  | { type: 'SET_CURRENT_DM'; payload: DirectMessage }
  | { type: 'SET_MESSAGES'; payload: { messages: Message[]; hasMore: boolean; nextCursor: string | null } }
  | { type: 'ADD_MESSAGES'; payload: { messages: Message[]; hasMore: boolean; nextCursor: string | null } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_UNREAD_COUNTS'; payload: { id: string } }
  | { type: 'RESET_UNREAD_COUNT'; payload: string }
  | { type: 'ADD_REACTION'; payload: { messageId: string; name: string; user: string } }
  | { type: 'REMOVE_REACTION'; payload: { messageId: string; name: string; user: string } };

// API Types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

// Socket.io Event Types
export interface SocketEvent {
  type: 'new_message' | 'reaction_added' | 'reaction_removed' | 'channel_created' | 'user_typing';
  message?: Message;
  reaction?: {
    messageId: string;
    name: string;
    user: string;
  };
  channel?: string;
  user?: string;
}

// UI State Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UIState {
  globalLoading: boolean;
  loadingText: string;
  activeModal: string | null;
  modalProps: Record<string, any>;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notifications: Notification[];
  theme: 'light' | 'dark' | 'system';
  layoutCompact: boolean;
}

// Auth Context Types
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  emailSignUp: (email: string, password: string) => Promise<User>;
  emailSignIn: (email: string, password: string) => Promise<User>;
  googleSignIn: () => Promise<User>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

// Component Prop Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  children: React.ReactNode;
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'notification';
  size?: 'small' | 'medium';
  children: React.ReactNode;
  className?: string;
}

export interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  className?: string;
}

// Form Types
export interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

// Layout Types
export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

// Page Props Types
export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
}