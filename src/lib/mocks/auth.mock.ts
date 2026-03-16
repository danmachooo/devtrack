import type { ApiResponse, SessionData } from "@/types/api";

export const sessionMock: ApiResponse<SessionData> = {
  statusCode: 200,
  message: "Session retrieved successfully.",
  data: {
    session: {
      expiresAt: "2026-03-20T10:00:00.000Z",
      activeOrganizationId: "org-id",
    },
    user: {
      id: "user-id",
      name: "Jane Doe",
      email: "jane@example.com",
      image: null,
      emailVerified: true,
      createdAt: "2026-03-13T10:00:00.000Z",
      updatedAt: "2026-03-13T10:00:00.000Z",
      role: "TEAM_LEADER",
    },
  },
};
