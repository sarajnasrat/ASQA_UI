export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  profileImage?: string;
  roles: string[];
}