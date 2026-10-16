
import { useQuery } from '@tanstack/react-query';
import api from '../Interceptor.API';
import { StaffAuth, StudentAuth } from '@/components/LoginScreen/types/login.types';

export type AvailableRole = {
  roleId: number;
  name: string;
  isPrimary: boolean;
};

export type MeResponse = StaffAuth | StudentAuth;


export const meQueryKey = ['me'];

const fetchMe = async (): Promise<MeResponse> => {
  const { data } = await api.get<{ data: MeResponse }>('user/me');
  return data.data;
};


export const useMeQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: fetchMe,
    enabled,
      refetchOnMount: "always",
  });
};