export type UserBase = {
  id: number;
  name: string;
  is_approved: boolean;
};

export type Professor = UserBase & {
  type: "professor";
  siape: number;
  email: string;
  lattes_url: string;
  lattes_id: string;
  category: string | null;
  is_admin: boolean;
  pq: boolean;
  is_senior: boolean;
  orcid: string | null;
  admin_status: "pending" | "approved" | "rejected" | null;
  lattes_xml_path?: string;
  lattes_xml_uploaded_at?: string;
};

export type Student = UserBase & {
  type: "student";
  email?: string;
  registration: number;
  area_id: number;
  course_id: number;
  lattes_url?: string;
  defended_at?: string;
  is_protected: boolean;
};

export type Manager = UserBase & {
  type: "manager";
  email: string;
  is_admin: true;
};

export interface Advisor {
  id: number;
  name: string;
  advisedes_count: number;
}

export interface AdvisorStudent {
  id: number;
  name: string;
  registration: number;
  course: string | null;
  status: 'Ativo' | 'Concluído';
}

export type User = Professor | Student | Manager;

export type AdminUser = UserBase & {
  type: "student" | "professor" | "manager";
  name: string;
  email: string | null;
  category: string | null;
  is_admin: boolean;
  is_approved: boolean;
  registration: number | null;
  siape: number | null;
  course_id: number | null;
  area_id: number | null;
  lattes_url: string | null;
  orcid: string | null;
  pq: boolean;
  is_senior: boolean;
  defended_at: string | null;
  admin_status: "pending" | "approved" | "rejected" | null;
  registration_requested_at: string | null;
};

export type AdminUserUpdate = Partial<
  Omit<AdminUser, "id" | "category" | "is_approved">
> & { password?: string };

export type AdminRequest = {
  id: number;
  name: string;
  email: string;
  admin_status: "pending" | "approved" | "rejected" | null;
};

export type ApprovalRequest = {
  id: number;
  name: string;
  email: string;
  registration?: number | string | null;
  advisor?: string | null;
  type: "professor" | "student" | "manager";
  request_type: "registration" | "admin";
  created_at?: string;
};
