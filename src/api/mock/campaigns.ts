import { getDatabase, saveDatabase, getSession } from './storage';
import { addAuditEvent } from './audit';
import type { Campaign, CampaignFormData } from '../../types';

export const mockCampaignsApi = {
  list: async (): Promise<Campaign[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const db = getDatabase();
    return [...db.campaigns];
  },

  getById: async (id: number): Promise<Campaign> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const db = getDatabase();
    const campaign = db.campaigns.find((c) => c.id === id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    return campaign;
  },

  create: async (data: CampaignFormData): Promise<Campaign> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const db = getDatabase();
    const session = getSession();
    const now = Math.floor(Date.now() / 1000);

    const campaign: Campaign = {
      id: db.nextId.campaign++,
      advertiserId: data.advertiserId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget,
      budgetDaily: data.budgetDaily,
      price: data.price,
      pricingModel: data.pricingModel,
      spendStrategy: data.spendStrategy,
      frequencyCapStrategy: data.frequencyCapStrategy,
      frequencyCap: data.frequencyCap,
      priority: data.priority,
      weight: data.weight,
      overdeliveryRatio: data.overdeliveryRatio,
      locationsMode: data.locationsMode,
      locations: data.locations,
      restaurantTypesMode: data.restaurantTypesMode,
      restaurantTypes: data.restaurantTypes,
      menuTypesMode: data.menuTypesMode,
      menuTypes: data.menuTypes,
      placements: data.placements,
      targets: data.targets || [],
      blocked: data.blocked,
      createdAt: now,
      updatedAt: now,
    };

    db.campaigns.push(campaign);
    saveDatabase(db);

    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'create',
        entityType: 'campaign',
        entityId: campaign.id,
        entityLabel: campaign.name,
      });
    }

    return campaign;
  },

  update: async (id: number, data: CampaignFormData): Promise<Campaign> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const db = getDatabase();
    const session = getSession();
    const index = db.campaigns.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error('Campaign not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const campaign: Campaign = {
      ...db.campaigns[index],
      advertiserId: data.advertiserId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget,
      budgetDaily: data.budgetDaily,
      price: data.price,
      pricingModel: data.pricingModel,
      spendStrategy: data.spendStrategy,
      frequencyCapStrategy: data.frequencyCapStrategy,
      frequencyCap: data.frequencyCap,
      priority: data.priority,
      weight: data.weight,
      overdeliveryRatio: data.overdeliveryRatio,
      locationsMode: data.locationsMode,
      locations: data.locations,
      restaurantTypesMode: data.restaurantTypesMode,
      restaurantTypes: data.restaurantTypes,
      menuTypesMode: data.menuTypesMode,
      menuTypes: data.menuTypes,
      placements: data.placements,
      targets: data.targets || [],
      blocked: data.blocked,
      updatedAt: now,
    };

    db.campaigns[index] = campaign;
    saveDatabase(db);

    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: 'update',
        entityType: 'campaign',
        entityId: campaign.id,
        entityLabel: campaign.name,
      });
    }

    return campaign;
  },

  block: async (id: number, blocked: boolean): Promise<Campaign> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const db = getDatabase();
    const session = getSession();
    const index = db.campaigns.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error('Campaign not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const campaign = {
      ...db.campaigns[index],
      blocked,
      updatedAt: now,
    };

    db.campaigns[index] = campaign;
    saveDatabase(db);

    if (session) {
      addAuditEvent({
        actorId: session.id,
        actorName: `${session.firstName} ${session.lastName}`,
        action: blocked ? 'block' : 'unblock',
        entityType: 'campaign',
        entityId: campaign.id,
        entityLabel: campaign.name,
      });
    }

    return campaign;
  },
};
