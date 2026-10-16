
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/components/LoginScreen/store/useAuthStore';
import api from '@/providers/Interceptor.API';
import { useAdminId } from '@/utils/getAdminId';

const GET_COMPLAINTS_URL = '/complaint/getComplaintForStudent';
const SUBMIT_COMPLAINT_URL = '/complaint/addComplaint';

export type Complaint = {
  id: number;
  message: string;
  status: string; 
  remarks: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

const unwrap = <T,>(res: any): T => (res?.data?.data ?? res?.data) as T;

export function useMyComplaints() {
  const uid = useAdminId()
  return useQuery({
    queryKey: ['student', 'complaints', uid],
    enabled: !!uid,
    staleTime: 30_000,
    queryFn: async () => unwrap<Complaint[]>(await api.get(GET_COMPLAINTS_URL)),
  });
}

export function useSubmitComplaint() {
  const queryClient = useQueryClient();
  const uid = useAdminId()
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post(SUBMIT_COMPLAINT_URL, { message });
      return unwrap<{ status: string }>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'complaints', uid] });
    },
  });
}