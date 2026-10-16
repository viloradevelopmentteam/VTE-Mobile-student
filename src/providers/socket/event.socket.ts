import { router } from "expo-router";
import { logoutAndDisconnect } from "../service/auth/logoutAndDisconnect";
import { queryClient } from "../service/querClient.helper";
import { socketService } from "./socketClient";
import { Surface } from "@/utils/getSurface";
import { meQueryKey } from "../api/me.api";

export const initHandler = async (
  surface: Surface,
  userId: string | null,
  branchId: string | null
) => {
  if (!userId) return undefined;

  const attendanceUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ["attendance", userId],
    });
  };

  const feeUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ["fees", userId],
    });
  };

  const certificateStatusUpdate = () => {
    queryClient.invalidateQueries({
      queryKey: ["certificateStatus", userId],
    });
  };

  const batchUpdatedHandler = (payload: any) => {
    console.log(payload, "SOCKET UPDATE");

    queryClient.invalidateQueries({
      queryKey: ["staffBatches"],
    });

    queryClient.invalidateQueries({
      queryKey: ["staffBatchDetail"],
    });

    queryClient.invalidateQueries({
      queryKey: ["attendanceRoster"],
    });

    queryClient.invalidateQueries({
      queryKey: ["attendanceHistory"],
    });
  };

  const batchStaffUpdatedHandler = (payload: any) => {
    console.log(payload, "SOCKET STAFF REASSIGN");

    queryClient.invalidateQueries({
      queryKey: ["staffBatches"],
    });

    queryClient.invalidateQueries({
      queryKey: ["staffBatchDetail"],
    });
  };

  const ModulePermissionUpdater = async () => {
    console.log("HELOOODLE UPDATE");

    await queryClient.refetchQueries({
      queryKey: meQueryKey
      ,
    });
  };

  const accountDisabledHandler = async () => {
    await logoutAndDisconnect();
    router.replace("/login");
  };


  socketService.setForegroundHandler(async () => {
    console.log(
      "[socket] foreground data refresh",
      surface
    );

    if (surface === "staff") {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["staffBatches"],
        }),

        queryClient.refetchQueries({
          queryKey: ["staffBatchDetail"],
        }),

        queryClient.refetchQueries({
          queryKey: ["attendanceRoster"],
        }),

        queryClient.refetchQueries({
          queryKey: ["attendanceHistory"],
        }),

        queryClient.refetchQueries({
          queryKey: meQueryKey,
        }),
      ]);
    }

    if (surface === "student") {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["attendance", userId],
        }),

        queryClient.refetchQueries({
          queryKey: ["fees", userId],
        }),

        queryClient.refetchQueries({
          queryKey: ["certificateStatus", userId],
        }),
      ]);
    }
  });


  await socketService.joinRoom(`user_${userId}`);

  if (surface === "student") {
    await socketService.joinRoom(`student_${userId}`);

    socketService.on(
      "attendance:updated",
      attendanceUpdated
    );

    socketService.on(
      "fee:updated",
      feeUpdated
    );

    socketService.on(
      "certificateStatus:updated",
      certificateStatusUpdate
    );
  }

  if (surface === "staff" && branchId) {
    await socketService.joinRoom(`batch_${branchId}`);
    await socketService.joinRoom(`admission_${branchId}`);

    socketService.on(
      "batch:updated",
      batchUpdatedHandler
    );

    socketService.on(
      "batch:staff_updated",
      batchStaffUpdatedHandler
    );

    socketService.on(
      "staffPermissions:updated",
      ModulePermissionUpdater
    );
  }

  socketService.on(
    "ACCOUNT_DISABLED",
    accountDisabledHandler
  );

  return () => {
    // Remove events
    socketService.off(
      "attendance:updated",
      attendanceUpdated
    );

    socketService.off(
      "fee:updated",
      feeUpdated
    );

    socketService.off(
      "certificateStatus:updated",
      certificateStatusUpdate
    );

    socketService.off(
      "batch:updated",
      batchUpdatedHandler
    );

    socketService.off(
      "batch:staff_updated",
      batchStaffUpdatedHandler
    );

    socketService.off(
      "staffPermissions:updated",
      ModulePermissionUpdater
    );

    socketService.off(
      "ACCOUNT_DISABLED",
      accountDisabledHandler
    );

    // Remove rooms
    socketService.leaveRoom(`user_${userId}`);

    if (surface === "student") {
      socketService.leaveRoom(`student_${userId}`);
    }

    if (surface === "staff" && branchId) {
      socketService.leaveRoom(`batch_${branchId}`);
      socketService.leaveRoom(`admission_${branchId}`);
    }

    // IMPORTANT
    socketService.setForegroundHandler(undefined);
  };
};
