import { z } from "zod";

// --- Users & Orgs ---

export const UserRole = z.enum(["owner", "admin", "member"]);
export type UserRole = z.infer<typeof UserRole>;

export const Plan = z.enum(["free", "pro", "team", "enterprise"]);
export type Plan = z.infer<typeof Plan>;

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  stripeCustomerId: string | null;
  limits: OrganizationLimits;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationLimits {
  maxProjects: number;
  maxSandboxHours: number;
  maxMessages: number;
  maxSeats: number;
}

export interface OrganizationMember {
  orgId: string;
  userId: string;
  role: UserRole;
  createdAt: Date;
}

// --- Projects ---

export type SandboxProvider = "daytona" | "modal" | "e2b" | "webcontainer";

export interface Project {
  id: string;
  orgId: string;
  name: string;
  sandboxProvider: SandboxProvider;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

// --- Chat ---

export type ChatMode = "build" | "discuss";

export interface ChatSession {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  mode: ChatMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokenCount: number;
  createdAt: Date;
}

// --- API Keys (BYOK) ---

export interface ApiKey {
  id: string;
  orgId: string;
  keyHash: string;
  scopes: string[];
  name: string;
  lastUsedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
}

// --- Sandbox ---

export type SandboxStatus = "creating" | "running" | "stopped" | "error";

export interface SandboxInstance {
  id: string;
  projectId: string;
  provider: SandboxProvider;
  status: SandboxStatus;
  providerInstanceId: string | null;
  previewUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// --- Billing ---

export type BillingEventType =
  | "message.sent"
  | "sandbox.hour"
  | "seat.added"
  | "storage.gb";

export interface BillingEvent {
  id: string;
  orgId: string;
  eventType: BillingEventType;
  quantity: number;
  timestamp: Date;
}

// --- Events (for BullMQ) ---

export const EventNames = {
  PROJECT_CREATED: "project.created",
  CHAT_MESSAGE_COMPLETED: "chat.message.completed",
  BUILD_REQUESTED: "build.requested",
  BUILD_COMPLETED: "build.completed",
  BILLING_USAGE_UPDATED: "billing.usage.updated",
  ORG_PLAN_CHANGED: "org.plan.changed",
} as const;

export interface ProjectCreatedEvent {
  projectId: string;
  orgId: string;
  userId: string;
}

export interface ChatMessageCompletedEvent {
  sessionId: string;
  projectId: string;
  orgId: string;
  userId: string;
  tokenCount: number;
}

export interface BuildRequestedEvent {
  projectId: string;
  orgId: string;
  sandboxInstanceId: string;
}

export interface BuildCompletedEvent {
  projectId: string;
  sandboxInstanceId: string;
  success: boolean;
  previewUrl?: string;
}

export interface BillingUsageUpdatedEvent {
  orgId: string;
  eventType: BillingEventType;
  quantity: number;
}

export interface OrgPlanChangedEvent {
  orgId: string;
  oldPlan: Plan;
  newPlan: Plan;
}

// --- AI Provider ---

export interface ModelInfo {
  name: string;
  label: string;
  provider: string;
  maxTokenOutput?: number;
  maxContextTokens?: number;
  reasoning?: boolean;
  vision?: boolean;
}

export interface ProviderInfo {
  name: string;
  staticModels: ModelInfo[];
  getDynamicModels?: (
    apiKeys: Record<string, string>,
    serverEnv?: Record<string, string>,
  ) => Promise<ModelInfo[]>;
}

export interface ProviderConfig {
  baseUrlKey?: string;
  baseUrl?: string;
  apiTokenKey?: string;
}

export interface IProvider {
  readonly name: string;
  readonly config: ProviderConfig;
  readonly staticModels: ModelInfo[];

  getDynamicModels(
    apiKeys: Record<string, string>,
    settings: Record<string, string>,
    serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]>;

  getModelInstance(options: {
    model: string;
    apiKeys: Record<string, string>;
    settings: Record<string, string>;
    serverEnv?: Record<string, string>;
  }): Promise<{ model: import("ai").LanguageModelV1 }>;
}

// --- Sandbox Provider ---

export interface SandboxProviderConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface SandboxCreateOptions {
  projectId: string;
  language?: string;
  template?: string;
  env?: Record<string, string>;
}

export interface SandboxFile {
  path: string;
  content: string;
}

export interface SandboxProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface ISandboxProvider {
  readonly name: SandboxProvider;
  initialize(config: SandboxProviderConfig): Promise<void>;
  createSandbox(options: SandboxCreateOptions): Promise<string>;
  destroySandbox(instanceId: string): Promise<void>;
  writeFiles(instanceId: string, files: SandboxFile[]): Promise<void>;
  readFile(instanceId: string, path: string): Promise<string>;
  executeCommand(
    instanceId: string,
    command: string,
    cwd?: string,
  ): Promise<SandboxProcessResult>;
  getPreviewUrl(instanceId: string, port?: number): Promise<string>;
  streamLogs(instanceId: string): AsyncIterable<string>;
  getStatus(instanceId: string): Promise<SandboxStatus>;
}

// --- GitHub App Installation ---

export interface GitHubAppInstallation {
  id: string;
  orgId: string;
  installationId: number;
  accountId: number;
  accountLogin: string;
  encryptedToken: string;
  tokenIv: string;
  tokenTag: string;
  tokenExpiresAt: Date;
  permissions: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
