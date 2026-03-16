"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import {
  notionConnectionSchema,
  notionStatusMappingSchema,
  type NotionConnectionFormValues,
  type NotionStatusMappingFormValues,
} from "@/features/notion/notion.schemas";
import {
  deriveMappingFormValues,
  formatTargetLabel,
} from "@/features/notion/notion.utils";
import { useNotionIntegration } from "@/features/notion/use-notion-integration";
import type { DevtrackStatus, Project } from "@/types/api";

type NotionIntegrationPanelProps = {
  project: Project;
};

export function NotionIntegrationPanel({ project }: NotionIntegrationPanelProps) {
  const { data: sessionResponse } = useSession();
  const role = sessionResponse?.data.user?.role;
  const canManageNotion = canPerformAction(role, "manageNotion");

  const {
    register: registerConnection,
    handleSubmit: handleConnectionSubmit,
    reset: resetConnectionForm,
    formState: { errors: connectionErrors, isSubmitting: isConnectionSubmitting },
  } = useForm<NotionConnectionFormValues>({
    resolver: zodResolver(notionConnectionSchema),
    defaultValues: {
      notionToken: "",
      databaseId: project.notionDatabaseId ?? "",
    },
  });

  const {
    register: registerMapping,
    handleSubmit: handleMappingSubmit,
    reset: resetMappingForm,
    formState: { errors: mappingErrors, isSubmitting: isMappingSubmitting },
  } = useForm<NotionStatusMappingFormValues>({
    resolver: zodResolver(notionStatusMappingSchema),
    defaultValues: deriveMappingFormValues(project),
  });

  useEffect(() => {
    resetConnectionForm({
      notionToken: "",
      databaseId: project.notionDatabaseId ?? "",
    });
    resetMappingForm(deriveMappingFormValues(project));
  }, [project, resetConnectionForm, resetMappingForm]);

  const {
    connectMutation,
    databasesQuery,
    saveMappingMutation,
    savedDatabase,
    testMutation,
    testResult,
  } = useNotionIntegration(project.id, {
    canManageNotion,
    hasConnectedDatabase: Boolean(project.notionDatabaseId),
    resetConnectionForm: (databaseId) =>
      resetConnectionForm({
        notionToken: "",
        databaseId,
      }),
  });

  const onTestConnection = handleConnectionSubmit((values) => {
    testMutation.mutate(values);
  });

  const onConnect = handleConnectionSubmit((values) => {
    connectMutation.mutate(values);
  });

  const onSaveMapping = handleMappingSubmit((values) => {
    saveMappingMutation.mutate(values);
  });

  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          Notion integration
        </p>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Connect the source of truth</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Test the connection, save it, then map statuses for progress.
            </p>
          </div>
          <InfoPopover label="More about Notion integration">
            <p>
              DevTrack only calculates trustworthy progress after the project is connected to the
              right database and the source statuses are mapped correctly.
            </p>
          </InfoPopover>
        </div>
      </div>

      {!canManageNotion ? (
        <ReadOnlyNotionSummary project={project} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Test and save connection</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Verify the database before saving.
                    </p>
                  </div>
                  <InfoPopover label="More about connection testing" align="left">
                    <p>
                      The token is not shown again after this form. Testing first helps confirm the
                      database is reachable before the project is locked onto it.
                    </p>
                  </InfoPopover>
                </div>
              </div>

              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="notion-token">
                    Notion token
                  </label>
                  <Input
                    id="notion-token"
                    placeholder="secret_xxx"
                    type="password"
                    {...registerConnection("notionToken")}
                  />
                  {connectionErrors.notionToken ? (
                    <p className="text-sm text-[var(--danger)]">
                      {connectionErrors.notionToken.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="notion-database-id">
                    Database ID
                  </label>
                  <Input
                    id="notion-database-id"
                    placeholder="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
                    {...registerConnection("databaseId")}
                  />
                  {connectionErrors.databaseId ? (
                    <p className="text-sm text-[var(--danger)]">
                      {connectionErrors.databaseId.message}
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Use the Notion database identifier exactly as the API contract expects.
                    </p>
                  )}
                </div>

                {testMutation.isError ? (
                  <p className="text-sm text-[var(--danger)]">
                    {testMutation.error instanceof Error
                      ? testMutation.error.message
                      : "Notion test failed. Try again."}
                  </p>
                ) : null}

                {connectMutation.isError ? (
                  <p className="text-sm text-[var(--danger)]">
                    {connectMutation.error instanceof Error
                      ? connectMutation.error.message
                      : "Saving the Notion connection failed. Try again."}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={
                      isConnectionSubmitting || testMutation.isPending || connectMutation.isPending
                    }
                    onClick={onTestConnection}
                    type="button"
                    variant="secondary"
                  >
                    {testMutation.isPending ? "Testing..." : "Test connection"}
                  </Button>
                  <Button
                    disabled={
                      isConnectionSubmitting || testMutation.isPending || connectMutation.isPending
                    }
                    onClick={onConnect}
                    type="button"
                  >
                    {connectMutation.isPending ? "Saving..." : "Save connection"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Connected database</h3>
              {savedDatabase ? (
                <ConnectionSummary details={savedDatabase} />
              ) : testResult ? (
                <ConnectionSummary details={testResult} tone="preview" />
              ) : (
                <EmptyState
                  title="No database connected yet"
                  description="Test the connection first, then save it to lock the project onto the right Notion database."
                />
              )}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Status mapping editor</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Match each DevTrack status to the source label used in Notion.
                    </p>
                  </div>
                  <InfoPopover label="More about status mapping" align="left">
                    <p>
                      This step teaches DevTrack how to interpret your workflow. If the mapping is
                      wrong, project progress will be wrong too.
                    </p>
                  </InfoPopover>
                </div>
              </div>

              <form className="space-y-4" onSubmit={onSaveMapping}>
                <MappingField
                  description="This source status means work has not started yet."
                  error={mappingErrors.notStarted?.message}
                  id="status-not-started"
                  label="Maps to Not Started"
                  register={registerMapping("notStarted")}
                />
                <MappingField
                  description="This source status means work is actively in development."
                  error={mappingErrors.inDev?.message}
                  id="status-in-dev"
                  label="Maps to In Development"
                  register={registerMapping("inDev")}
                />
                <MappingField
                  description="This source status means work is approved and should count as complete."
                  error={mappingErrors.approved?.message}
                  id="status-approved"
                  label="Maps to Approved"
                  register={registerMapping("approved")}
                />
                <MappingField
                  description="This source status means work is released and should count as complete."
                  error={mappingErrors.released?.message}
                  id="status-released"
                  label="Maps to Released"
                  register={registerMapping("released")}
                />

                {saveMappingMutation.isError ? (
                  <p className="text-sm text-[var(--danger)]">
                    {saveMappingMutation.error instanceof Error
                      ? saveMappingMutation.error.message
                      : "Saving the status mapping failed. Try again."}
                  </p>
                ) : null}

                <Button disabled={isMappingSubmitting || saveMappingMutation.isPending} type="submit">
                  {saveMappingMutation.isPending ? "Saving mapping..." : "Save status mapping"}
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold">Completion logic</h3>
                <InfoPopover label="More about completion logic" align="left">
                  <p>Only assigned, non-missing tickets contribute to progress.</p>
                  <p className="mt-2">
                    Approved and Released count as complete work. Not Started and In Development do
                    not.
                  </p>
                </InfoPopover>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="space-y-3 text-sm text-[var(--foreground-muted)]">
                  <p>
                    DevTrack treats <span className="font-semibold text-[var(--foreground)]">Approved</span> and{" "}
                    <span className="font-semibold text-[var(--foreground)]">Released</span> as
                    complete work for progress.
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Not Started</span> and{" "}
                    <span className="font-semibold text-[var(--foreground)]">In Development</span>{" "}
                    keep progress incomplete.
                  </p>
                  <p>
                    If this mapping is inaccurate, project progress will be inaccurate too, so this
                    step is intentionally explicit.
                  </p>
                </div>
              </div>

              {project.statusMapping && Object.keys(project.statusMapping).length ? (
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                    Saved mapping
                  </p>
                  <div className="mt-3 space-y-2">
                    {Object.entries(project.statusMapping).map(([sourceStatus, targetStatus]) => (
                      <div
                        key={`${sourceStatus}-${targetStatus}`}
                        className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                      >
                        <span>{sourceStatus}</span>
                        <span className="font-semibold text-[var(--foreground-muted)]">
                          {formatTargetLabel(targetStatus)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No mapping saved yet"
                  description="Once saved, the current status translation will stay visible here for review."
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function ReadOnlyNotionSummary({ project }: { project: Project }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
        <h3 className="text-lg font-semibold">Connection status</h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          {project.notionDatabaseId
            ? `A Notion database is connected for this project.`
            : "No Notion database has been connected yet."}
        </p>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
        <h3 className="text-lg font-semibold">Status mapping status</h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          {project.statusMapping && Object.keys(project.statusMapping).length
            ? "A status mapping is already saved for this project."
            : "No status mapping has been saved yet."}
        </p>
        <p className="mt-3 text-sm text-[var(--foreground-muted)]">
          Only team leaders can test, connect, or update Notion configuration.
        </p>
      </div>
    </div>
  );
}

function ConnectionSummary({
  details,
  tone = "saved",
}: {
  details: {
    databaseTitle: string;
    databaseUrl: string;
    notionDatabaseId: string;
    dataSources: Array<{ id: string; name: string }>;
  };
  tone?: "saved" | "preview";
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-lg font-semibold">{details.databaseTitle}</h4>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
          {tone === "saved" ? "Saved" : "Preview"}
        </span>
      </div>
      <div className="mt-4 space-y-3 text-sm text-[var(--foreground-muted)]">
        <div>
          <div className="text-xs uppercase tracking-[0.18em]">Database ID</div>
          <div className="mt-1 break-all text-[var(--foreground)]">{details.notionDatabaseId}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em]">Database URL</div>
          <div className="mt-1 break-all text-[var(--foreground)]">{details.databaseUrl}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em]">Data sources</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {details.dataSources.map((source) => (
              <span
                key={source.id}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
              >
                {source.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MappingField({
  id,
  label,
  description,
  error,
  register,
}: {
  id: string;
  label: string;
  description: string;
  error?: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <label className="text-sm font-medium" htmlFor={id}>
          {label}
        </label>
        <InfoPopover label={`More about ${label}`} align="left" className="shrink-0">
          <p>{description}</p>
        </InfoPopover>
      </div>
      <Input id={id} placeholder="Enter the Notion status label" {...register} />
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
