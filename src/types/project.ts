export type ProjectType = 'linkedin_post' | 'linkedin_carousel' | 'blog_article' | 'editorial_calendar';

export type PostTone = 'inspiring' | 'instructive' | 'personal' | 'promotional' | 'engaging' | 'storytelling';
export type PostLength = 'short' | 'medium' | 'long';
export type PostFormality = 'formal_vous' | 'formal_tu' | 'informal_tu';

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

export type ProjectStatus = 'draft' | 'published';

export interface Project {
  id?: string;
  type: ProjectType;
  title?: string;
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
  userId?: string;
  personaId?: string | null;
  content: {
    subject: string;
    keywords: string;
    tone: string;
    targetAudience: string;
    generatedContent: string;
    contentLength: {
      type: 'short' | 'medium' | 'long' | 'custom';
      customWordCount?: number;
    };
  };
  status: ProjectStatus;
}

// Couleurs par type de projet pour le dashboard
export const PROJECT_TYPE_COLORS = {
  linkedin_post: 'blue',
  linkedin_carousel: 'purple',
  blog_article: 'green',
  editorial_calendar: 'orange',
} as const;

// Libellés des types de projets
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  linkedin_post: 'Post LinkedIn',
  linkedin_carousel: 'Carrousel LinkedIn',
  blog_article: 'Article de Blog',
  editorial_calendar: 'Calendrier Éditorial',
} as const;
