import { Entity } from './entity';

export interface UserProps {
  id?: string;
  email: string;
  password?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  workspaceId?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export class User extends Entity<UserProps> {
  get id(): string {
    return this.props.id || '';
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string | undefined {
    return this.props.password;
  }

  get name(): string | undefined {
    if (this.props.name) return this.props.name;
    
    // Se non c'è un name esplicito, lo costruiamo da firstName e lastName
    const firstName = this.props.firstName || '';
    const lastName = this.props.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || undefined;
  }

  get firstName(): string | undefined {
    return this.props.firstName;
  }

  get lastName(): string | undefined {
    return this.props.lastName;
  }

  get status(): string {
    return this.props.status || 'ACTIVE';
  }

  get workspaceId(): string | undefined {
    return this.props.workspaceId;
  }

  get role(): string | undefined {
    return this.props.role;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get lastLogin(): Date | undefined {
    return this.props.lastLogin;
  }

  isVerified(): boolean {
    return this.status === 'ACTIVE';
  }

  static create(props: UserProps): User {
    // Validations
    if (!props.email || props.email.trim().length === 0) {
      throw new Error('User email is required');
    }

    if (!this.isValidEmail(props.email)) {
      throw new Error('Invalid email format');
    }

    return new User(props);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 