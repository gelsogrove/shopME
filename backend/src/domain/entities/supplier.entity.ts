import { v4 as uuidv4 } from 'uuid';

export interface SupplierProps {
  id?: string;
  name: string;
  description?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  workspaceId: string;
  slug?: string;
}

export class Supplier {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly address?: string;
  readonly website?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly contactPerson?: string;
  readonly notes?: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly workspaceId: string;
  readonly slug: string;

  constructor(props: SupplierProps) {
    this.id = props.id || uuidv4();
    this.name = props.name;
    this.description = props.description;
    this.address = props.address;
    this.website = props.website;
    this.phone = props.phone;
    this.email = props.email;
    this.contactPerson = props.contactPerson;
    this.notes = props.notes;
    this.isActive = props.isActive !== undefined ? props.isActive : true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.workspaceId = props.workspaceId;
    this.slug = props.slug || this.generateSlug(props.name);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
} 