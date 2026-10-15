import catalog from '@/lib/rust-items.json';

export type KitCategory = 'Subscriptions' | 'Claim once' | 'Lifetime';
export type InventoryArea = 'wear' | 'main' | 'belt';
export type RustItemKey = keyof typeof catalog;
export type KitItem = { shortname: RustItemKey; amount: number; area: InventoryArea };
export type PreviewKit = {
  id: string;
  number: string;
  name: string;
  category: KitCategory;
  price: number | null;
  items: readonly KitItem[];
};
export const rustItems = catalog;

// Cloudy-only draft quantities. No prices or quantities are taken from another store.
// No record in this collection is passed to the cart or checkout.
export const previewKits: readonly PreviewKit[] = [
  {
    id: 'assault', number: '01', name: 'VIP Loadout', category: 'Subscriptions', price: null,
    items: [
      { shortname: 'hazmatsuit', amount: 1, area: 'wear' },
      { shortname: 'ammo.rifle', amount: 128, area: 'main' },
      { shortname: 'cloth', amount: 50, area: 'main' },
      { shortname: 'pumpkin', amount: 6, area: 'main' },
      { shortname: 'rifle.ak', amount: 1, area: 'belt' },
      { shortname: 'syringe.medical', amount: 6, area: 'belt' },
      { shortname: 'bandage', amount: 4, area: 'belt' },
    ],
  },
  {
    id: 'tactical', number: '02', name: 'Elite Loadout', category: 'Subscriptions', price: null,
    items: [
      { shortname: 'metal.facemask', amount: 1, area: 'wear' },
      { shortname: 'metal.plate.torso', amount: 1, area: 'wear' },
      { shortname: 'roadsign.kilt', amount: 1, area: 'wear' },
      { shortname: 'hoodie', amount: 1, area: 'wear' },
      { shortname: 'pants', amount: 1, area: 'wear' },
      { shortname: 'shoes.boots', amount: 1, area: 'wear' },
      { shortname: 'tactical.gloves', amount: 1, area: 'wear' },
      { shortname: 'ammo.rifle', amount: 128, area: 'main' },
      { shortname: 'ammo.pistol', amount: 64, area: 'main' },
      { shortname: 'rifle.lr300', amount: 1, area: 'belt' },
      { shortname: 'smg.mp5', amount: 1, area: 'belt' },
      { shortname: 'syringe.medical', amount: 6, area: 'belt' },
      { shortname: 'bandage', amount: 4, area: 'belt' },
    ],
  },
  {
    id: 'builder', number: '03', name: 'Builder Pack', category: 'Claim once', price: null,
    items: [
      { shortname: 'wood', amount: 3000, area: 'main' },
      { shortname: 'stones', amount: 2000, area: 'main' },
      { shortname: 'metal.fragments', amount: 300, area: 'main' },
      { shortname: 'lock.code', amount: 1, area: 'main' },
      { shortname: 'hammer', amount: 1, area: 'belt' },
      { shortname: 'building.planner', amount: 1, area: 'belt' },
    ],
  },
  {
    id: 'resources', number: '04', name: 'Resource Pack', category: 'Claim once', price: null,
    items: [
      { shortname: 'wood', amount: 2500, area: 'main' },
      { shortname: 'stones', amount: 2000, area: 'main' },
      { shortname: 'metal.fragments', amount: 500, area: 'main' },
      { shortname: 'metal.refined', amount: 20, area: 'main' },
      { shortname: 'leather', amount: 100, area: 'main' },
      { shortname: 'fat.animal', amount: 100, area: 'main' },
    ],
  },
  {
    id: 'medic', number: '05', name: 'Medical Kit', category: 'Lifetime', price: null,
    items: [
      { shortname: 'cloth', amount: 100, area: 'main' },
      { shortname: 'lowgradefuel', amount: 60, area: 'main' },
      { shortname: 'smallwaterbottle', amount: 1, area: 'main' },
      { shortname: 'pumpkin', amount: 4, area: 'main' },
      { shortname: 'syringe.medical', amount: 6, area: 'belt' },
      { shortname: 'bandage', amount: 8, area: 'belt' },
    ],
  },
  {
    id: 'components', number: '06', name: 'Component Kit', category: 'Lifetime', price: null,
    items: [
      { shortname: 'gears', amount: 6, area: 'main' },
      { shortname: 'metalpipe', amount: 4, area: 'main' },
      { shortname: 'metalblade', amount: 6, area: 'main' },
      { shortname: 'rope', amount: 10, area: 'main' },
      { shortname: 'sewingkit', amount: 4, area: 'main' },
      { shortname: 'scrap', amount: 100, area: 'main' },
    ],
  },
];
