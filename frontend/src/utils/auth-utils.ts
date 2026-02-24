import { User } from "@/providers/AuthProvider";

export const normalizeUser = (data: any): User => {
  if (!data) return {} as User;

  return {
    // Tenta pegar 'name', se não existir, usa string vazia
    name: data.name || "",
    // Lógica para unificar 'role':
    // Se vier 'admin' (do login) OU 'is_admin: true' (do /user), vira 'admin'
    role:
      data.role === "admin" || data.is_admin === true || data.is_admin === 1
        ? "admin"
        : data.role === "manager" || data.type === "manager"
          ? "manager"
        : "user",
    type: data.type,
    is_approved: data.is_approved === true || data.is_approved === 1,
  };
};
