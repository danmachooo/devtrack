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
    activeOrganizationId: string | null;
  } | null;
  user: SessionUser | null;
};

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};

export type SignUpData = {
  user: SessionUser;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignInData = {
  user: SessionUser;
  redirect: boolean;
  url: string | null;
};

export type SignOutData = {
  success: boolean;
};
