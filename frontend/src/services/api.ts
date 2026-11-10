import type {
  SchoolClass,
  CreateClassPayload,
  CreateClassResponse,
  CreateHoldResponse,
  HoldResponse,
  ConfirmHoldResponse,
  StudentHold,
  ApiErrorResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    studentId?: string;
  } = {}
): Promise<T> {
  const { method = 'GET', body, studentId } = options;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (studentId) {
    headers['X-Student-Id'] = studentId;
  }

  const url = `${BASE_URL.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Unable to connect to backend server. Please verify the API is running at ' + BASE_URL);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;
    const errorMessage = errorData?.error || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, errorMessage);
  }

  return data as T;
}

export const api = {
  // Classes
  getClasses: () => request<SchoolClass[]>('/classes'),

  getClassById: (classId: string) => request<SchoolClass>(`/classes/${classId}`),

  createClass: (payload: CreateClassPayload) =>
    request<CreateClassResponse>('/classes', {
      method: 'POST',
      body: payload,
    }),

  // Holds
  createHold: (classId: string, studentId: string) =>
    request<CreateHoldResponse>(`/classes/${classId}/holds`, {
      method: 'POST',
      studentId,
    }),

  getHold: (holdId: string) => request<HoldResponse>(`/holds/${holdId}`),

  confirmHold: (holdId: string, studentId: string) =>
    request<ConfirmHoldResponse>(`/holds/${holdId}/confirm`, {
      method: 'POST',
      studentId,
    }),

  cancelHold: (holdId: string, studentId: string) =>
    request<void>(`/holds/${holdId}`, {
      method: 'DELETE',
      studentId,
    }),

  // My Applications
  getMyHolds: (studentId: string) =>
    request<StudentHold[]>('/me/holds', {
      studentId,
    }),
};
