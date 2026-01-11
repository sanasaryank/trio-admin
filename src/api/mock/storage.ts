const STORAGE_KEY = 'trio_admin_mock_db';
const SESSION_KEY = 'trio_admin_session';

export interface MockDatabase {
  employees: any[];
  restaurants: any[];
  qrCodes: any[];
  dictionaries: {
    'restaurant-types': any[];
    'price-segments': any[];
    'menu-types': any[];
    'integration-types': any[];
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
  };
}

export const getDatabase = (): MockDatabase => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
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
    dictionaries: {
      'restaurant-types': [],
      'price-segments': [],
      'menu-types': [],
      'integration-types': [],
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
    typeId: db.dictionaries['restaurant-types'][2].id, // Fine Dining
    priceSegmentId: db.dictionaries['price-segments'][3].id, // Luxury
    menuTypeId: db.dictionaries['menu-types'][0].id, // Digital
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
    typeId: db.dictionaries['restaurant-types'][0].id, // Fast Food
    priceSegmentId: db.dictionaries['price-segments'][0].id, // Budget
    menuTypeId: db.dictionaries['menu-types'][2].id, // Hybrid
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

  saveDatabase(db);
  return db;
};
