import api from "@/lib/axios";
import { appConfig } from "@/lib/config/app";
import { defaultMockUser, sessionMock } from "@/lib/mocks/auth.mock";
import type {
  ApiResponse,
  SessionData,
  SignInData,
  SignInPayload,
  SignOutData,
  SignUpData,
  SignUpPayload,
  SessionUser,
} from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const mockSessionStorageKey = "devtrack.mock.session";
const mockUserStorageKey = "devtrack.mock.user";

function readMockSession(): SessionData {
  if (typeof window === "undefined") {
    return sessionMock.data;
  }

  const storedSession = window.localStorage.getItem(mockSessionStorageKey);
  const storedUser = window.localStorage.getItem(mockUserStorageKey);

  return {
    session: storedSession ? JSON.parse(storedSession) : null,
    user: storedUser ? (JSON.parse(storedUser) as SessionUser) : null,
  };
}

function writeMockSession(data: SessionData) {
  if (typeof window === "undefined") {
    return;
  }

  if (data.session) {
    window.localStorage.setItem(mockSessionStorageKey, JSON.stringify(data.session));
  } else {
    window.localStorage.removeItem(mockSessionStorageKey);
  }

  if (data.user) {
    window.localStorage.setItem(mockUserStorageKey, JSON.stringify(data.user));
  } else {
    window.localStorage.removeItem(mockUserStorageKey);
  }
}

export async function getSession(): Promise<ApiResponse<SessionData>> {
  if (appConfig.useMockApi) {
    await delay(200);
    return {
      ...sessionMock,
      data: readMockSession(),
    };
  }

  const response = await api.get<ApiResponse<SessionData>>("/auth/session");
  return response.data;
}

export async function signUp(payload: SignUpPayload): Promise<ApiResponse<SignUpData>> {
  if (appConfig.useMockApi) {
    await delay(300);

    const now = new Date().toISOString();
    const user: SessionUser = {
      ...defaultMockUser,
      name: payload.name,
      email: payload.email,
      createdAt: now,
      updatedAt: now,
      emailVerified: false,
    };

    return {
      statusCode: 201,
      message: "Account has been created.",
      data: {
        user,
      },
    };
  }

  const response = await api.post<ApiResponse<SignUpData>>("/auth/sign-up", payload);
  return response.data;
}

export async function signIn(payload: SignInPayload): Promise<ApiResponse<SignInData>> {
  if (appConfig.useMockApi) {
    await delay(300);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const user: SessionUser = {
      ...defaultMockUser,
      email: payload.email,
      updatedAt: now.toISOString(),
    };

    writeMockSession({
      session: {
        expiresAt,
        activeOrganizationId: null,
      },
      user,
    });

    return {
      statusCode: 200,
      message: "Signed in successfully.",
      data: {
        user,
        redirect: false,
        url: null,
      },
    };
  }

  const response = await api.post<ApiResponse<SignInData>>("/auth/sign-in", payload);
  return response.data;
}

export async function signOut(): Promise<ApiResponse<SignOutData>> {
  if (appConfig.useMockApi) {
    await delay(200);
    writeMockSession({
      session: null,
      user: null,
    });

    return {
      statusCode: 200,
      message: "Signed out successfully.",
      data: {
        success: true,
      },
    };
  }

  const response = await api.post<ApiResponse<SignOutData>>("/auth/sign-out");
  return response.data;
}
