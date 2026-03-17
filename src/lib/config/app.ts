const envApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

const liveApiBaseUrl =
  envApiBaseUrl && envApiBaseUrl.length > 0
    ? isAbsoluteUrl(envApiBaseUrl)
      ? "/api"
      : envApiBaseUrl
    : "/api";

export const appConfig = {
  name: "DevTrack",
  apiBaseUrl: liveApiBaseUrl,
  backendApiBaseUrl: envApiBaseUrl && envApiBaseUrl.length > 0 ? envApiBaseUrl : null,
  useMockApi,
  apiMode: useMockApi ? "mock" : "live",
} as const;
