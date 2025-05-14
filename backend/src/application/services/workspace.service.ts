import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Workspace, WorkspaceProps } from '../../domain/entities/workspace.entity';
import { WorkspaceRepositoryInterface } from '../../domain/repositories/workspace.repository.interface';
import { WorkspaceRepository } from '../../repositories/workspace.repository';
import logger from '../../utils/logger';

export class WorkspaceService {
  private repository: WorkspaceRepositoryInterface;

  constructor(prisma?: PrismaClient) {
    this.repository = new WorkspaceRepository(prisma);
  }

  /**
   * Generate a slug from a name
   * @private
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Get all workspaces
   */
  async getAll(): Promise<Workspace[]> {
    logger.info('Getting all workspaces');
    return this.repository.findAll();
  }

  /**
   * Get a workspace by ID
   */
  async getById(id: string): Promise<Workspace | null> {
    logger.info(`Getting workspace by ID: ${id}`);
    return this.repository.findById(id);
  }

  /**
   * Find a workspace by slug
   */
  async getBySlug(slug: string): Promise<Workspace | null> {
    logger.info(`Getting workspace by slug: ${slug}`);
    return this.repository.findBySlug(slug);
  }

  /**
   * Create a new workspace
   */
  async create(data: WorkspaceProps): Promise<Workspace> {
    logger.info('Creating new workspace');
    
    // Generate a slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(data.name);
    }
    
    // Check if workspace with same slug exists
    const existingWorkspace = await this.repository.findBySlug(data.slug);
    if (existingWorkspace) {
      throw new Error(`Workspace with name "${data.name}" already exists`);
    }
    
    // Generate UUID if not provided
    if (!data.id) {
      data.id = randomUUID();
    }
    
    // Create workspace entity
    const workspace = Workspace.create(data);
    
    // Save to repository
    return this.repository.create(workspace);
  }

  /**
   * Update a workspace
   */
  async update(id: string, data: Partial<WorkspaceProps>): Promise<Workspace | null> {
    logger.info(`Updating workspace with ID: ${id}`);
    
    // Generate slug if name is updated and slug is not provided
    if (data.name && !data.slug) {
      data.slug = this.generateSlug(data.name);
      
      // Check for slug uniqueness if it has changed
      const existingWorkspace = await this.repository.findBySlug(data.slug);
      if (existingWorkspace && existingWorkspace.id !== id) {
        throw new Error(`Workspace with name "${data.name}" already exists`);
      }
    }
    
    return this.repository.update(id, data);
  }

  /**
   * Delete a workspace
   */
  async delete(id: string): Promise<boolean> {
    logger.info(`Deleting workspace with ID: ${id}`);
    return this.repository.delete(id);
  }

  /**
   * Get workspaces for a user
   */
  async getWorkspacesForUser(userId: string): Promise<Workspace[]> {
    logger.info(`Getting workspaces for user: ${userId}`);
    return this.repository.findByUserId(userId);
  }
} 