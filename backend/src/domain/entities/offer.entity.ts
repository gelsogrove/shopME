/**
 * Offer entity representing a discount offer in the system
 */
export class Offer {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  categoryId: string | null;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  categoryName?: string;

  constructor(data: Partial<Offer>) {
    Object.assign(this, data);
  }

  /**
   * Check if the offer is currently valid based on dates
   */
  isCurrentlyValid(): boolean {
    const now = new Date();
    return this.isActive && 
           this.startDate <= now && 
           this.endDate >= now;
  }

  /**
   * Get the status of the offer
   */
  getStatus(): 'active' | 'inactive' | 'scheduled' | 'expired' {
    const now = new Date();
    
    if (!this.isActive) {
      return 'inactive';
    }
    
    if (this.startDate <= now && this.endDate >= now) {
      return 'active';
    }
    
    if (this.startDate > now) {
      return 'scheduled';
    }
    
    return 'expired';
  }
} 