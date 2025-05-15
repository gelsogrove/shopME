import { AgentProps } from "../../../domain/entities/agent.entity";

// Utilizza il timestamp condiviso dichiarato in mockUsers
// export const timestamp = Date.now();

export const mockAgent: AgentProps = {
  name: "Test Agent",
  content: "I am a test agent that helps with customer questions.",
  isActive: true,
  isRouter: false,
  department: "Customer Service",
  workspaceId: "test-workspace-id",
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  model: "gpt-3.5-turbo",
  max_tokens: 1000,
};

export const mockRouterAgent: AgentProps = {
  name: "Router Agent",
  content: "I route customer questions to the appropriate department.",
  isActive: true,
  isRouter: true,
  department: null,
  workspaceId: "test-workspace-id",
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  model: "gpt-3.5-turbo",
  max_tokens: 1000,
};

export const createMockAgent = (overrides: Partial<AgentProps> = {}): AgentProps => {
  const now = Date.now();
  return {
    ...mockAgent,
    name: `Agent-${now}`,
    ...overrides,
  };
};

export const createMockRouterAgent = (overrides: Partial<AgentProps> = {}): AgentProps => {
  const now = Date.now();
  return {
    ...mockRouterAgent,
    name: `Router-${now}`,
    ...overrides,
  };
}; 