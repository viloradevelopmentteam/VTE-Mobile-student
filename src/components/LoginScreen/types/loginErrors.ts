export type LoginBlockCode =
  | 'RATE_LIMIT'
  | 'YOUR_ACCOUNT_IS_LOCKED'
  | 'DEVICE_REJECTED'
  | 'UNAUTHORIZED_DEVICE'
  | 'CONTACT_ADMINISTRATION'
  | 'UNKNOWN_BLOCK';

export class LoginBlockedError extends Error {
  readonly code: LoginBlockCode;
  readonly retryAfter?: number;
  constructor(code: LoginBlockCode, message: string, retryAfter?: number) {
    super(message);
    this.name = 'LoginBlockedError';
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

/** Credentials are valid, but the account belongs to the other app. */
export class WrongAppError extends Error {
  readonly appSurface: 'staff' | 'student';
  constructor(appSurface: 'staff' | 'student') {
    super(
      appSurface === 'staff'
        ? 'This is a student account. Please sign in with the VILORA Student app.'
        : 'This is a staff account. Please sign in with the VILORA Staff app.',
    );
    this.name = 'WrongAppError';
    this.appSurface = appSurface;
  }
}

export class LoginFieldError extends Error {
  readonly field: 'userName' | 'password';
  readonly remainingAttempts?: number;
  constructor(field: 'userName' | 'password', message: string, remainingAttempts?: number) {
    super(message);
    this.name = 'LoginFieldError';
    this.field = field;
    this.remainingAttempts = remainingAttempts;
  }
}

const BLOCK_CODES: LoginBlockCode[] = [
  'RATE_LIMIT',
  'YOUR_ACCOUNT_IS_LOCKED',
  'DEVICE_REJECTED',
  'UNAUTHORIZED_DEVICE',
  'CONTACT_ADMINISTRATION',
];

/** Turns an axios error from the login/me calls into a typed error the UI can branch on. */
export function parseLoginError(err: any): Error {
  const status = err?.response?.status;
  const res = err?.response?.data || {};
  const rawMessage: string = (res?.message || '').toUpperCase();
  const remainingAttempts = res?.error?.remainingAttempts;
  const retryAfter = res?.retryAfter;

  if (status === 429) {
    return new LoginBlockedError('RATE_LIMIT', 'Too many attempts', retryAfter || 60);
  }

  const code = rawMessage.split(':').pop() || rawMessage;

  if (code.includes('YOUR_ACCOUNT_IS_LOCKED')) {
    return new LoginBlockedError('YOUR_ACCOUNT_IS_LOCKED', 'Account locked');
  }
  if (code === 'DEVICE_REJECTED') {
    return new LoginBlockedError('DEVICE_REJECTED', 'Device blocked');
  }
  if (code === 'UNAUTHORIZED_DEVICE') {
    return new LoginBlockedError('UNAUTHORIZED_DEVICE', 'Device not registered');
  }
  if (code === 'CONTACT_ADMINISTRATION' || status === 404 && code === 'INACTIVE') {
    return new LoginBlockedError('CONTACT_ADMINISTRATION', 'Account inactive');
  }
  if (code === 'INVALID_PASSWORD') {
    return new LoginFieldError(
      'password',
      remainingAttempts !== undefined
        ? `Invalid password. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
        : 'Invalid password.',
      remainingAttempts
    );
  }
  if (code === 'USER_NOT_FOUND') {
    return new LoginFieldError('userName', 'User not found');
  }

  return new LoginFieldError('password', 'Login failed. Please check your credentials.');
}