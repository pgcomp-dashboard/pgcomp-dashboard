export type UserBase = {
  id: number;
  name: string;
  is_approved: boolean;
};

export type Professor = UserBase & {
  type: 'professor';
  siape: number;
  email: string;
  lattes_url: string;
  lattes_id: string;
  category: string | null;
  is_admin: boolean;
  pq: boolean;
  admin_status: 'pending' | 'approved' | 'rejected' | null;
}

export type Student = UserBase & {
  type: 'student';
  email?: string;
  registration: number;
  area_id: number;
  course_id: number;
  lattes_url?: string;
  defended_at?: string;
  is_protected: boolean;
}

export type Manager = UserBase & {
  type: 'manager';
  email: string;
  is_admin: true;
};

export interface Advisor {
  id: number;
  name: string;
  advisedes_count: number;
}

export type User = Professor | Student | Manager;

export type AdminRequest = {
  id: number;
  name: string;
  email: string;
  admin_status: 'pending' | 'approved' | 'rejected' | null;
};

export type ApprovalRequest = {
  id: number;
  name: string;
  email: string;
  type: 'professor' | 'student' | 'manager';
  request_type: 'registration' | 'admin';
  created_at?: string;
};
