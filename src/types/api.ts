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

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
};

export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";

export type OrganizationInvitation = {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  inviterId: string;
  expiresAt: string;
  createdAt: string;
  organizationName?: string;
};

export type CreateOrganizationPayload = {
  name: string;
  slug: string;
  logo?: string;
};

export type InviteMemberPayload = {
  email: string;
  role: UserRole;
  resend: boolean;
};

export type UpdateOrganizationMemberPayload = {
  role: UserRole;
};

export type InvitationsData = {
  invitations: OrganizationInvitation[];
  total: number;
};

export type MembersData = {
  members: OrganizationMember[];
  total: number;
};
