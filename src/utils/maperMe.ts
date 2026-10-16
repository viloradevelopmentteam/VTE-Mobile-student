import { StaffAuth, StudentAuth } from "@/components/LoginScreen/types/login.types";
import { MeResponse } from "@/providers/api/me.api";


export function mapMeToAuthUser(
  me: MeResponse
): StaffAuth | StudentAuth {
  if (me.userType === 'STAFF') {
    return {
      ...me,
      userType: 'STAFF',
      userName: me.userName ?? null,
      phoneNumber: me.phoneNumber ?? null,
    };
  }

  return {
    ...me,
    userType: 'STUDENT',
    userName: me.userName ?? null,
    phoneNumber: me.phoneNumber ?? null,
  };
}
