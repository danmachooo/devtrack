export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type UserRole =
  | "TEAM_LEADER"
  | "BUSINESS_ANALYST"
  | "QUALITY_ASSURANCE"
  | "DEVELOPER";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
};

export type SessionData = {
  session: {
    expiresAt: string;
    activeOrganizationId: string;
  } | null;
  user: SessionUser | null;
};
