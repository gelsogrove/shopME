export interface LLMRequest {
  chatInput: string;
  workspaceId: string;
  customerid: string;
  phone: string;
  language: string;
  sessionId: string;
  temperature: number;
  maxTokens: number;
  model: string;
  messages: any[];
  prompt: string;
}

export interface LLMResponse {
  output: string;
  success: boolean;
  functionCalls?: any[];
}

export interface FunctionCall {
  functionName: string;
  arguments: any;
  result: any;
}

// Interfaces aggiuntive per compatibilità
export interface GetServicesResponse {
  success: boolean;
  services: any[];
}

export interface GetShipmentTrackingLinkRequest {
  workspaceId: string;
  customerId: string;
}

export interface GetShipmentTrackingLinkResponse {
  success: boolean;
  linkUrl: string;
}

export interface RagSearchRequest {
  query: string;
  workspaceId: string;
  customerId: string;
  messages: any[];
}

export interface RagSearchResponse {
  success: boolean;
  results: any[];
}

export interface TokenResponse {
  token: string;
  success: boolean;
  expiresAt: string;
  linkUrl: string;
  action: string;
}

export interface WhatsAppRequest {
  messageContent: string;
  workspaceId: string;
  customerid: string;
}

export interface WhatsAppResponse {
  success: boolean;
  message: string;
}