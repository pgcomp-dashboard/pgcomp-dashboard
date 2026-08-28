import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import useAuth from '@/hooks/auth';
import { parseApiError } from '@/services/http-client';
import { adminService } from '@/services/modules/admin.service';
import { authService } from '@/services/modules/auth.service';
import { userService } from '@/services/modules/user.service';
import { RequestBodyType } from '@/types/common';
import { User } from '@/types/user';
import {
  updatePasswordFormSchema,
  UpdatePasswordFormValues,
  userConfigFormSchema,
  UserConfigFormValues,
} from '../types';

export function useUserConfig() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [ userInfo, setUserInfo ] = useState<User | undefined>(undefined);

  useEffect(() => {
    async function fetchPersonalInfo() {
      try {
        const info = await userService.getUser();
        setUserInfo(info);
      } catch (err) {
        console.error('Erro ao carregar Informações do Usuário:', err);
      }
    }
    fetchPersonalInfo();
  }, []);

  const generalForm = useForm<UserConfigFormValues>({
    resolver: zodResolver(userConfigFormSchema),
    defaultValues: {
      name: '',
      email: '',
      registration: '',
      siape: 0,
      lattes_url: '',
      pq: false,
      orcid: '',
    },
    values: userInfo
      ? {
        name: userInfo.name,
        email: userInfo.email ?? '',
        registration: userInfo.type === 'student' ? String(userInfo.registration) : '',
        siape: userInfo.type === 'professor' ? (userInfo as any).siape : 0,
        lattes_url: userInfo.type !== 'manager' ? (userInfo.lattes_url ?? '') : '',
        pq: userInfo.type === 'professor' ? (userInfo as any).pq : false,
        orcid: userInfo.type === 'professor' ? (userInfo as any).orcid ?? '' : '',
      } as any
      : undefined,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const passwordForm = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onGeneralSubmit = async (values: UserConfigFormValues) => {
    try {
      await userService.updateUser(values);
      toast.success('Informações atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      toast.error('Erro ao atualizar usuário.');
    }
  };

  const onPasswordSubmit = async (values: UpdatePasswordFormValues) => {
    const payload: RequestBodyType = {
      password: values.password,
      password_confirmation: values.confirmPassword,
    };
    try {
      await authService.updateUserPassword(payload);
      toast.success('Senha atualizada com sucesso!');
      passwordForm.reset();
    } catch (err) {
      console.error('Erro ao mudar senha:', err);
      toast.error('Erro ao mudar senha.');
    }
  };

  // Admin Request logic
  const adminStatusQueryKey = [ 'admin-status' ];

  const {
    data: adminStatus,
    isLoading: isLoadingAdminStatus,
    error: errorAdminStatus,
  } = useQuery({
    queryKey: adminStatusQueryKey,
    queryFn: async () => {
      const response = await adminService.getAdminStatus();
      return response.data as 'pending' | 'approved' | 'rejected' | null;
    },
    enabled: !auth?.isAdmin,
  });

  const requestAdminMutation = useMutation({
    mutationFn: () => adminService.requestAdmin(),
    onSuccess: () => {
      queryClient.setQueryData(adminStatusQueryKey, 'pending');
      toast.success(
        'Solicitação enviada com sucesso! Aguarde, um administrador irá analisar o pedido.',
      );
    },
    onError: (err: Error) => {
      console.error('Erro ao solicitar admin:', err);
      toast.error(parseApiError(err) || 'Erro ao solicitar admin.');
    },
  });

  return {
    auth,
    userInfo,
    generalForm,
    passwordForm,
    onGeneralSubmit,
    onPasswordSubmit,
    adminState: {
      status: adminStatus,
      isLoading: isLoadingAdminStatus,
      error: errorAdminStatus,
      requestAdmin: () => requestAdminMutation.mutate(),
      isRequesting: requestAdminMutation.isPending,
    },
  };
}
