export interface Character {
    _id?: string;
    id: string;
    name: string;
    description: string;
    personality: string;
    background: string;
    prompt: string;
    imageUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
export interface CreateCharacterRequest {
    name: string;
    description: string;
    personality: string;
    background: string;
    prompt: string;
    imageUrl?: string;
  }