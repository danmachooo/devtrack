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

export type DevtrackStatus =
  | "TODO"
  | "IN_DEV"
  | "QA"
  | "APPROVED"
  | "RELEASED"
  | "BLOCKED";

export type FeatureProgressStatus =
  | "NO_WORK_LOGGED"
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type ClientAccess = {
  id: string;
  projectId: string;
  lastViewedAt: string | null;
  createdAt: string;
};

export type ProjectFeature = {
  id: string;
  name: string;
  order: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectFeatureSummary = ProjectFeature & {
  _count: {
    tickets: number;
  };
};

export type TicketFeatureReference = {
  id: string;
  name: string;
  order: number;
};

export type Ticket = {
  id: string;
  projectId: string;
  featureId: string | null;
  notionPageId: string;
  title: string;
  notionStatus: string;
  devtrackStatus: DevtrackStatus;
  assigneeName: string | null;
  isMissingFromSource: boolean;
  missingFromSourceAt: string | null;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
  feature: TicketFeatureReference | null;
};

export type TicketSortBy =
  | "syncedAt"
  | "createdAt"
  | "updatedAt"
  | "title"
  | "devtrackStatus";

export type SortOrder = "asc" | "desc";

export type GetProjectTicketsQuery = {
  featureId?: string;
  status?: DevtrackStatus;
  unassigned?: boolean;
  showMissing?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  assignee?: string;
  sortBy?: TicketSortBy;
  sortOrder?: SortOrder;
};

export type UpdateTicketFeaturePayload = {
  featureId: string | null;
};

export type BulkUpdateTicketFeaturePayload = {
  ticketIds: string[];
  featureId: string | null;
};

export type PaginatedResultMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type TicketListData = {
  items: Ticket[];
  pagination: PaginatedResultMeta;
  search: string | null;
  assignee: string | null;
  sort: {
    by: TicketSortBy;
    order: SortOrder;
  };
};

export type BulkUpdateTicketFeatureData = {
  totalUpdated: number;
  projectId: string;
  featureId: string | null;
  tickets: Ticket[];
};

export type FeatureProgressSummary = {
  featureId: string;
  featureName: string;
  order: number;
  progress: number;
  status: FeatureProgressStatus;
  totalTickets: number;
  completedTickets: number;
};

export type ProjectProgressFeatureSummary = {
  featureId: string;
  name: string;
  order: number;
  progress: number;
  status: FeatureProgressStatus;
  totalTickets: number;
  completedTickets: number;
};

export type ProjectProgressSummary = {
  overallProgress: number;
  assignedNonMissingTickets: number;
  completedAssignedNonMissingTickets: number;
  unassignedTickets: number;
  missingTickets: number;
  featuresWithProgress: number;
  totalFeatures: number;
  featureSummaries?: ProjectProgressFeatureSummary[];
};

export type SyncLogStatus = "SUCCESS" | "FAILED" | "RATE_LIMITED";

export type SyncLog = {
  id: string;
  status: SyncLogStatus;
  ticketsAdded: number;
  ticketsUpdated: number;
  errorMessage: string | null;
  createdAt: string;
};

export type ProjectClientAccessData = {
  projectId: string;
  clientAccessLink: string;
  lastViewedAt: string | null;
};

export type ClientDashboardActivity = {
  status: SyncLogStatus;
  message: string;
  ticketsAdded: number;
  ticketsUpdated: number;
  happenedAt: string;
};

export type ClientDashboardFeature = {
  name: string;
  progress: number;
  status: FeatureProgressStatus;
  totalTickets: number;
  completedTickets: number;
};

export type ClientDashboardData = {
  projectName: string;
  overallProgress: number;
  lastSyncedAt: string | null;
  features: ClientDashboardFeature[];
  recentActivity: ClientDashboardActivity[];
};

export type Project = {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  notionDatabaseId: string | null;
  statusMapping: Record<string, DevtrackStatus> | null;
  syncInterval: number | null;
  lastSyncedAt: string | null;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  clientAccess: ClientAccess;
  features: ProjectFeature[];
  _count: {
    tickets: number;
  };
  progressSummary?: ProjectProgressSummary;
};

export type CreateProjectPayload = {
  name: string;
  clientName: string;
  clientEmail: string;
};

export type UpdateProjectPayload = {
  name?: string;
  clientName?: string;
  clientEmail?: string;
  syncInterval?: number;
};

export type NotionDataSource = {
  id: string;
  name: string;
};

export type NotionConnectionDetails = {
  projectId: string;
  notionDatabaseId: string;
  databaseTitle: string;
  databaseUrl: string;
  dataSources: NotionDataSource[];
};

export type NotionConnectionPayload = {
  notionToken: string;
  databaseId: string;
};

export type SaveStatusMappingPayload = {
  statusMapping: Record<string, DevtrackStatus>;
};

export type SyncProjectData = {
  projectId: string;
  alreadyQueued: boolean;
  jobId: string;
};

export type CreateFeaturePayload = {
  name: string;
  order?: number;
};

export type UpdateFeaturePayload = {
  name?: string;
  order?: number;
};
