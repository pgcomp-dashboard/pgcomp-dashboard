import { AuthContext } from '@/providers/AuthProvider';
import { useContext } from 'react';

export default function useAuth() {
  const authContext = useContext(AuthContext);
  return authContext;
}
