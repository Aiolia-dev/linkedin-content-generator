export interface Persona {
  id: string;
  title: string;
  description: string;
  parentId?: string | null; // Pour gérer les versions/variantes
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export interface PersonaFormData {
  title: string;
  description: string;
  parentId?: string | null;
}
