import api from "@/lib/axios";
import { appConfig } from "@/lib/config/app";
import type {
  ApiResponse,
  CreateOrganizationPayload,
  InvitationsData,
  InviteMemberPayload,
  MembersData,
  Organization,
  OrganizationInvitation,
  OrganizationMember,
  SessionData,
  SessionUser,
  UpdateOrganizationMemberPayload,
} from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockSessionStorageKey = "devtrack.mock.session";
const mockUserStorageKey = "devtrack.mock.user";
const mockOrganizationStorageKey = "devtrack.mock.organization.store";

type MockOrganizationStore = {
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  }>;
  invitations: OrganizationInvitation[];
  members: OrganizationMember[];
};

type ActiveMockSession = {
  session: NonNullable<SessionData["session"]>;
  user: SessionUser;
};

function getEmptyStore(): MockOrganizationStore {
  return {
    organizations: [],
    invitations: [],
    members: [],
  };
}

function readMockStore(): MockOrganizationStore {
  if (typeof window === "undefined") {
    return getEmptyStore();
  }

  const raw = window.localStorage.getItem(mockOrganizationStorageKey);
  return raw ? (JSON.parse(raw) as MockOrganizationStore) : getEmptyStore();
}

function writeMockStore(store: MockOrganizationStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockOrganizationStorageKey, JSON.stringify(store));
}

function readMockSession(): SessionData {
  if (typeof window === "undefined") {
    return {
      session: null,
      user: null,
    };
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

function getCurrentSessionOrThrow(): ActiveMockSession {
  const sessionData = readMockSession();

  if (!sessionData.session || !sessionData.user) {
    throw new Error("Not authenticated.");
  }

  return {
    session: sessionData.session,
    user: sessionData.user,
  };
}

function buildOrganization(store: MockOrganizationStore, organizationId: string): Organization {
  const organization = store.organizations.find((item) => item.id === organizationId);

  if (!organization) {
    throw new Error("Organization not found.");
  }

  const invitations = store.invitations
    .filter((item) => item.organizationId === organizationId)
    .map((item) => ({
      ...item,
      organizationName: organization.name,
    }));

  const members = store.members.filter((item) => item.organizationId === organizationId);

  return {
    ...organization,
    invitations,
    members,
  };
}

function ensureTeamLeader(sessionUser: SessionUser) {
  if (sessionUser.role !== "TEAM_LEADER") {
    throw new Error("Only team leaders can manage organization settings.");
  }
}

export async function createOrganization(
  payload: CreateOrganizationPayload,
): Promise<ApiResponse<Organization>> {
  if (appConfig.useMockApi) {
    await delay(250);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    const store = readMockStore();
    const now = new Date().toISOString();
    const organizationId = crypto.randomUUID();
    const memberId = crypto.randomUUID();

    store.organizations.push({
      id: organizationId,
      name: payload.name,
      slug: payload.slug,
      logo: payload.logo || null,
    });

    store.members.push({
      id: memberId,
      organizationId,
      userId: sessionData.user.id,
      role: "TEAM_LEADER",
      createdAt: now,
      user: {
        id: sessionData.user.id,
        name: sessionData.user.name,
        email: sessionData.user.email,
        image: sessionData.user.image,
      },
    });

    writeMockStore(store);
    writeMockSession({
      ...sessionData,
      session: {
        ...sessionData.session,
        activeOrganizationId: organizationId,
      },
    });

    return {
      statusCode: 201,
      message: "Organization has been created.",
      data: buildOrganization(store, organizationId),
    };
  }

  const response = await api.post<ApiResponse<Organization>>("/org", payload);
  return response.data;
}

export async function getOrganization(): Promise<ApiResponse<Organization>> {
  if (appConfig.useMockApi) {
    await delay(200);

    const sessionData = getCurrentSessionOrThrow();

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readMockStore();

    return {
      statusCode: 200,
      message: "Organization has been found.",
      data: buildOrganization(store, sessionData.session.activeOrganizationId),
    };
  }

  const response = await api.get<ApiResponse<Organization>>("/org");
  return response.data;
}

export async function getMyInvitations(): Promise<ApiResponse<InvitationsData>> {
  if (appConfig.useMockApi) {
    await delay(200);

    const sessionData = getCurrentSessionOrThrow();
    const store = readMockStore();

    const invitations = store.invitations
      .filter((item) => item.email.toLowerCase() === sessionData.user.email.toLowerCase())
      .map((item) => ({
        ...item,
        organizationName:
          store.organizations.find((organization) => organization.id === item.organizationId)?.name ??
          "Unknown organization",
      }));

    return {
      statusCode: 200,
      message: "User invitations have been found.",
      data: {
        invitations,
        total: invitations.length,
      },
    };
  }

  const response = await api.get<ApiResponse<InvitationsData>>("/org/invitations/me");
  return response.data;
}

export async function acceptInvitation(id: string): Promise<ApiResponse<OrganizationMember>> {
  if (appConfig.useMockApi) {
    await delay(250);

    const sessionData = getCurrentSessionOrThrow();
    const store = readMockStore();
    const invitation = store.invitations.find((item) => item.id === id);

    if (!invitation) {
      throw new Error("Invitation not found.");
    }

    if (invitation.email.toLowerCase() !== sessionData.user.email.toLowerCase()) {
      throw new Error("Invitation email does not match the current session.");
    }

    invitation.status = "ACCEPTED";

    const existingMember = store.members.find(
      (item) =>
        item.organizationId === invitation.organizationId && item.user.email === sessionData.user.email,
    );

    const member =
      existingMember ??
      ({
        id: crypto.randomUUID(),
        organizationId: invitation.organizationId,
        userId: sessionData.user.id,
        role: invitation.role,
        createdAt: new Date().toISOString(),
        user: {
          id: sessionData.user.id,
          name: sessionData.user.name,
          email: sessionData.user.email,
          image: sessionData.user.image,
        },
      } satisfies OrganizationMember);

    if (!existingMember) {
      store.members.push(member);
    }

    writeMockStore(store);
    writeMockSession({
      session: {
        ...sessionData.session,
        activeOrganizationId: invitation.organizationId,
      },
      user: {
        ...sessionData.user,
        role: invitation.role,
      },
    });

    return {
      statusCode: 200,
      message: "Invitation has been accepted.",
      data: member,
    };
  }

  const response = await api.post<ApiResponse<OrganizationMember>>(`/org/invitations/${id}/accept`);
  return response.data;
}

export async function rejectInvitation(id: string): Promise<ApiResponse<OrganizationInvitation>> {
  if (appConfig.useMockApi) {
    await delay(200);

    const sessionData = getCurrentSessionOrThrow();
    const store = readMockStore();
    const invitation = store.invitations.find((item) => item.id === id);

    if (!invitation) {
      throw new Error("Invitation not found.");
    }

    if (invitation.email.toLowerCase() !== sessionData.user.email.toLowerCase()) {
      throw new Error("Invitation email does not match the current session.");
    }

    invitation.status = "REJECTED";
    writeMockStore(store);

    return {
      statusCode: 200,
      message: "Invitation has been rejected.",
      data: invitation,
    };
  }

  const response = await api.post<ApiResponse<OrganizationInvitation>>(`/org/invitations/${id}/reject`);
  return response.data;
}

export async function inviteMember(
  payload: InviteMemberPayload,
): Promise<ApiResponse<OrganizationInvitation>> {
  if (appConfig.useMockApi) {
    await delay(250);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readMockStore();
    const now = Date.now();
    const existingInvitation = store.invitations.find(
      (item) =>
        item.organizationId === sessionData.session?.activeOrganizationId &&
        item.email.toLowerCase() === payload.email.toLowerCase() &&
        item.status === "PENDING",
    );

    if (existingInvitation && !payload.resend) {
      throw new Error("This teammate already has a pending invitation.");
    }

    if (existingInvitation && payload.resend) {
      existingInvitation.role = payload.role;
      existingInvitation.expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
      writeMockStore(store);

      return {
        statusCode: 201,
        message: "Member invitation has been created.",
        data: existingInvitation,
      };
    }

    const invitation: OrganizationInvitation = {
      id: crypto.randomUUID(),
      organizationId: sessionData.session.activeOrganizationId,
      email: payload.email,
      role: payload.role,
      status: "PENDING",
      inviterId: sessionData.user.id,
      expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now).toISOString(),
    };

    store.invitations.push(invitation);
    writeMockStore(store);

    return {
      statusCode: 201,
      message: "Member invitation has been created.",
      data: invitation,
    };
  }

  const response = await api.post<ApiResponse<OrganizationInvitation>>("/org/invite", payload);
  return response.data;
}

export async function getOrganizationInvitations(): Promise<ApiResponse<InvitationsData>> {
  if (appConfig.useMockApi) {
    await delay(200);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readMockStore();
    const invitations = store.invitations.filter(
      (item) => item.organizationId === sessionData.session?.activeOrganizationId,
    );

    return {
      statusCode: 200,
      message: "Organization invitations have been found.",
      data: {
        invitations,
        total: invitations.length,
      },
    };
  }

  const response = await api.get<ApiResponse<InvitationsData>>("/org/invitations");
  return response.data;
}

export async function cancelInvitation(id: string): Promise<ApiResponse<OrganizationInvitation>> {
  if (appConfig.useMockApi) {
    await delay(200);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    const store = readMockStore();
    const invitation = store.invitations.find((item) => item.id === id);

    if (!invitation) {
      throw new Error("Invitation not found.");
    }

    invitation.status = "CANCELED";
    writeMockStore(store);

    return {
      statusCode: 200,
      message: "Invitation has been canceled.",
      data: invitation,
    };
  }

  const response = await api.post<ApiResponse<OrganizationInvitation>>(`/org/invitations/${id}/cancel`);
  return response.data;
}

export async function getOrganizationMembers(): Promise<ApiResponse<MembersData>> {
  if (appConfig.useMockApi) {
    await delay(200);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readMockStore();
    const members = store.members.filter(
      (item) => item.organizationId === sessionData.session?.activeOrganizationId,
    );

    return {
      statusCode: 200,
      message: "Organization members have been found.",
      data: {
        members,
        total: members.length,
      },
    };
  }

  const response = await api.get<ApiResponse<MembersData>>("/org/members");
  return response.data;
}

export async function updateOrganizationMember(
  id: string,
  payload: UpdateOrganizationMemberPayload,
): Promise<ApiResponse<OrganizationMember>> {
  if (appConfig.useMockApi) {
    await delay(220);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    const store = readMockStore();
    const member = store.members.find((item) => item.id === id);

    if (!member) {
      throw new Error("Member not found.");
    }

    member.role = payload.role;
    writeMockStore(store);

    return {
      statusCode: 200,
      message: "Member role has been updated.",
      data: member,
    };
  }

  const response = await api.patch<ApiResponse<OrganizationMember>>(`/org/members/${id}`, payload);
  return response.data;
}

export async function removeOrganizationMember(id: string): Promise<ApiResponse<OrganizationMember>> {
  if (appConfig.useMockApi) {
    await delay(220);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    const store = readMockStore();
    const memberIndex = store.members.findIndex((item) => item.id === id);

    if (memberIndex === -1) {
      throw new Error("Member not found.");
    }

    const [member] = store.members.splice(memberIndex, 1);
    writeMockStore(store);

    return {
      statusCode: 200,
      message: "Member has been removed.",
      data: member,
    };
  }

  const response = await api.delete<ApiResponse<OrganizationMember>>(`/org/members/${id}`);
  return response.data;
}
