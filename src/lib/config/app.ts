const envApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const appConfig = {
  name: "DevTrack",
  apiBaseUrl: envApiBaseUrl && envApiBaseUrl.length > 0 ? envApiBaseUrl : "/api",
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API === "true",
  apiMode: process.env.NEXT_PUBLIC_USE_MOCK_API === "true" ? "mock" : "live",
} as const;
