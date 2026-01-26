const STORAGE_KEY = 'trio_admin_mock_db';
const SESSION_KEY = 'trio_admin_session';

export interface MockDatabase {
  employees: any[];
  restaurants: any[];
  qrCodes: any[];
  advertisers: any[];
  campaigns: any[];
  creatives: any[];
  schedules: any[];
  dictionaries: {
    'restaurant-types': any[];
    'price-segments': any[];
    'menu-types': any[];
    'integration-types': any[];
    'placements': any[];
    countries: any[];
    cities: any[];
    districts: any[];
  };
  auditEvents: any[];
  users: any[];
  nextId: {
    employee: number;
    restaurant: number;
    qr: number;
    dictionary: number;
    audit: number;
    advertiser: number;
    campaign: number;
    creative: number;
    schedule: number;
  };
}

export const getDatabase = (): MockDatabase => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const db = JSON.parse(stored);
    // Migrate: ensure all dictionaries exist
    if (!db.dictionaries['placements']) {
      const now = Math.floor(Date.now() / 1000);
      db.dictionaries['placements'] = [
        { id: db.nextId.dictionary++, name: 'Indoor', rotation: 30, refreshTtl: 300, noAdjacentSameAdvertiser: false, blocked: false, createdAt: now, updatedAt: now },
        { id: db.nextId.dictionary++, name: 'Outdoor', rotation: 60, refreshTtl: 600, noAdjacentSameAdvertiser: true, blocked: false, createdAt: now, updatedAt: now },
        { id: db.nextId.dictionary++, name: 'Terrace', rotation: 45, refreshTtl: 450, noAdjacentSameAdvertiser: false, blocked: false, createdAt: now, updatedAt: now },
        { id: db.nextId.dictionary++, name: 'VIP Room', rotation: 90, refreshTtl: 900, noAdjacentSameAdvertiser: true, blocked: false, createdAt: now, updatedAt: now },
        { id: db.nextId.dictionary++, name: 'Bar Area', rotation: 30, refreshTtl: 300, noAdjacentSameAdvertiser: false, blocked: false, createdAt: now, updatedAt: now },
      ];
      saveDatabase(db);
    }
    // Migrate: add placement fields to existing placements
    if (db.dictionaries['placements'] && db.dictionaries['placements'].length > 0) {
      let needsSave = false;
      db.dictionaries['placements'] = db.dictionaries['placements'].map((p: any) => {
        if (!('rotation' in p)) {
          needsSave = true;
          return { ...p, rotation: 30, refreshTtl: 300, noAdjacentSameAdvertiser: false };
        }
        return p;
      });
      if (needsSave) saveDatabase(db);
    }
    // Migrate: add new fields to existing campaigns
    if (db.campaigns && db.campaigns.length > 0) {
      let needsSave = false;
      db.campaigns = db.campaigns.map((c: any) => {
        const updated: any = { ...c };
        if (!('budgetDaily' in c)) {
          needsSave = true;
          updated.budgetDaily = Math.floor(c.budget / 30); // Default: budget / 30 days
          updated.price = 0;
          updated.pricingModel = 'CPM';
          updated.spendStrategy = 'even';
          updated.frequencyCapStrategy = 'soft';
          updated.frequencyCap = {
            per_user: {
              impressions: { count: 3, window_sec: 3600 },
              clicks: { count: 1, window_sec: 3600 },
            },
            per_session: {
              impressions: { count: 1, window_sec: 900 },
              clicks: { count: 1, window_sec: 3600 },
            },
          };
          updated.priority = 1;
          updated.weight = 1;
          updated.overdeliveryRatio = 10;
        }
        return updated;
      });
      if (needsSave) saveDatabase(db);
    }
    // Migrate: ensure advertisement entities exist
    if (!db.advertisers) {
      db.advertisers = [];
      db.campaigns = [];
      db.creatives = [];
      db.nextId.advertiser = 1;
      db.nextId.campaign = 1;
      db.nextId.creative = 1;
    }
    
    // Migrate: ensure schedules exist
    if (!db.schedules) {
      db.schedules = [];
      db.nextId.schedule = 1;
    }
    
    // Migrate: seed schedules if empty
    if (db.schedules.length === 0) {
      const now = Math.floor(Date.now() / 1000);
      db.schedules = [
        {
          id: db.nextId.schedule++,
          name: 'Breakfast',
          color: '#18251f',
          weekSchedule: [
            { day: 'Mon' as const, enabled: true, startTime: '00:00', endTime: '23:00' },
            { day: 'Tue' as const, enabled: true, startTime: '04:00', endTime: '02:00' },
            { day: 'Wed' as const, enabled: true, startTime: '04:00', endTime: '08:00' },
            { day: 'Thu' as const, enabled: true, startTime: '04:00', endTime: '08:00' },
            { day: 'Fri' as const, enabled: true, startTime: '04:00', endTime: '08:00' },
            { day: 'Sat' as const, enabled: true, startTime: '04:00', endTime: '09:00' },
            { day: 'Sun' as const, enabled: true, startTime: '04:00', endTime: '09:00' },
          ],
          blocked: false,
          createdAt: now - 86400 * 30,
          updatedAt: now - 86400 * 5,
        },
        {
          id: db.nextId.schedule++,
          name: 'Lunch',
          color: '#000000',
          weekSchedule: [
            { day: 'Mon' as const, enabled: true, startTime: '07:00', endTime: '11:00' },
            { day: 'Tue' as const, enabled: true, startTime: '07:00', endTime: '11:00' },
            { day: 'Wed' as const, enabled: true, startTime: '07:00', endTime: '11:00' },
            { day: 'Thu' as const, enabled: true, startTime: '07:00', endTime: '11:00' },
            { day: 'Fri' as const, enabled: true, startTime: '07:00', endTime: '11:00' },
            { day: 'Sat' as const, enabled: true, startTime: '07:00', endTime: '11:00' },
            { day: 'Sun' as const, enabled: true, startTime: '07:00', endTime: '12:00' },
          ],
          blocked: false,
          createdAt: now - 86400 * 28,
          updatedAt: now - 86400 * 3,
        },
        {
          id: db.nextId.schedule++,
          name: 'Dinner',
          color: '#c80815',
          weekSchedule: [
            { day: 'Mon' as const, enabled: true, startTime: '00:00', endTime: '23:59' },
            { day: 'Tue' as const, enabled: true, startTime: '00:00', endTime: '23:59' },
            { day: 'Wed' as const, enabled: true, startTime: '00:00', endTime: '23:59' },
            { day: 'Thu' as const, enabled: true, startTime: '00:00', endTime: '23:59' },
            { day: 'Fri' as const, enabled: true, startTime: '00:00', endTime: '23:59' },
            { day: 'Sat' as const, enabled: true, startTime: '00:00', endTime: '23:59' },
            { day: 'Sun' as const, enabled: true, startTime: '00:00', endTime: '23:59' },
          ],
          blocked: false,
          createdAt: now - 86400 * 25,
          updatedAt: now - 86400 * 1,
        },
      ];
      saveDatabase(db);
    }
    
    // Migrate: seed advertisement data if empty
    if (db.advertisers.length === 0) {
      const now = Math.floor(Date.now() / 1000);
      
      // Seed advertisers
      const advertiser1 = {
        id: db.nextId.advertiser++,
        name: 'TechCorp Solutions',
        tin: '1234567890',
        blocked: false,
        createdAt: now - 86400 * 60,
        updatedAt: now - 86400 * 10,
      };

      const advertiser2 = {
        id: db.nextId.advertiser++,
        name: 'Global Foods LLC',
        tin: '0987654321',
        blocked: false,
        createdAt: now - 86400 * 45,
        updatedAt: now - 86400 * 5,
      };

      const advertiser3 = {
        id: db.nextId.advertiser++,
        name: 'Digital Marketing Pro',
        tin: '5555123456',
        blocked: false,
        createdAt: now - 86400 * 35,
        updatedAt: now - 86400 * 2,
      };

      const advertiser4 = {
        id: db.nextId.advertiser++,
        name: 'Restaurant Chain Ads',
        tin: '7778889999',
        blocked: false,
        createdAt: now - 86400 * 25,
        updatedAt: now - 86400 * 1,
      };

      const advertiser5 = {
        id: db.nextId.advertiser++,
        name: 'Local Business Hub',
        tin: '3334445555',
        blocked: true,
        createdAt: now - 86400 * 90,
        updatedAt: now - 86400 * 20,
      };

      db.advertisers = [advertiser1, advertiser2, advertiser3, advertiser4, advertiser5];

      // Seed campaigns
      const campaign1 = {
        id: db.nextId.campaign++,
        advertiserId: advertiser1.id,
        name: 'Summer Tech Promo',
        startDate: now - 86400 * 30,
        endDate: now + 86400 * 60,
        budget: 50000,
        budgetDaily: 1500,
        price: 2.5,
        pricingModel: 'CPM' as const,
        spendStrategy: 'even' as const,
        frequencyCapStrategy: 'soft' as const,
        frequencyCap: {
          per_user: {
            impressions: { count: 3, window_sec: 3600 },
            clicks: { count: 1, window_sec: 3600 },
          },
          per_session: {
            impressions: { count: 1, window_sec: 900 },
            clicks: { count: 1, window_sec: 3600 },
          },
        },
        priority: 1,
        weight: 1,
        overdeliveryRatio: 10,
        locationsMode: 'allowed' as const,
        locations: [],
        restaurantTypesMode: 'allowed' as const,
        restaurantTypes: db.dictionaries['restaurant-types']?.length > 0 ? [db.dictionaries['restaurant-types'][0].id] : [],
        menuTypesMode: 'allowed' as const,
        menuTypes: [],
        placements: db.dictionaries['placements']?.length > 1 ? [db.dictionaries['placements'][0].id, db.dictionaries['placements'][1].id] : [],
        targets: [],
        blocked: false,
        createdAt: now - 86400 * 30,
        updatedAt: now - 86400 * 5,
      };

      const campaign2 = {
        id: db.nextId.campaign++,
        advertiserId: advertiser2.id,
        name: 'Food Festival 2026',
        startDate: now - 86400 * 15,
        endDate: now + 86400 * 45,
        budget: 75000,
        budgetDaily: 2000,
        price: 0.75,
        pricingModel: 'CPC' as const,
        spendStrategy: 'frontload' as const,
        frequencyCapStrategy: 'strict' as const,
        frequencyCap: {
          per_user: {
            impressions: { count: 5, window_sec: 7200 },
            clicks: { count: 2, window_sec: 7200 },
          },
          per_session: {
            impressions: { count: 2, window_sec: 1800 },
            clicks: { count: 1, window_sec: 1800 },
          },
        },
        priority: 2,
        weight: 2,
        overdeliveryRatio: 15,
        locationsMode: 'denied' as const,
        locations: db.dictionaries.districts?.length > 5 ? [db.dictionaries.districts[5].id] : [],
        restaurantTypesMode: 'allowed' as const,
        restaurantTypes: [],
        menuTypesMode: 'allowed' as const,
        menuTypes: db.dictionaries['menu-types']?.length > 0 ? [db.dictionaries['menu-types'][0].id] : [],
        placements: [],
        targets: [],
        blocked: false,
        createdAt: now - 86400 * 15,
        updatedAt: now - 86400 * 3,
      };

      const campaign3 = {
        id: db.nextId.campaign++,
        advertiserId: advertiser3.id,
        name: 'Spring Menu Launch',
        startDate: now - 86400 * 10,
        endDate: now + 86400 * 30,
        budget: 35000,
        budgetDaily: 1000,
        price: 0.05,
        pricingModel: 'CPV' as const,
        spendStrategy: 'asap' as const,
        frequencyCapStrategy: 'soft' as const,
        frequencyCap: {
          per_user: {
            impressions: { count: 4, window_sec: 3600 },
            clicks: { count: 2, window_sec: 3600 },
          },
          per_session: {
            impressions: { count: 2, window_sec: 900 },
            clicks: { count: 1, window_sec: 900 },
          },
        },
        priority: 3,
        weight: 1,
        overdeliveryRatio: 5,
        locationsMode: 'allowed' as const,
        locations: [],
        restaurantTypesMode: 'denied' as const,
        restaurantTypes: db.dictionaries['restaurant-types']?.length > 2 ? [db.dictionaries['restaurant-types'][1].id, db.dictionaries['restaurant-types'][2].id] : [],
        menuTypesMode: 'allowed' as const,
        menuTypes: db.dictionaries['menu-types']?.length > 1 ? [db.dictionaries['menu-types'][0].id, db.dictionaries['menu-types'][1].id] : [],
        placements: db.dictionaries['placements']?.length > 0 ? [db.dictionaries['placements'][0].id] : [],
        targets: [],
        blocked: false,
        createdAt: now - 86400 * 10,
        updatedAt: now - 86400 * 2,
      };

      const campaign4 = {
        id: db.nextId.campaign++,
        advertiserId: advertiser4.id,
        name: 'Weekend Special Offers',
        startDate: now - 86400 * 5,
        endDate: now + 86400 * 90,
        budget: 120000,
        budgetDaily: 3000,
        price: 15.0,
        pricingModel: 'CPA' as const,
        spendStrategy: 'even' as const,
        frequencyCapStrategy: 'strict' as const,
        frequencyCap: {
          per_user: {
            impressions: { count: 10, window_sec: 86400 },
            clicks: { count: 3, window_sec: 86400 },
          },
          per_session: {
            impressions: { count: 3, window_sec: 1800 },
            clicks: { count: 2, window_sec: 1800 },
          },
        },
        priority: 1,
        weight: 3,
        overdeliveryRatio: 20,
        locationsMode: 'allowed' as const,
        locations: db.dictionaries.districts?.length > 1 ? [db.dictionaries.districts[0].id, db.dictionaries.districts[1].id] : [],
        restaurantTypesMode: 'allowed' as const,
        restaurantTypes: [],
        menuTypesMode: 'allowed' as const,
        menuTypes: [],
        placements: db.dictionaries['placements']?.length > 3 ? [db.dictionaries['placements'][2].id, db.dictionaries['placements'][3].id] : [],
        targets: [],
        blocked: false,
        createdAt: now - 86400 * 5,
        updatedAt: now - 86400 * 1,
      };

      const campaign5 = {
        id: db.nextId.campaign++,
        advertiserId: advertiser5.id,
        name: 'Holiday Campaign 2025',
        startDate: now - 86400 * 120,
        endDate: now - 86400 * 20,
        budget: 85000,
        budgetDaily: 2500,
        price: 3.0,
        pricingModel: 'CPM' as const,
        spendStrategy: 'frontload' as const,
        frequencyCapStrategy: 'soft' as const,
        frequencyCap: {
          per_user: {
            impressions: { count: 3, window_sec: 3600 },
            clicks: { count: 1, window_sec: 3600 },
          },
          per_session: {
            impressions: { count: 1, window_sec: 900 },
            clicks: { count: 1, window_sec: 3600 },
          },
        },
        priority: 2,
        weight: 1,
        overdeliveryRatio: 0,
        locationsMode: 'allowed' as const,
        locations: [],
        restaurantTypesMode: 'allowed' as const,
        restaurantTypes: db.dictionaries['restaurant-types']?.length > 0 ? [db.dictionaries['restaurant-types'][0].id] : [],
        menuTypesMode: 'allowed' as const,
        menuTypes: [],
        placements: [],
        targets: [],
        blocked: true,
        createdAt: now - 86400 * 120,
        updatedAt: now - 86400 * 20,
      };

      db.campaigns = [campaign1, campaign2, campaign3, campaign4, campaign5];

      // Seed creatives
      db.creatives = [
        {
          id: db.nextId.creative++,
          campaignId: campaign1.id,
          name: 'Tech Banner 1920x1080',
          minHeight: 600,
          maxHeight: 1080,
          minWidth: 800,
          maxWidth: 1920,
          dataUrl: 'https://via.placeholder.com/800x600/0066cc/ffffff?text=Summer+Tech+Promo',
          blocked: false,
          createdAt: now - 86400 * 28,
          updatedAt: now - 86400 * 28,
        },
        {
          id: db.nextId.creative++,
          campaignId: campaign1.id,
          name: 'Tech Banner Mobile',
          minHeight: 600,
          maxHeight: 900,
          minWidth: 400,
          maxWidth: 600,
          dataUrl: 'https://via.placeholder.com/400x600/0066cc/ffffff?text=Tech+Mobile',
          blocked: false,
          createdAt: now - 86400 * 27,
          updatedAt: now - 86400 * 27,
        },
        {
          id: db.nextId.creative++,
          campaignId: campaign2.id,
          name: 'Food Festival HD',
          minHeight: 768,
          maxHeight: 1080,
          minWidth: 1024,
          maxWidth: 1920,
          dataUrl: 'https://via.placeholder.com/1024x768/ff6600/ffffff?text=Food+Festival+2026',
          blocked: false,
          createdAt: now - 86400 * 14,
          updatedAt: now - 86400 * 14,
        },
        {
          id: db.nextId.creative++,
          campaignId: campaign3.id,
          name: 'Spring Menu Portrait',
          minHeight: 1024,
          maxHeight: 1366,
          minWidth: 768,
          maxWidth: 1024,
          dataUrl: 'https://via.placeholder.com/768x1024/33cc33/ffffff?text=Spring+Menu',
          blocked: false,
          createdAt: now - 86400 * 9,
          updatedAt: now - 86400 * 9,
        },
        {
          id: db.nextId.creative++,
          campaignId: campaign3.id,
          name: 'Spring Menu Landscape',
          minHeight: 720,
          maxHeight: 1080,
          minWidth: 1280,
          maxWidth: 1920,
          dataUrl: 'https://via.placeholder.com/1280x720/33cc33/ffffff?text=Spring+Landscape',
          blocked: false,
          createdAt: now - 86400 * 8,
          updatedAt: now - 86400 * 8,
        },
        {
          id: db.nextId.creative++,
          campaignId: campaign4.id,
          name: 'Weekend Offers Wide',
          minHeight: 1080,
          maxHeight: 2160,
          minWidth: 1920,
          maxWidth: 3840,
          dataUrl: 'https://via.placeholder.com/1920x1080/ff33cc/ffffff?text=Weekend+Offers',
          blocked: false,
          createdAt: now - 86400 * 4,
          updatedAt: now - 86400 * 4,
        },
        {
          id: db.nextId.creative++,
          campaignId: campaign5.id,
          name: 'Holiday 2025 Banner',
          minHeight: 600,
          maxHeight: 1080,
          minWidth: 800,
          maxWidth: 1920,
          dataUrl: 'https://via.placeholder.com/800x600/cc0000/ffffff?text=Holiday+2025',
          blocked: true,
          createdAt: now - 86400 * 119,
          updatedAt: now - 86400 * 20,
        },
      ];
      
      saveDatabase(db);
    }
    
    return db;
  }
  return initializeDatabase();
};

export const saveDatabase = (db: MockDatabase): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const getSession = (): any => {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveSession = (user: any): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

const initializeDatabase = (): MockDatabase => {
  const now = Math.floor(Date.now() / 1000);

  const db: MockDatabase = {
    employees: [],
    restaurants: [],
    qrCodes: [],
    advertisers: [],
    campaigns: [],
    creatives: [],
    schedules: [],
    dictionaries: {
      'restaurant-types': [],
      'price-segments': [],
      'menu-types': [],
      'integration-types': [],
      'placements': [],
      countries: [],
      cities: [],
      districts: [],
    },
    auditEvents: [],
    users: [
      {
        id: 1,
        username: 'admin',
        password: 'admin123', // In production, this would be hashed
        firstName: 'Admin',
        lastName: 'User',
      },
    ],
    nextId: {
      employee: 1,
      restaurant: 1,
      qr: 1,
      dictionary: 1,
      audit: 1,
      advertiser: 1,
      campaign: 1,
      creative: 1,
      schedule: 1,
    },
  };

  // Seed restaurant types
  db.dictionaries['restaurant-types'] = [
    { id: db.nextId.dictionary++, name: 'Fast Food', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Casual Dining', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Fine Dining', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Cafe', blocked: false, createdAt: now, updatedAt: now },
  ];

  // Seed price segments
  db.dictionaries['price-segments'] = [
    { id: db.nextId.dictionary++, name: 'Budget', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Mid-Range', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Premium', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Luxury', blocked: false, createdAt: now, updatedAt: now },
  ];

  // Seed menu types
  db.dictionaries['menu-types'] = [
    { id: db.nextId.dictionary++, name: 'Digital', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Paper', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Hybrid', blocked: false, createdAt: now, updatedAt: now },
  ];

  // Seed integration types
  db.dictionaries['integration-types'] = [
    { id: db.nextId.dictionary++, name: 'REST API', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'SOAP', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Direct DB', blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'File Sync', blocked: false, createdAt: now, updatedAt: now },
  ];

  // Seed ads slots
  db.dictionaries['placements'] = [
    { id: db.nextId.dictionary++, name: 'Indoor', rotation: 30, refreshTtl: 300, noAdjacentSameAdvertiser: false, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Outdoor', rotation: 60, refreshTtl: 600, noAdjacentSameAdvertiser: true, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Terrace', rotation: 45, refreshTtl: 450, noAdjacentSameAdvertiser: false, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'VIP Room', rotation: 90, refreshTtl: 900, noAdjacentSameAdvertiser: true, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Bar Area', rotation: 30, refreshTtl: 300, noAdjacentSameAdvertiser: false, blocked: false, createdAt: now, updatedAt: now },
  ];

  // Seed countries
  const armenia = { id: db.nextId.dictionary++, name: 'Հայաստան', blocked: false, createdAt: now, updatedAt: now };
  db.dictionaries.countries = [armenia];

  // Seed cities
  const yerevan = { id: db.nextId.dictionary++, name: 'Երևան', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const aragatsotn = { id: db.nextId.dictionary++, name: 'Արագածոտն', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const ararat = { id: db.nextId.dictionary++, name: 'Արարատ', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const armavir = { id: db.nextId.dictionary++, name: 'Արմավիր', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const gegharkunik = { id: db.nextId.dictionary++, name: 'Գեղարքունիք', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const lori = { id: db.nextId.dictionary++, name: 'Լոռի', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const kotayk = { id: db.nextId.dictionary++, name: 'Կոտայք', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const shirak = { id: db.nextId.dictionary++, name: 'Շիրակ', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const syunik = { id: db.nextId.dictionary++, name: 'Սյունիք', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const vayotsDzor = { id: db.nextId.dictionary++, name: 'Վայոց ձոր', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };
  const tavush = { id: db.nextId.dictionary++, name: 'Տավուշ', countryId: armenia.id, blocked: false, createdAt: now, updatedAt: now };

  db.dictionaries.cities = [yerevan, aragatsotn, ararat, armavir, gegharkunik, lori, kotayk, shirak, syunik, vayotsDzor, tavush];

  // Seed districts
  db.dictionaries.districts = [
    // Երևան districts
    { id: db.nextId.dictionary++, name: 'Աջափնյակ', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ավան', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Արաբկիր', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Դավթաշեն', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Էրեբունի', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Կենտրոն', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Մալաթիա-Սեբաստիա', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Նոր Նորք', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Նորք-Մարաշ', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Նուբարաշեն', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Շենգավիթ', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Քանաքեռ-Զեյթուն', cityId: yerevan.id, blocked: false, createdAt: now, updatedAt: now },

    // Արագածոտն districts
    { id: db.nextId.dictionary++, name: 'Ալագյազ', cityId: aragatsotn.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Աշտարակ', cityId: aragatsotn.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ապարան', cityId: aragatsotn.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Արևուտ', cityId: aragatsotn.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Թալին', cityId: aragatsotn.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ծաղկահովիտ', cityId: aragatsotn.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Մեծաձոր', cityId: aragatsotn.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Շամիրամ', cityId: aragatsotn.id, blocked: false, createdAt: now, updatedAt: now },

    // Արարատ districts
    { id: db.nextId.dictionary++, name: 'Արարատ', cityId: ararat.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Արտաշատ', cityId: ararat.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Մասիս', cityId: ararat.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Վեդի', cityId: ararat.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Վերին Դվին', cityId: ararat.id, blocked: false, createdAt: now, updatedAt: now },

    // Արմավիր districts
    { id: db.nextId.dictionary++, name: 'Արաքս', cityId: armavir.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Արմավիր', cityId: armavir.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Բաղրամյան', cityId: armavir.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Մեծամոր', cityId: armavir.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Վաղարշապատ', cityId: armavir.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Փարաքար', cityId: armavir.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ֆերիկ', cityId: armavir.id, blocked: false, createdAt: now, updatedAt: now },

    // Գեղարքունիք districts
    { id: db.nextId.dictionary++, name: 'Գավառ', cityId: gegharkunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ճամբարակ', cityId: gegharkunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Մարտունի', cityId: gegharkunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Սևան', cityId: gegharkunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Վարդենիս', cityId: gegharkunik.id, blocked: false, createdAt: now, updatedAt: now },

    // Լոռի districts
    { id: db.nextId.dictionary++, name: 'Ալավերդի', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Գյուլագարակ', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Թումանյան', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Լերմոնտովո', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Լոռի բերդ', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Սպիտակ', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ստեփանավան', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Վանաձոր', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Տաշիր', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Փամբակ', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ֆիոլետովո', cityId: lori.id, blocked: false, createdAt: now, updatedAt: now },

    // Կոտայք districts
    { id: db.nextId.dictionary++, name: 'Աբովյան', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ակունք', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Արզնի', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Բյուրեղավան', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Գառնի', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ծաղկաձոր', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Հրազդան', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Նաիրի', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Նոր Հաճն', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Չարենցավան', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ջրվեժ', cityId: kotayk.id, blocked: false, createdAt: now, updatedAt: now },

    // Շիրակ districts
    { id: db.nextId.dictionary++, name: 'Ախուրյան', cityId: shirak.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ամասիա', cityId: shirak.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Անի', cityId: shirak.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Աշոցք', cityId: shirak.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Արթիկ', cityId: shirak.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Գյումրի', cityId: shirak.id, blocked: false, createdAt: now, updatedAt: now },

    // Սյունիք districts
    { id: db.nextId.dictionary++, name: 'Գորիս', cityId: syunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Կապան', cityId: syunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Մեղրի', cityId: syunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Սիսիան', cityId: syunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Տաթև', cityId: syunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Տեղ', cityId: syunik.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Քաջարան', cityId: syunik.id, blocked: false, createdAt: now, updatedAt: now },

    // Վայոց ձոր districts
    { id: db.nextId.dictionary++, name: 'Արենի', cityId: vayotsDzor.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Եղեգիս', cityId: vayotsDzor.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Եղեգնաձոր', cityId: vayotsDzor.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Ջերմուկ', cityId: vayotsDzor.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Վայք', cityId: vayotsDzor.id, blocked: false, createdAt: now, updatedAt: now },

    // Տավուշ districts
    { id: db.nextId.dictionary++, name: 'Բերդ', cityId: tavush.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Դիլիջան', cityId: tavush.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Իջևան', cityId: tavush.id, blocked: false, createdAt: now, updatedAt: now },
    { id: db.nextId.dictionary++, name: 'Նոյեմբերյան', cityId: tavush.id, blocked: false, createdAt: now, updatedAt: now },
  ];

  // Seed employees
  db.employees = [
    {
      id: db.nextId.employee++,
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      password: 'password123',
      blocked: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: db.nextId.employee++,
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'jane.smith',
      password: 'password123',
      blocked: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: db.nextId.employee++,
      firstName: 'Mike',
      lastName: 'Johnson',
      username: 'mike.johnson',
      password: 'password123',
      blocked: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Seed restaurants
  const restaurant1 = {
    id: db.nextId.restaurant++,
    name: 'Ռեստորան Կենտրոն',
    crmUrl: 'https://crm.example.com/restaurant/1',
    countryId: armenia.id,
    cityId: yerevan.id,
    districtId: db.dictionaries.districts[5].id, // Կենտրոն
    address: 'Աբովյան փողոց 1, Երևան',
    lat: 40.1792,
    lng: 44.4991,
    typeId: [db.dictionaries['restaurant-types'][2].id], // Fine Dining
    priceSegmentId: [db.dictionaries['price-segments'][3].id], // Luxury
    menuTypeId: [db.dictionaries['menu-types'][0].id], // Digital
    integrationTypeId: db.dictionaries['integration-types'][0].id, // REST API
    adminEmail: 'admin@restaurant1.am',
    connectionData: {
      host: 'api.restaurant1.am',
      port: 443,
      username: 'api_user',
    },
    blocked: false,
    createdAt: now - 86400 * 30, // 30 days ago
    updatedAt: now - 86400 * 5,
    lastClientActivityAt: now - 3600, // 1 hour ago
    lastRestaurantActivityAt: now - 7200, // 2 hours ago
  };

  const restaurant2 = {
    id: db.nextId.restaurant++,
    name: 'Ռեստորան Արաբկիր',
    crmUrl: 'https://crm.example.com/restaurant/2',
    countryId: armenia.id,
    cityId: yerevan.id,
    districtId: db.dictionaries.districts[2].id, // Արաբկիր
    address: 'Կոմիտասի պողոտա 50, Երևան',
    lat: 40.2022,
    lng: 44.4923,
    typeId: [db.dictionaries['restaurant-types'][0].id], // Fast Food
    priceSegmentId: [db.dictionaries['price-segments'][0].id], // Budget
    menuTypeId: [db.dictionaries['menu-types'][2].id], // Hybrid
    integrationTypeId: db.dictionaries['integration-types'][2].id, // Direct DB
    adminEmail: 'admin@restaurant2.am',
    connectionData: {
      host: 'db.restaurant2.am',
      port: 5432,
      username: 'db_user',
    },
    blocked: false,
    createdAt: now - 86400 * 60, // 60 days ago
    updatedAt: now - 86400 * 2,
    lastClientActivityAt: now - 1800, // 30 min ago
    lastRestaurantActivityAt: now - 3600, // 1 hour ago
  };

  db.restaurants = [restaurant1, restaurant2];

  // Seed QR codes
  db.qrCodes = [
    {
      id: db.nextId.qr++,
      restaurantId: restaurant1.id,
      qrText: 'https://menu.trio.com/qr/GF-001',
      tableNumber: 'T1',
      blocked: false,
      createdAt: now - 86400 * 25,
      updatedAt: now - 86400 * 25,
    },
    {
      id: db.nextId.qr++,
      restaurantId: restaurant1.id,
      qrText: 'https://menu.trio.com/qr/GF-002',
      tableNumber: 'T2',
      blocked: false,
      createdAt: now - 86400 * 25,
      updatedAt: now - 86400 * 25,
    },
    {
      id: db.nextId.qr++,
      restaurantId: restaurant1.id,
      qrText: 'https://menu.trio.com/qr/GF-003',
      tableNumber: 'T3',
      blocked: false,
      createdAt: now - 86400 * 25,
      updatedAt: now - 86400 * 25,
    },
    {
      id: db.nextId.qr++,
      restaurantId: restaurant2.id,
      qrText: 'https://menu.trio.com/qr/QB-001',
      blocked: false,
      createdAt: now - 86400 * 55,
      updatedAt: now - 86400 * 55,
    },
    {
      id: db.nextId.qr++,
      restaurantId: restaurant2.id,
      qrText: 'https://menu.trio.com/qr/QB-002',
      blocked: false,
      createdAt: now - 86400 * 55,
      updatedAt: now - 86400 * 55,
    },
  ];

  // Seed advertisers
  const advertiser1 = {
    id: db.nextId.advertiser++,
    name: 'TechCorp Solutions',
    tin: '1234567890',
    blocked: false,
    createdAt: now - 86400 * 60,
    updatedAt: now - 86400 * 10,
  };

  const advertiser2 = {
    id: db.nextId.advertiser++,
    name: 'Global Foods LLC',
    tin: '0987654321',
    blocked: false,
    createdAt: now - 86400 * 45,
    updatedAt: now - 86400 * 5,
  };

  const advertiser3 = {
    id: db.nextId.advertiser++,
    name: 'Digital Marketing Pro',
    tin: '5555123456',
    blocked: false,
    createdAt: now - 86400 * 35,
    updatedAt: now - 86400 * 2,
  };

  const advertiser4 = {
    id: db.nextId.advertiser++,
    name: 'Restaurant Chain Ads',
    tin: '7778889999',
    blocked: false,
    createdAt: now - 86400 * 25,
    updatedAt: now - 86400 * 1,
  };

  const advertiser5 = {
    id: db.nextId.advertiser++,
    name: 'Local Business Hub',
    tin: '3334445555',
    blocked: true,
    createdAt: now - 86400 * 90,
    updatedAt: now - 86400 * 20,
  };

  db.advertisers = [advertiser1, advertiser2, advertiser3, advertiser4, advertiser5];

  // Seed campaigns
  const campaign1 = {
    id: db.nextId.campaign++,
    advertiserId: advertiser1.id,
    name: 'Summer Tech Promo',
    startDate: now - 86400 * 30,
    endDate: now + 86400 * 60,
    budget: 50000,
    budgetDaily: 1500,
    price: 2.5,
    pricingModel: 'CPM' as const,
    spendStrategy: 'even' as const,
    frequencyCapStrategy: 'soft' as const,
    frequencyCap: {
      per_user: {
        impressions: { count: 3, window_sec: 3600 },
        clicks: { count: 1, window_sec: 3600 },
      },
      per_session: {
        impressions: { count: 1, window_sec: 900 },
        clicks: { count: 1, window_sec: 3600 },
      },
    },
    priority: 1,
    weight: 1,
    overdeliveryRatio: 10,
    locationsMode: 'allowed' as const,
    locations: [], // All locations
    restaurantTypesMode: 'allowed' as const,
    restaurantTypes: [db.dictionaries['restaurant-types'][0].id], // Fast Food
    menuTypesMode: 'allowed' as const,
    menuTypes: [], // All menu types
    placements: [db.dictionaries['placements'][0].id, db.dictionaries['placements'][1].id], // Indoor, Outdoor (ads slots)
    targets: [],
    blocked: false,
    createdAt: now - 86400 * 30,
    updatedAt: now - 86400 * 5,
  };

  const campaign2 = {
    id: db.nextId.campaign++,
    advertiserId: advertiser2.id,
    name: 'Food Festival 2026',
    startDate: now - 86400 * 15,
    endDate: now + 86400 * 45,
    budget: 75000,
    budgetDaily: 2000,
    price: 0.75,
    pricingModel: 'CPC' as const,
    spendStrategy: 'frontload' as const,
    frequencyCapStrategy: 'strict' as const,
    frequencyCap: {
      per_user: {
        impressions: { count: 5, window_sec: 7200 },
        clicks: { count: 2, window_sec: 7200 },
      },
      per_session: {
        impressions: { count: 2, window_sec: 1800 },
        clicks: { count: 1, window_sec: 1800 },
      },
    },
    priority: 2,
    weight: 2,
    overdeliveryRatio: 15,
    locationsMode: 'denied' as const,
    locations: [db.dictionaries.districts[5].id], // Kentron district
    restaurantTypesMode: 'allowed' as const,
    restaurantTypes: [], // All restaurant types
    menuTypesMode: 'allowed' as const,
    menuTypes: [db.dictionaries['menu-types'][0].id], // Digital
    placements: [], // All ads slots
    targets: [],
    blocked: false,
    createdAt: now - 86400 * 15,
    updatedAt: now - 86400 * 3,
  };

  const campaign3 = {
    id: db.nextId.campaign++,
    advertiserId: advertiser3.id,
    name: 'Spring Menu Launch',
    startDate: now - 86400 * 10,
    endDate: now + 86400 * 30,
    budget: 35000,
    budgetDaily: 1000,
    price: 0.05,
    pricingModel: 'CPV' as const,
    spendStrategy: 'asap' as const,
    frequencyCapStrategy: 'soft' as const,
    frequencyCap: {
      per_user: {
        impressions: { count: 4, window_sec: 3600 },
        clicks: { count: 2, window_sec: 3600 },
      },
      per_session: {
        impressions: { count: 2, window_sec: 900 },
        clicks: { count: 1, window_sec: 900 },
      },
    },
    priority: 3,
    weight: 1,
    overdeliveryRatio: 5,
    locationsMode: 'allowed' as const,
    locations: [], // All locations
    restaurantTypesMode: 'denied' as const,
    restaurantTypes: [db.dictionaries['restaurant-types'][1].id, db.dictionaries['restaurant-types'][2].id], // Casual Dining, Fine Dining
    menuTypesMode: 'allowed' as const,
    menuTypes: [db.dictionaries['menu-types'][0].id, db.dictionaries['menu-types'][1].id], // Digital, QR
    placements: [db.dictionaries['placements'][0].id], // Indoor (ads slot)
    targets: [],
    blocked: false,
    createdAt: now - 86400 * 10,
    updatedAt: now - 86400 * 2,
  };

  const campaign4 = {
    id: db.nextId.campaign++,
    advertiserId: advertiser4.id,
    name: 'Weekend Special Offers',
    startDate: now - 86400 * 5,
    endDate: now + 86400 * 90,
    budget: 120000,
    budgetDaily: 3000,
    price: 15.0,
    pricingModel: 'CPA' as const,
    spendStrategy: 'even' as const,
    frequencyCapStrategy: 'strict' as const,
    frequencyCap: {
      per_user: {
        impressions: { count: 10, window_sec: 86400 },
        clicks: { count: 3, window_sec: 86400 },
      },
      per_session: {
        impressions: { count: 3, window_sec: 1800 },
        clicks: { count: 2, window_sec: 1800 },
      },
    },
    priority: 1,
    weight: 3,
    overdeliveryRatio: 20,
    locationsMode: 'allowed' as const,
    locations: [db.dictionaries.districts[0].id, db.dictionaries.districts[1].id], // Multiple districts
    restaurantTypesMode: 'allowed' as const,
    restaurantTypes: [], // All types
    menuTypesMode: 'allowed' as const,
    menuTypes: [], // All menu types
    placements: [db.dictionaries['placements'][2].id, db.dictionaries['placements'][3].id], // Terrace, VIP Room (ads slots)
    targets: [],
    blocked: false,
    createdAt: now - 86400 * 5,
    updatedAt: now - 86400 * 1,
  };

  const campaign5 = {
    id: db.nextId.campaign++,
    advertiserId: advertiser5.id,
    name: 'Holiday Campaign 2025',
    startDate: now - 86400 * 120,
    endDate: now - 86400 * 20,
    budget: 85000,
    budgetDaily: 2500,
    price: 3.0,
    pricingModel: 'CPM' as const,
    spendStrategy: 'frontload' as const,
    frequencyCapStrategy: 'soft' as const,
    frequencyCap: {
      per_user: {
        impressions: { count: 3, window_sec: 3600 },
        clicks: { count: 1, window_sec: 3600 },
      },
      per_session: {
        impressions: { count: 1, window_sec: 900 },
        clicks: { count: 1, window_sec: 3600 },
      },
    },
    priority: 2,
    weight: 1,
    overdeliveryRatio: 0,
    locationsMode: 'allowed' as const,
    locations: [], // All locations
    restaurantTypesMode: 'allowed' as const,
    restaurantTypes: [db.dictionaries['restaurant-types'][0].id], // Fast Food
    menuTypesMode: 'allowed' as const,
    menuTypes: [], // All menu types
    placements: [], // All ads slots
    targets: [],
    blocked: true,
    createdAt: now - 86400 * 120,
    updatedAt: now - 86400 * 20,
  };

  db.campaigns = [campaign1, campaign2, campaign3, campaign4, campaign5];

  // Seed creatives
  db.creatives = [
    {
      id: db.nextId.creative++,
      campaignId: campaign1.id,
      name: 'Tech Banner 1920x1080',
      minHeight: 600,
      maxHeight: 1080,
      minWidth: 800,
      maxWidth: 1920,
      dataUrl: 'https://via.placeholder.com/800x600/0066cc/ffffff?text=Summer+Tech+Promo',
      previewWidth: 400,
      previewHeight: 300,
      blocked: false,
      createdAt: now - 86400 * 28,
      updatedAt: now - 86400 * 28,
    },
    {
      id: db.nextId.creative++,
      campaignId: campaign1.id,
      name: 'Tech Banner Mobile',
      minHeight: 600,
      maxHeight: 900,
      minWidth: 400,
      maxWidth: 600,
      dataUrl: 'https://via.placeholder.com/400x600/0066cc/ffffff?text=Tech+Mobile',
      previewWidth: 200,
      previewHeight: 300,
      blocked: false,
      createdAt: now - 86400 * 27,
      updatedAt: now - 86400 * 27,
    },
    {
      id: db.nextId.creative++,
      campaignId: campaign2.id,
      name: 'Food Festival HD',
      minHeight: 768,
      maxHeight: 1080,
      minWidth: 1024,
      maxWidth: 1920,
      dataUrl: 'https://via.placeholder.com/1024x768/ff6600/ffffff?text=Food+Festival+2026',
      previewWidth: 400,
      previewHeight: 300,
      blocked: false,
      createdAt: now - 86400 * 14,
      updatedAt: now - 86400 * 14,
    },
    {
      id: db.nextId.creative++,
      campaignId: campaign3.id,
      name: 'Spring Menu Portrait',
      minHeight: 1024,
      maxHeight: 1366,
      minWidth: 768,
      maxWidth: 1024,
      dataUrl: 'https://via.placeholder.com/768x1024/33cc33/ffffff?text=Spring+Menu',
      previewWidth: 240,
      previewHeight: 320,
      blocked: false,
      createdAt: now - 86400 * 9,
      updatedAt: now - 86400 * 9,
    },
    {
      id: db.nextId.creative++,
      campaignId: campaign3.id,
      name: 'Spring Menu Landscape',
      minHeight: 720,
      maxHeight: 1080,
      minWidth: 1280,
      maxWidth: 1920,
      dataUrl: 'https://via.placeholder.com/1280x720/33cc33/ffffff?text=Spring+Landscape',
      previewWidth: 400,
      previewHeight: 225,
      blocked: false,
      createdAt: now - 86400 * 8,
      updatedAt: now - 86400 * 8,
    },
    {
      id: db.nextId.creative++,
      campaignId: campaign4.id,
      name: 'Weekend Offers Wide',
      minHeight: 1080,
      maxHeight: 2160,
      minWidth: 1920,
      maxWidth: 3840,
      dataUrl: 'https://via.placeholder.com/1920x1080/ff33cc/ffffff?text=Weekend+Offers',
      previewWidth: 400,
      previewHeight: 225,
      blocked: false,
      createdAt: now - 86400 * 4,
      updatedAt: now - 86400 * 4,
    },
    {
      id: db.nextId.creative++,
      campaignId: campaign5.id,
      name: 'Holiday 2025 Banner',
      minHeight: 600,
      maxHeight: 1080,
      minWidth: 800,
      maxWidth: 1920,
      dataUrl: 'https://via.placeholder.com/800x600/cc0000/ffffff?text=Holiday+2025',
      blocked: true,
      createdAt: now - 86400 * 119,
      updatedAt: now - 86400 * 20,
    },
  ];

  // Seed schedules
  db.schedules = [
    {
      id: db.nextId.schedule++,
      name: 'Breakfast',
      color: '#18251f',
      weekSchedule: [
        { day: 'Mon', enabled: true, startTime: '00:00', endTime: '23:00' },
        { day: 'Tue', enabled: true, startTime: '04:00', endTime: '02:00' },
        { day: 'Wed', enabled: true, startTime: '04:00', endTime: '08:00' },
        { day: 'Thu', enabled: true, startTime: '04:00', endTime: '08:00' },
        { day: 'Fri', enabled: true, startTime: '04:00', endTime: '08:00' },
        { day: 'Sat', enabled: true, startTime: '04:00', endTime: '09:00' },
        { day: 'Sun', enabled: true, startTime: '04:00', endTime: '09:00' },
      ],
      blocked: false,
      createdAt: now - 86400 * 30,
      updatedAt: now - 86400 * 5,
    },
    {
      id: db.nextId.schedule++,
      name: 'Lunch',
      color: '#000000',
      weekSchedule: [
        { day: 'Mon', enabled: true, startTime: '07:00', endTime: '11:00' },
        { day: 'Tue', enabled: true, startTime: '07:00', endTime: '11:00' },
        { day: 'Wed', enabled: true, startTime: '07:00', endTime: '11:00' },
        { day: 'Thu', enabled: true, startTime: '07:00', endTime: '11:00' },
        { day: 'Fri', enabled: true, startTime: '07:00', endTime: '11:00' },
        { day: 'Sat', enabled: true, startTime: '07:00', endTime: '11:00' },
        { day: 'Sun', enabled: true, startTime: '07:00', endTime: '12:00' },
      ],
      blocked: false,
      createdAt: now - 86400 * 28,
      updatedAt: now - 86400 * 3,
    },
    {
      id: db.nextId.schedule++,
      name: 'Dinner',
      color: '#c80815',
      weekSchedule: [
        { day: 'Mon', enabled: true, startTime: '00:00', endTime: '23:59' },
        { day: 'Tue', enabled: true, startTime: '00:00', endTime: '23:59' },
        { day: 'Wed', enabled: true, startTime: '00:00', endTime: '23:59' },
        { day: 'Thu', enabled: true, startTime: '00:00', endTime: '23:59' },
        { day: 'Fri', enabled: true, startTime: '00:00', endTime: '23:59' },
        { day: 'Sat', enabled: true, startTime: '00:00', endTime: '23:59' },
        { day: 'Sun', enabled: true, startTime: '00:00', endTime: '23:59' },
      ],
      blocked: false,
      createdAt: now - 86400 * 25,
      updatedAt: now - 86400 * 1,
    },
  ];

  saveDatabase(db);
  return db;
};
