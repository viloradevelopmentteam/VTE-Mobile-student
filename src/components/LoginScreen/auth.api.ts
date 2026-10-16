import { MeResponse } from "@/providers/api/me.api";

import { getDeviceContext } from "./security/deviceInfo";

import { clearTokens, setTokens } from "@/providers/service/auth/tokenStore";
import api from "@/providers/Interceptor.API";
import { logoutAndDisconnect } from "@/providers/service/auth/logoutAndDisconnect";
import { LoginBlockedError, WrongAppError, parseLoginError } from "./types/loginErrors";
import { APP_SURFACE } from "@/constants/appConfig";
import { getSurface } from "@/utils/getSurface";
import { useLoginBlockStore } from "./store/loginBlockStore";
import axios from "axios";


export type LoginPayload = { userName?: string; password?: string ,isStaff:boolean,phoneNumber?:string|number,turnstileToken:String|null};


export type LoginUser = {
  branchId: string;
  branchName: string;
  deviceFingerprint: string;
  email: string;
  firstName: string;
  isLocked: number;
  lastName: string;
  role: string;
  roleId: number;
  roleLevel: string;
  isStaff:boolean
  userId: string;
  userName: string;
};
export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    __as_secure: string;
    __rs_secure: string;
  };
};

export async function loginRequest(
  payload: LoginPayload
): Promise<{ tokens: LoginResponse; me: MeResponse }> {
  const deviceContext = await getDeviceContext();

  try {
    const response = await api.post<LoginResponse>('user/login', {
      ...payload,
      ...deviceContext,
      'cf-turnstile-response': payload.turnstileToken,
    });
    const loginResponse = response.data;
    if (!loginResponse.success) {
      throw new Error(loginResponse.message || 'Login failed');
    }

    await setTokens(loginResponse.data.__as_secure, loginResponse.data.__rs_secure);

    const meRes = await api.get<{ data: MeResponse }>('user/me');
    const me = meRes.data.data;

    const accountSurface =
      me.userType === 'STUDENT' ? 'student' : getSurface(me.roleName);

    if (accountSurface !== APP_SURFACE) {
      await clearTokens();
      throw new WrongAppError(APP_SURFACE);
    }

    return { tokens: loginResponse, me };
  }

 catch (error) {
    console.log('CATCH REACHED', error);

    if (axios.isAxiosError(error)) {
      console.log('AXIOS ERROR', error);
console.log('[STATUS]', error.response?.status);
  console.log('[DATA]', JSON.stringify(error.response?.data, null, 2));
  console.log('[URL]', error.config?.url);
  console.log('[METHOD]', error.config?.method);
      const parsedError = parseLoginError(error);

      console.log('PARSED LOGIN ERROR:', {
        name: parsedError.name,
        message: parsedError.message,
        code:
          parsedError instanceof LoginBlockedError
            ? parsedError.code
            : undefined,
        retryAfter:
          parsedError instanceof LoginBlockedError
            ? parsedError.retryAfter
            : undefined,
      });

      if (parsedError instanceof LoginBlockedError) {
        useLoginBlockStore.getState().setBlock(
          parsedError.code,
          parsedError.retryAfter,
        );
      }

      throw parsedError;
    }

    throw error;
  }
}


export async function logoutRequest(): Promise<void> {
  try {
    await api.post('user/logout');
  } catch (error) {
    console.log('Logout API error:', error);
  } finally {
    await logoutAndDisconnect(); // clears tokens, all stores, disconnects socket, redirects
  }
}
