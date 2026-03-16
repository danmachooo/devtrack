import api from "@/lib/axios";
import { appConfig } from "@/lib/config/app";
import { sessionMock } from "@/lib/mocks/auth.mock";
import type { ApiResponse, SessionData } from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getSession(): Promise<ApiResponse<SessionData>> {
  if (appConfig.useMockApi) {
    await delay(200);
    return sessionMock;
  }

  const response = await api.get<ApiResponse<SessionData>>("/auth/session");
  return response.data;
}
