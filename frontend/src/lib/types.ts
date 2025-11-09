export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isPublic: boolean;
  createdAt: string;
  username: string;
}
