// socketClient/socketService.ts

import { AppState, AppStateStatus } from "react-native";
import { io, Socket } from "socket.io-client";

import { SOCKET_URL } from "@/constants/ENV";
import { loadTokens } from "../service/auth/tokenStore";
console.log('[API URL]', process.env.EXPO_PUBLIC_API_URL)
type SocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "ready";

type JoinResolver = {
  resolve: () => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

class SocketService {
  private socket: Socket;
private foregroundHandler?: () => Promise<void>;

  /**
   * Rooms that the application wants to be subscribed to.
   *
   * These MUST survive temporary disconnects.
   */
  private desiredRooms = new Set<string>();

  /**
   * Rooms that the CURRENT socket connection has successfully joined.
   *
   * These are cleared when the socket disconnects because
   * Socket.IO rooms belong to a specific connection.
   */
  private activeRooms = new Set<string>();

  /**
   * Waiting join requests.
   */
  private pendingJoins = new Map<string, JoinResolver>();

  /**
   * Connection promise.
   *
   * Prevents multiple parts of the application from calling
   * socket.connect() simultaneously.
   */
  private connectPromise: Promise<void> | null = null;

  /**
   * Prevents multiple reconnect/room synchronization operations
   * from happening simultaneously.
   */
  private syncPromise: Promise<void> | null = null;

  private appState: AppStateStatus = AppState.currentState;

  private status: SocketStatus = "disconnected";

  private foregroundSubscription?: {
    remove: () => void;
  };

  constructor() {
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],

      autoConnect: false,

      reconnection: false,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,

      auth: async (cb) => {
         try {
    const token = await loadTokens();

    cb({
      token: token ?? undefined,
    });
  } catch (error) {
    console.log("[socket] failed to load token:", error);

    cb({
      token: undefined,
    });
  }
      },
    });

    this.registerSocketListeners();

    this.foregroundSubscription =
      AppState.addEventListener(
        "change",
        this.handleAppStateChange
      );
  }

  private registerSocketListeners() {
    this.socket.on("connect", this.handleConnect);

    this.socket.on(
      "disconnect",
      this.handleDisconnect
    );

    this.socket.on(
      "connect_error",
      this.handleConnectError
    );

    this.socket.on(
      "roomJoined",
      this.handleRoomJoined
    );
  }

  private handleConnect = async () => {
    console.log(
      "[socket] connected:",
      this.socket.id
    );

    this.status = "connected";


    try {
      await this.syncRooms();

      this.status = "ready";

      console.log(
        "[socket] READY",
        {
          socketId: this.socket.id,
          rooms: [...this.activeRooms],
        }
      );
    } catch (error) {
      console.log(
        "[socket] room synchronization failed:",
        error
      );

      /**
       * The socket itself is connected, but the desired
       * subscriptions are not fully ready.
       */
      this.status = "connected";
    }
  };

  private handleDisconnect = (
    reason: Socket.DisconnectReason
  ) => {
    console.log(
      "[socket] disconnected:",
      reason
    );

    this.status = "disconnected";

    /**
     * These rooms belonged to the old connection.
     *
     * DO NOT clear desiredRooms here.
     */
    this.activeRooms.clear();

    /**
     * Pending room joins belong to the old connection.
     * Reject them rather than leaving promises hanging forever.
     */
    for (const [
      room,
      pending,
    ] of this.pendingJoins) {
      clearTimeout(pending.timer);

      pending.reject(
        new Error(
          `Socket disconnected while joining room: ${room}`
        )
      );
    }

    this.pendingJoins.clear();

    /**
     * connectPromise must be reset.
     */
    this.connectPromise = null;

    /**
     * Do not clear desiredRooms.
     *
     * Socket.IO will reconnect automatically.
     */
  };

  private handleConnectError = (
    error: Error
  ) => {
    console.log(
      "[socket] connect_error:",
      error.message
    );

    this.status = "disconnected";

    this.connectPromise = null;
  };

  private handleRoomJoined = (
    data: { roomId: string }
  ) => {
    if (!data?.roomId) {
      return;
    }

    const room = data.roomId;

    console.log(
      "[socket] room joined:",
      room
    );

    this.activeRooms.add(room);

    const pending =
      this.pendingJoins.get(room);

    if (!pending) {
      return;
    }

    clearTimeout(pending.timer);

    this.pendingJoins.delete(room);

    pending.resolve();
  };

  // ============================================================
  // APP STATE
  // ============================================================

private handleAppStateChange = async (
  nextState: AppStateStatus
) => {
  const previousState = this.appState;

  const wasBackground =
    previousState === "background" ||
    previousState === "inactive";

  const isNowActive = nextState === "active";

  this.appState = nextState;

  if (!wasBackground || !isNowActive) {
    return;
  }

  console.log("[socket] app returned to foreground", {
    connected: this.socket.connected,
    socketId: this.socket.id,
    status: this.status,
    desiredRooms: [...this.desiredRooms],
    activeRooms: [...this.activeRooms],
  });

  try {
    // 1. Reconnect if socket was lost.
    if (!this.socket.connected) {
      await this.connect();
    }

    // 2. Make sure rooms are restored.
    await this.syncRooms();

    // 3. Refresh authoritative application data.
    if (this.foregroundHandler) {
      await this.foregroundHandler();
    }
  } catch (error) {
    console.log(
      "[socket] foreground recovery failed:",
      error
    );
  }
};



  // ============================================================
  // CONNECTION
  // ============================================================

  public connect(): Promise<void> {
  if (this.socket.connected) {
    return Promise.resolve();
  }

  if (this.connectPromise) {
    return this.connectPromise;
  }

  this.status = "connecting";

  this.connectPromise = new Promise<void>((resolve, reject) => {
    const handleConnect = () => {
      cleanup();

      this.status = "connected";

      resolve();
    };

    const handleError = (error: Error) => {
      cleanup();

      this.status = "disconnected";

      reject(error);
    };

    const cleanup = () => {
      this.socket.off("connect", handleConnect);
      this.socket.off("connect_error", handleError);
    };

    this.socket.once("connect", handleConnect);
    this.socket.once("connect_error", handleError);

    try {
      this.socket.connect();
    } catch (error) {
      cleanup();

      this.status = "disconnected";

      reject(
        error instanceof Error
          ? error
          : new Error(String(error))
      );
    }
  });

  this.connectPromise = this.connectPromise.finally(() => {
    this.connectPromise = null;
  });

  return this.connectPromise;
}


  // ============================================================
  // ROOM SYNCHRONIZATION
  // ============================================================

  private async syncRooms(): Promise<void> {
    if (!this.socket.connected) {
      return;
    }

    /**
     * Prevent two syncRooms() calls from running at once.
     */
    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = (async () => {
      const rooms = [...this.desiredRooms];

      if (!rooms.length) {
        return;
      }

      console.log(
        "[socket] synchronizing rooms:",
        rooms
      );

      /**
       * Join rooms one by one.
       *
       * This makes debugging easier and prevents a large burst
       * of room operations during reconnect.
       */
      for (const room of rooms) {
        if (!this.socket.connected) {
          throw new Error(
            "Socket disconnected during room synchronization"
          );
        }

        if (this.activeRooms.has(room)) {
          continue;
        }

        await this.joinRoomInternal(
          room
        );
      }

      console.log(
        "[socket] room synchronization complete:",
        [...this.activeRooms]
      );
    })();

    try {
      await this.syncPromise;
    } finally {
      this.syncPromise = null;
    }
  }

  private joinRoomInternal(
    room: string,
    timeoutMs = 8000
  ): Promise<void> {
    /**
     * Already joined on this connection.
     */
    if (this.activeRooms.has(room)) {
      return Promise.resolve();
    }

    /**
     * If another operation is already waiting for this room,
     * reuse it.
     */
    const existing =
      this.pendingJoins.get(room);

    if (existing) {
      return new Promise<void>(
        (resolve, reject) => {
          const originalResolve =
            existing.resolve;

          const originalReject =
            existing.reject;

          existing.resolve = () => {
            originalResolve();
            resolve();
          };

          existing.reject = (
            error
          ) => {
            originalReject(error);
            reject(error);
          };
        }
      );
    }

    return new Promise<void>(
      (resolve, reject) => {
        const timer = setTimeout(() => {
          this.pendingJoins.delete(room);

          reject(
            new Error(
              `joinRoom timed out for ${room}`
            )
          );
        }, timeoutMs);

        this.pendingJoins.set(room, {
          resolve,
          reject,
          timer,
        });

        console.log(
          "[socket] requesting room:",
          room
        );

        this.socket.emit(
          "joinRoom",
          {
            roomId: room,
          }
        );
      }
    );
  }

  // ============================================================
  // PUBLIC ROOM API
  // ============================================================

  public async joinRoom(
    room: string,
    timeoutMs = 8000
  ): Promise<void> {
    if (!room) {
      throw new Error(
        "Room ID is required"
      );
    }

    /**
     * Remember this room permanently until the application
     * explicitly leaves it.
     *
     * This is the most important difference from your
     * previous implementation.
     */
    this.desiredRooms.add(room);

    /**
     * Make sure socket is connected.
     */
    await this.connect();

    /**
     * If this room already exists on the current connection,
     * nothing else is required.
     */
    if (this.activeRooms.has(room)) {
      return;
    }

    /**
     * If another sync operation is currently joining it,
     * wait for synchronization.
     */
    if (this.syncPromise) {
      try {
        await this.syncPromise;
      } catch {
        // We still check the room below.
      }

      if (this.activeRooms.has(room)) {
        return;
      }
    }

    await this.joinRoomInternal(
      room,
      timeoutMs
    );
  }

  public leaveRoom(room: string) {
    if (!room) {
      return;
    }

    /**
     * Remove it from desired subscriptions.
     *
     * Therefore it will NOT be rejoined after reconnect.
     */
    this.desiredRooms.delete(room);

    /**
     * Remove local active state.
     */
    this.activeRooms.delete(room);

    /**
     * Reject pending join if any.
     */
    const pending =
      this.pendingJoins.get(room);

    if (pending) {
      clearTimeout(pending.timer);

      pending.reject(
        new Error(
          `Room ${room} was cancelled`
        )
      );

      this.pendingJoins.delete(room);
    }

    /**
     * Tell server to leave the room.
     */
    if (this.socket.connected) {
      this.socket.emit(
        "leaveRoom",
        {
          roomId: room,
        }
      );
    }
  }

  // ============================================================
  // LOGOUT / FULL DISCONNECT
  // ============================================================

  public disconnect() {
    console.log(
      "[socket] intentional disconnect"
    );

    /**
     * This method is for LOGOUT / ACCOUNT CHANGE.
     *
     * Do NOT call this for ordinary network/background handling.
     */
    this.desiredRooms.clear();
    this.activeRooms.clear();

    for (const [
      room,
      pending,
    ] of this.pendingJoins) {
      clearTimeout(pending.timer);

      pending.reject(
        new Error(
          `Socket manually disconnected while joining ${room}`
        )
      );
    }

    this.pendingJoins.clear();

    this.connectPromise = null;

    if (this.socket.connected) {
      this.socket.disconnect();
    }

    this.status = "disconnected";
  }

  // ============================================================
  // EVENTS
  // ============================================================

  public on(
    event: string,
    callback: (...args: any[]) => void
  ) {
    this.socket.on(
      event,
      callback
    );
  }

  public off(
    event: string,
    callback?: (...args: any[]) => void
  ) {
    if (callback) {
      this.socket.off(
        event,
        callback
      );
    } else {
      this.socket.removeAllListeners(
        event
      );
    }
  }

  public emit(
    event: string,
    data?: any
  ) {
    if (!this.socket.connected) {
      console.log(
        `[socket] emit skipped - socket disconnected: ${event}`
      );

      return;
    }

    this.socket.emit(
      event,
      data
    );
  }

  // ============================================================
  // STATE
  // ============================================================

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public isReady(): boolean {
    return (
      this.status === "ready"
    );
  }

  public getStatus(): SocketStatus {
    return this.status;
  }

  public getDesiredRooms(): string[] {
    return [
      ...this.desiredRooms,
    ];
  }

  public getActiveRooms(): string[] {
    return [
      ...this.activeRooms,
    ];
  }
public setForegroundHandler(
  handler?: () => Promise<void>
) {
  this.foregroundHandler = handler;
}


  public destroy() {
    this.disconnect();

    this.socket.removeAllListeners();

    this.foregroundSubscription?.remove();

    this.foregroundSubscription =
      undefined;
  }
}

export const socketService =
  new SocketService();