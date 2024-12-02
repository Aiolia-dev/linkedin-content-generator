export type ProjectType = 'linkedin_post' | 'article';

export type PostTone = 'inspiring' | 'instructive' | 'personal' | 'promotional' | 'engaging' | 'storytelling';
export type PostLength = 'short' | 'medium' | 'long';
export type PostFormality = 'formal_vous' | 'formal_tu' | 'informal_tu';

export type Tone = 
  | 'professional' 
  | 'casual' 
  | 'inspirational' 
  | 'educational' 
  | 'storytelling' 
  | 'promotional';

export type ContentLength = 'short' | 'medium' | 'long';

export type ContentLengthType = 'short' | 'medium' | 'long' | 'custom';

export interface ContentLengthConfig {
  type: ContentLengthType;
  minWords?: number;
  maxWords?: number;
  wordCount?: number; // Pour l'option personnalisée
}

export interface LinkedInPostContent {
  subject: string;
  style?: string;
  tone?: PostTone;
  length?: PostLength;
  formality?: PostFormality;
  generatedContent?: string;
  illustration?: string;
  isAdvanced?: boolean;
  contentLength: ContentLengthConfig;
}

export interface LinkedInCarouselContent {
  subject: string;
  slides: Array<{
    content: string;
    image?: string;
  }>;
  contentLength: ContentLengthConfig;
}

export interface BlogArticleContent {
  title: string;
  subject: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  contentLength: ContentLengthConfig;
}

export interface EditorialCalendarContent {
  startDate: Date;
  endDate: Date;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  topics: string[];
  scheduledPosts: Array<{
    date: Date;
    type: ProjectType;
    status: 'planned' | 'generated' | 'published';
  }>;
  contentLength: ContentLengthConfig;
}

export type ProjectContent = 
  | { type: 'linkedin_post'; content: LinkedInPostContent }
  | { type: 'linkedin_carousel'; content: LinkedInCarouselContent }
  | { type: 'blog_article'; content: BlogArticleContent }
  | { type: 'editorial_calendar'; content: EditorialCalendarContent };

export type ProjectStatus = 'draft' | 'published' | 'in_progress' | 'archived';

export interface Project {
  id?: string;
  type: ProjectType;
  title?: string;
  subject: string;
  tone: Tone;
  contentLength: ContentLengthConfig;
  keywords: string[];
  personaId?: string;
  status: ProjectStatus;
  generatedContent?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

// Couleurs par type de projet pour le dashboard
export const PROJECT_TYPE_COLORS = {
  linkedin_post: 'blue',
  article: 'purple',
} as const;

// Configuration des longueurs de contenu
export const CONTENT_LENGTH_CONFIG = {
  short: { min: 100, max: 250 },
  medium: { min: 300, max: 500 },
  long: { min: 600, max: 1000 },
} as const;

// Configuration des tons
export const TONE_DESCRIPTIONS = {
  professional: 'Formel et business-oriented',
  casual: 'Décontracté et conversationnel',
  inspirational: 'Motivant et encourageant',
  educational: 'Instructif et informatif',
  storytelling: 'Narratif et engageant',
  promotional: 'Persuasif et orienté conversion',
} as const;

// Libellés des types de projets
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  linkedin_post: 'Post LinkedIn',
  article: 'Article',
} as const;
