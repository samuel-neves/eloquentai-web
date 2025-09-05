export interface ChatMessageInterface {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequestInterface {
  message: string;
  conversation_id?: string;
}

export interface ChatResponseInterface {
  response: string;
  conversation_id: string;
  sources?: string[];
  confidence_score?: number;
  category?: string;
  related_categories?: string[];
}

export interface ConversationInterface {
  id: string;
  title: string;
  messages: ChatMessageInterface[];
  created_at: string;
  updated_at: string;
}

interface FintechFAQMetadataInterface {
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  faq_type: "fintech";
}

interface FileUploadMetadataInterface {
  filename: string;
  content_type: string;
}

interface GeneralDocumentMetadataInterface {
  [key: string]: string | number | boolean | string[] | undefined;
}

export type DocumentMetadataType = FintechFAQMetadataInterface | FileUploadMetadataInterface | GeneralDocumentMetadataInterface;

export interface DocumentUploadInterface {
  content: string;
  title: string;
  metadata?: DocumentMetadataType;
}

interface DocumentSearchMetadataInterface {
  [key: string]: string | number | boolean | string[] | undefined;
  
  title?: string;
  content?: string;
  faq_type?: "fintech" | "general";
  
  category?: string;
  question?: string;
  answer?: string;
  keywords?: string[];
  
  filename?: string;
  content_type?: string;
}

export interface DocumentSearchResultInterface {
  id: string;
  score: number;
  content: string;
  title: string;
  metadata: DocumentSearchMetadataInterface;
}

export interface AuthRequestInterface {
  email: string;
  password: string;
}

export interface AuthResponseInterface {
  success: boolean;
  session_id: string;
  token: string;
  user_type: string;
  message: string;
}

export interface SessionInfoInterface {
  session_id: string;
  user_type: string;
  email?: string;
  is_authenticated: boolean;
  conversation_count: number;
  session_duration: string;
  last_activity: string;
  created_at: string;
}

export interface CategoryQueryInterface {
  question: string;
  category: string;
  session_id?: string;
}

export interface CategoryResponseInterface {
  answer: string;
  category: string;
  confidence_score: number;
  sources: string[];
  related_categories: string[];
  session_id: string;
}

export interface FintechCategoryInterface {
  name: string;
  description: string;
}

export interface CategoryListResponseInterface {
  categories: FintechCategoryInterface[];
  total_categories: number;
}

export interface DemoCredentialsInterface {
  email: string;
  password: string;
  note: string;
  anonymous_option: string;
}
