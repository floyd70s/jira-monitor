export enum UserStatus {
  ACTIVE = 'ACTIVE',     // < 4 weeks (Green)
  WARNING = 'WARNING',   // 4-6 weeks (Yellow)
  INACTIVE = 'INACTIVE'  // > 6 weeks or never (Red)
}

export interface JiraUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string | null; // ISO Date string or null
  disabled?: boolean;
}

export interface UserWithStatus extends JiraUser {
  status: UserStatus;
  weeksSinceLogin: number;
}