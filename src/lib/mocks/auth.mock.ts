import type { ApiResponse, SessionData, SessionUser } from "@/types/api";

export const defaultMockUser: SessionUser = {
  id: "user-id",
  name: "Jane Doe",
  email: "jane@example.com",
  image: null,
  emailVerified: true,
  createdAt: "2026-03-13T10:00:00.000Z",
  updatedAt: "2026-03-13T10:00:00.000Z",
  role: "TEAM_LEADER",
};

export const sessionMock: ApiResponse<SessionData> = {
  statusCode: 200,
  message: "Session retrieved successfully.",
  data: {
    session: null,
    user: null,
  },
};
