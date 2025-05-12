import { Entity } from './entity';

export interface WorkspaceProps {
  id?: string;
  name: string;
  slug?: string;
  description?: string | null;
  whatsappPhoneNumber?: string | null;
  whatsappApiToken?: string | null;
  whatsappWebhookUrl?: string | null;
  webhookUrl?: string | null;
  notificationEmail?: string | null;
  language?: string;
  currency?: string;
  messageLimit?: number;
  blocklist?: string | null;
  welcomeMessages?: Record<string, string> | null;
  wipMessages?: Record<string, string> | null;
  challengeStatus?: boolean;
  isActive?: boolean;
  isDelete?: boolean;
  url?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Workspace extends Entity<WorkspaceProps> {
  get id(): string {
    return this.props.id || '';
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string | undefined {
    return this.props.slug;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get whatsappPhoneNumber(): string | null | undefined {
    return this.props.whatsappPhoneNumber;
  }

  get whatsappApiToken(): string | null | undefined {
    return this.props.whatsappApiToken;
  }

  get whatsappWebhookUrl(): string | null | undefined {
    return this.props.whatsappWebhookUrl;
  }

  get webhookUrl(): string | null | undefined {
    return this.props.webhookUrl;
  }

  get notificationEmail(): string | null | undefined {
    return this.props.notificationEmail;
  }

  get language(): string {
    return this.props.language ?? 'ENG';
  }

  get currency(): string {
    return this.props.currency ?? 'EUR';
  }

  get messageLimit(): number {
    return this.props.messageLimit ?? 50;
  }

  get blocklist(): string | null | undefined {
    return this.props.blocklist;
  }

  get welcomeMessages(): Record<string, string> | null | undefined {
    return this.props.welcomeMessages;
  }

  get wipMessages(): Record<string, string> | null | undefined {
    return this.props.wipMessages;
  }

  get challengeStatus(): boolean {
    return this.props.challengeStatus ?? false;
  }

  get isActive(): boolean {
    return this.props.isActive ?? true;
  }

  get isDelete(): boolean {
    return this.props.isDelete ?? false;
  }

  get url(): string | null | undefined {
    return this.props.url;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  static create(props: WorkspaceProps): Workspace {
    // Validations
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Workspace name is required');
    }

    // Set defaults
    return new Workspace({
      ...props,
      language: props.language ?? 'ENG',
      currency: props.currency ?? 'EUR',
      messageLimit: props.messageLimit ?? 50,
      isActive: props.isActive ?? true,
      isDelete: props.isDelete ?? false,
      challengeStatus: props.challengeStatus ?? false,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date()
    });
  }

  public updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  public updateDescription(description: string | null): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  public updateWhatsappConfig(
    phoneNumber: string | null,
    apiToken: string | null,
    webhookUrl: string | null
  ): void {
    this.props.whatsappPhoneNumber = phoneNumber;
    this.props.whatsappApiToken = apiToken;
    this.props.whatsappWebhookUrl = webhookUrl;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public markDeleted(): void {
    this.props.isDelete = true;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      whatsappPhoneNumber: this.whatsappPhoneNumber,
      whatsappApiToken: this.whatsappApiToken,
      whatsappWebhookUrl: this.whatsappWebhookUrl,
      webhookUrl: this.webhookUrl,
      notificationEmail: this.notificationEmail,
      language: this.language,
      currency: this.currency,
      messageLimit: this.messageLimit,
      blocklist: this.blocklist,
      welcomeMessages: this.welcomeMessages,
      wipMessages: this.wipMessages,
      challengeStatus: this.challengeStatus,
      isActive: this.isActive,
      isDelete: this.isDelete,
      url: this.url,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
