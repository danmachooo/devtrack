"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useSession } from "@/hooks/use-session";
import { formatRoleLabel } from "@/lib/auth/permissions";
import {
  acceptInvitation,
  cancelInvitation,
  createOrganization,
  getMyInvitations,
  getOrganization,
  getOrganizationInvitations,
  getOrganizationMembers,
  inviteMember,
  rejectInvitation,
  removeOrganizationMember,
  updateOrganizationMember,
} from "@/lib/api/organization.api";
import {
  createOrganizationSchema,
  inviteMemberSchema,
  type CreateOrganizationFormValues,
  type InviteMemberFormValues,
} from "@/features/organization/organization.schemas";
import type { OrganizationInvitation, OrganizationMember, UserRole } from "@/types/api";

const memberRoles: UserRole[] = [
  "TEAM_LEADER",
  "BUSINESS_ANALYST",
  "QUALITY_ASSURANCE",
  "DEVELOPER",
];

export default function OrganizationPage() {
  const queryClient = useQueryClient();
  const { data: sessionResponse } = useSession();
  const session = sessionResponse?.data.session;
  const user = sessionResponse?.data.user;
  const activeOrganizationId = session?.activeOrganizationId ?? null;
  const isTeamLeader = user?.role === "TEAM_LEADER";

  const [memberRoleDrafts, setMemberRoleDrafts] = useState<Record<string, UserRole>>({});

  const organizationQuery = useQuery({
    queryKey: ["organization", activeOrganizationId],
    queryFn: getOrganization,
    enabled: Boolean(activeOrganizationId),
  });

  const personalInvitationsQuery = useQuery({
    queryKey: ["my-invitations", user?.email],
    queryFn: getMyInvitations,
    enabled: Boolean(user?.email),
  });

  const organizationInvitationsQuery = useQuery({
    queryKey: ["organization-invitations", activeOrganizationId],
    queryFn: getOrganizationInvitations,
    enabled: Boolean(activeOrganizationId) && isTeamLeader,
  });

  const membersQuery = useQuery({
    queryKey: ["organization-members", activeOrganizationId],
    queryFn: getOrganizationMembers,
    enabled: Boolean(activeOrganizationId) && isTeamLeader,
  });

  const {
    register: registerOrganization,
    handleSubmit: handleCreateOrganizationSubmit,
    formState: {
      errors: createOrganizationErrors,
      isSubmitting: isCreatingOrganizationForm,
    },
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
    },
  });

  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    reset: resetInviteForm,
    formState: { errors: inviteErrors, isSubmitting: isInvitingForm },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "BUSINESS_ANALYST",
    },
  });

  const invalidateOrganizationState = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["session"] }),
      queryClient.invalidateQueries({ queryKey: ["organization"] }),
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] }),
      queryClient.invalidateQueries({ queryKey: ["organization-invitations"] }),
      queryClient.invalidateQueries({ queryKey: ["organization-members"] }),
    ]);
  };

  const createOrganizationMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: invalidateOrganizationState,
  });

  const inviteMemberMutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: async () => {
      resetInviteForm();
      await invalidateOrganizationState();
    },
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: invalidateOrganizationState,
  });

  const rejectInvitationMutation = useMutation({
    mutationFn: rejectInvitation,
    onSuccess: invalidateOrganizationState,
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: cancelInvitation,
    onSuccess: invalidateOrganizationState,
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateOrganizationMember(id, { role }),
    onSuccess: invalidateOrganizationState,
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeOrganizationMember,
    onSuccess: invalidateOrganizationState,
  });

  const organization = organizationQuery.data?.data;
  const personalInvitations = personalInvitationsQuery.data?.data.invitations ?? [];
  const organizationInvitations = organizationInvitationsQuery.data?.data.invitations ?? [];
  const members = membersQuery.data?.data.members ?? organization?.members ?? [];

  useEffect(() => {
    if (!members.length) {
      return;
    }

    setMemberRoleDrafts((current) => {
      const next = { ...current };

      for (const member of members) {
        next[member.id] = current[member.id] ?? member.role;
      }

      return next;
    });
  }, [members]);

  const invitationStats = useMemo(
    () => ({
      pending: organizationInvitations.filter((item) => item.status === "PENDING").length,
      accepted: organizationInvitations.filter((item) => item.status === "ACCEPTED").length,
    }),
    [organizationInvitations],
  );

  const handleCreateOrganization = handleCreateOrganizationSubmit((values) => {
    createOrganizationMutation.mutate({
      name: values.name,
      slug: values.slug,
      logo: values.logo || undefined,
    });
  });

  const handleInviteMember = handleInviteSubmit((values) => {
    inviteMemberMutation.mutate({
      email: values.email,
      role: values.role,
      resend: false,
    });
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organization"
        description={
          activeOrganizationId
            ? "Manage the internal team workspace, invitations, and organization membership."
            : "Create a workspace or accept an invitation to activate the internal experience."
        }
        actions={
          activeOrganizationId ? (
            <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground-muted)]">
              Current role: {user?.role ? formatRoleLabel(user.role) : "Loading"}
            </div>
          ) : null
        }
      />

      {!activeOrganizationId ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="space-y-6 p-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Create your organization</h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                This is the first team workspace shell. Once it exists, projects, invitations, and
                delivery views can become organization-scoped.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCreateOrganization}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="organization-name">
                  Organization name
                </label>
                <Input
                  id="organization-name"
                  placeholder="Acme Delivery Team"
                  {...registerOrganization("name")}
                />
                {createOrganizationErrors.name ? (
                  <p className="text-sm text-[var(--danger)]">
                    {createOrganizationErrors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="organization-slug">
                  Slug
                </label>
                <Input
                  id="organization-slug"
                  placeholder="acme-delivery-team"
                  {...registerOrganization("slug")}
                />
                {createOrganizationErrors.slug ? (
                  <p className="text-sm text-[var(--danger)]">
                    {createOrganizationErrors.slug.message}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Lowercase letters, numbers, and hyphens only.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="organization-logo">
                  Logo URL
                </label>
                <Input
                  id="organization-logo"
                  placeholder="https://example.com/logo.png"
                  {...registerOrganization("logo")}
                />
                {createOrganizationErrors.logo ? (
                  <p className="text-sm text-[var(--danger)]">
                    {createOrganizationErrors.logo.message}
                  </p>
                ) : null}
              </div>

              {createOrganizationMutation.isError ? (
                <p className="text-sm text-[var(--danger)]">
                  {createOrganizationMutation.error instanceof Error
                    ? createOrganizationMutation.error.message
                    : "Organization creation failed. Try again."}
                </p>
              ) : null}

              <Button
                disabled={isCreatingOrganizationForm || createOrganizationMutation.isPending}
                type="submit"
              >
                {isCreatingOrganizationForm || createOrganizationMutation.isPending
                  ? "Creating organization..."
                  : "Create organization"}
              </Button>
            </form>
          </Card>

          <Card className="space-y-6 p-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Personal invitations</h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                If another team invited you already, accept it here and the workspace becomes active
                immediately.
              </p>
            </div>

            {personalInvitationsQuery.isLoading ? (
              <p className="text-sm text-[var(--foreground-muted)]">Loading invitations...</p>
            ) : personalInvitations.length ? (
              <div className="space-y-4">
                {personalInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onAccept={() => acceptInvitationMutation.mutate(invitation.id)}
                    onReject={() => rejectInvitationMutation.mutate(invitation.id)}
                    pendingActionId={
                      acceptInvitationMutation.variables ?? rejectInvitationMutation.variables
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No invitations yet"
                description="You can create a new organization now, or sign in later with an invited teammate email once a team leader sends an invite."
              />
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Organization"
              value={organization?.name ?? "Loading"}
              detail={organization?.slug ? `Slug: ${organization.slug}` : "Syncing org details"}
            />
            <SummaryCard
              label="Members"
              value={String(members.length)}
              detail="Current internal team seats"
            />
            <SummaryCard
              label="Pending invites"
              value={String(invitationStats.pending)}
              detail={`${invitationStats.accepted} accepted invitations recorded`}
            />
          </div>

          {isTeamLeader ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Card className="space-y-6 p-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Invite teammates</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Invite business analysts, QA, and developers into this workspace. Team leader
                    access stays reserved for the creator flow right now.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleInviteMember}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="invite-email">
                      Teammate email
                    </label>
                    <Input
                      id="invite-email"
                      placeholder="teammate@example.com"
                      {...registerInvite("email")}
                    />
                    {inviteErrors.email ? (
                      <p className="text-sm text-[var(--danger)]">{inviteErrors.email.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="invite-role">
                      Role
                    </label>
                    <Select id="invite-role" {...registerInvite("role")}>
                      <option value="BUSINESS_ANALYST">Business Analyst</option>
                      <option value="QUALITY_ASSURANCE">Quality Assurance</option>
                      <option value="DEVELOPER">Developer</option>
                    </Select>
                    {inviteErrors.role ? (
                      <p className="text-sm text-[var(--danger)]">{inviteErrors.role.message}</p>
                    ) : null}
                  </div>

                  {inviteMemberMutation.isError ? (
                    <p className="text-sm text-[var(--danger)]">
                      {inviteMemberMutation.error instanceof Error
                        ? inviteMemberMutation.error.message
                        : "Invitation failed. Try again."}
                    </p>
                  ) : null}

                  <Button disabled={isInvitingForm || inviteMemberMutation.isPending} type="submit">
                    {isInvitingForm || inviteMemberMutation.isPending
                      ? "Sending invitation..."
                      : "Invite teammate"}
                  </Button>
                </form>
              </Card>

              <Card className="space-y-6 p-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Invitation management</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Review outgoing invitations and cancel any pending invites that should no longer
                    be available.
                  </p>
                </div>

                {organizationInvitationsQuery.isLoading ? (
                  <p className="text-sm text-[var(--foreground-muted)]">Loading invitations...</p>
                ) : organizationInvitations.length ? (
                  <div className="space-y-3">
                    {organizationInvitations.map((invitation) => (
                      <ManageInvitationRow
                        key={invitation.id}
                        invitation={invitation}
                        onCancel={() => cancelInvitationMutation.mutate(invitation.id)}
                        pendingActionId={cancelInvitationMutation.variables}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No outgoing invitations"
                    description="Invite your first teammate to turn this into a shared delivery workspace."
                  />
                )}
              </Card>
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-sm text-[var(--foreground-muted)]">
                You are part of <span className="font-semibold text-[var(--foreground)]">{organization?.name}</span>.
                Team leaders handle invitations and member management, while your role here remains{" "}
                <span className="font-semibold text-[var(--foreground)]">{user?.role}</span>.
              </p>
            </Card>
          )}

          <Card className="space-y-6 p-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Members</h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                See who is inside the organization and adjust roles or membership where team-leader
                permissions allow it.
              </p>
            </div>

            {members.length ? (
              <div className="space-y-3">
                {members.map((member) => (
                  <MemberRow
                    key={member.id}
                    currentUserId={user?.id ?? ""}
                    draftRole={memberRoleDrafts[member.id] ?? member.role}
                    member={member}
                    onDraftRoleChange={(role) =>
                      setMemberRoleDrafts((current) => ({
                        ...current,
                        [member.id]: role,
                      }))
                    }
                    onRemove={() => removeMemberMutation.mutate(member.id)}
                    onSaveRole={() =>
                      updateMemberMutation.mutate({
                        id: member.id,
                        role: memberRoleDrafts[member.id] ?? member.role,
                      })
                    }
                    canManage={Boolean(isTeamLeader)}
                    pendingRemoveId={removeMemberMutation.variables}
                    pendingSaveId={updateMemberMutation.variables?.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No members yet"
                description="Once invitations are accepted, your teammate list will populate here."
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="space-y-2 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-[var(--foreground-muted)]">{detail}</p>
    </Card>
  );
}

function InvitationCard({
  invitation,
  onAccept,
  onReject,
  pendingActionId,
}: {
  invitation: OrganizationInvitation;
  onAccept: () => void;
  onReject: () => void;
  pendingActionId?: string;
}) {
  const isPendingAction = pendingActionId === invitation.id;

  return (
    <Card className="space-y-4 p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{invitation.organizationName ?? "Organization"}</h3>
        <p className="text-sm text-[var(--foreground-muted)]">
          Role: {formatRole(invitation.role)} · Status: {formatStatus(invitation.status)}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={isPendingAction} onClick={onAccept} type="button">
          {isPendingAction ? "Working..." : "Accept invitation"}
        </Button>
        <Button disabled={isPendingAction} onClick={onReject} type="button" variant="secondary">
          Reject
        </Button>
      </div>
    </Card>
  );
}

function ManageInvitationRow({
  invitation,
  onCancel,
  pendingActionId,
}: {
  invitation: OrganizationInvitation;
  onCancel: () => void;
  pendingActionId?: string;
}) {
  const isPendingAction = pendingActionId === invitation.id;

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-medium">{invitation.email}</p>
          <p className="text-sm text-[var(--foreground-muted)]">
            {formatRole(invitation.role)} · {formatStatus(invitation.status)}
          </p>
        </div>
        <Button
          disabled={isPendingAction || invitation.status !== "PENDING"}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          {isPendingAction ? "Canceling..." : "Cancel invite"}
        </Button>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  draftRole,
  currentUserId,
  canManage,
  pendingSaveId,
  pendingRemoveId,
  onDraftRoleChange,
  onSaveRole,
  onRemove,
}: {
  member: OrganizationMember;
  draftRole: UserRole;
  currentUserId: string;
  canManage: boolean;
  pendingSaveId?: string;
  pendingRemoveId?: string;
  onDraftRoleChange: (role: UserRole) => void;
  onSaveRole: () => void;
  onRemove: () => void;
}) {
  const isCurrentUser = currentUserId === member.userId;
  const isSaving = pendingSaveId === member.id;
  const isRemoving = pendingRemoveId === member.id;

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="font-medium">
            {member.user.name}
            {isCurrentUser ? " (You)" : ""}
          </p>
          <p className="text-sm text-[var(--foreground-muted)]">{member.user.email}</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {canManage ? (
            <>
              <Select
                className="min-w-52"
                value={draftRole}
                onChange={(event) => onDraftRoleChange(event.target.value as UserRole)}
                disabled={isCurrentUser || isSaving || isRemoving}
              >
                {memberRoles.map((role) => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </Select>
              <Button disabled={isCurrentUser || isSaving || isRemoving} onClick={onSaveRole} type="button">
                {isSaving ? "Saving..." : "Save role"}
              </Button>
              <Button
                disabled={isCurrentUser || isSaving || isRemoving}
                onClick={onRemove}
                type="button"
                variant="secondary"
              >
                {isRemoving ? "Removing..." : "Remove"}
              </Button>
            </>
          ) : (
            <div className="text-sm font-medium text-[var(--foreground-muted)]">{formatRole(member.role)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRole(role: UserRole) {
  return formatRoleLabel(role);
}

function formatStatus(status: OrganizationInvitation["status"]) {
  return status.toLowerCase().charAt(0).toUpperCase() + status.toLowerCase().slice(1);
}
