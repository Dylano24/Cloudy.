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

// Cloudy-only draft quantities and temporary preview prices, pending owner approval.
// No record in this collection is passed to the cart or checkout.
export const previewKits: readonly PreviewKit[] = [
  {
    id: 'assault', number: '01', name: 'VIP kit', category: 'Subscriptions', price: 9.99,
    items: [
      { shortname: 'hazmatsuit', amount: 1, area: 'wear' },
      { shortname: 'ammo.rifle', amount: 256, area: 'main' },
      { shortname: 'cloth', amount: 150, area: 'main' },
      { shortname: 'wood', amount: 2000, area: 'main' },
      { shortname: 'stones', amount: 1500, area: 'main' },
      { shortname: 'metal.fragments', amount: 500, area: 'main' },
      { shortname: 'lowgradefuel', amount: 100, area: 'main' },
      { shortname: 'pumpkin', amount: 6, area: 'main' },
      { shortname: 'rifle.ak', amount: 1, area: 'belt' },
      { shortname: 'syringe.medical', amount: 6, area: 'belt' },
      { shortname: 'bandage', amount: 4, area: 'belt' },
      { shortname: 'smallwaterbottle', amount: 2, area: 'main' },
      { shortname: 'sleepingbag', amount: 1, area: 'main' },
      { shortname: 'lock.code', amount: 1, area: 'main' },
      { shortname: 'largemedkit', amount: 2, area: 'main' },
      { shortname: 'antiradpills', amount: 3, area: 'main' },
      { shortname: 'pickaxe', amount: 1, area: 'belt' },
      { shortname: 'hatchet', amount: 1, area: 'belt' },
      { shortname: 'torch', amount: 1, area: 'belt' },
    ],
  },
  {
    id: 'tactical', number: '02', name: 'Elite kit', category: 'Subscriptions', price: 14.99,
    items: [
      { shortname: 'metal.facemask', amount: 1, area: 'wear' },
      { shortname: 'metal.plate.torso', amount: 1, area: 'wear' },
      { shortname: 'roadsign.kilt', amount: 1, area: 'wear' },
      { shortname: 'hoodie', amount: 1, area: 'wear' },
      { shortname: 'pants', amount: 1, area: 'wear' },
      { shortname: 'shoes.boots', amount: 1, area: 'wear' },
      { shortname: 'tactical.gloves', amount: 1, area: 'wear' },
      { shortname: 'ammo.rifle', amount: 384, area: 'main' },
      { shortname: 'ammo.pistol', amount: 128, area: 'main' },
      { shortname: 'cloth', amount: 250, area: 'main' },
      { shortname: 'pumpkin', amount: 10, area: 'main' },
      { shortname: 'metal.fragments', amount: 1000, area: 'main' },
      { shortname: 'metal.refined', amount: 30, area: 'main' },
      { shortname: 'lowgradefuel', amount: 150, area: 'main' },
      { shortname: 'rifle.bolt', amount: 1, area: 'belt' },
      { shortname: 'rifle.lr300', amount: 1, area: 'belt' },
      { shortname: 'smg.mp5', amount: 1, area: 'belt' },
      { shortname: 'syringe.medical', amount: 6, area: 'belt' },
      { shortname: 'bandage', amount: 4, area: 'belt' },
      { shortname: 'smallwaterbottle', amount: 2, area: 'main' },
      { shortname: 'largemedkit', amount: 3, area: 'main' },
      { shortname: 'antiradpills', amount: 4, area: 'main' },
      { shortname: 'sleepingbag', amount: 1, area: 'main' },
      { shortname: 'lock.code', amount: 2, area: 'main' },
      { shortname: 'pickaxe', amount: 1, area: 'belt' },
    ],
  },
  {
    id: 'builder', number: '03', name: 'Builder kit', category: 'Claim once', price: 4.99,
    items: [
      { shortname: 'wood', amount: 6000, area: 'main' },
      { shortname: 'stones', amount: 5000, area: 'main' },
      { shortname: 'metal.fragments', amount: 1000, area: 'main' },
      { shortname: 'metal.refined', amount: 25, area: 'main' },
      { shortname: 'lock.code', amount: 3, area: 'main' },
      { shortname: 'cloth', amount: 150, area: 'main' },
      { shortname: 'lowgradefuel', amount: 100, area: 'main' },
      { shortname: 'hammer', amount: 1, area: 'belt' },
      { shortname: 'building.planner', amount: 1, area: 'belt' },
      { shortname: 'cupboard.tool', amount: 1, area: 'main' },
      { shortname: 'door.hinged.metal', amount: 2, area: 'main' },
      { shortname: 'furnace', amount: 1, area: 'main' },
      { shortname: 'box.wooden.large', amount: 2, area: 'main' },
      { shortname: 'sleepingbag', amount: 1, area: 'main' },
      { shortname: 'campfire', amount: 1, area: 'main' },
      { shortname: 'leather', amount: 100, area: 'main' },
      { shortname: 'pickaxe', amount: 1, area: 'belt' },
      { shortname: 'hatchet', amount: 1, area: 'belt' },
      { shortname: 'torch', amount: 1, area: 'belt' },
    ],
  },
  {
    id: 'resources', number: '04', name: 'Resource kit', category: 'Claim once', price: 5.99,
    items: [
      { shortname: 'wood', amount: 5000, area: 'main' },
      { shortname: 'stones', amount: 4000, area: 'main' },
      { shortname: 'metal.fragments', amount: 1500, area: 'main' },
      { shortname: 'metal.refined', amount: 40, area: 'main' },
      { shortname: 'leather', amount: 250, area: 'main' },
      { shortname: 'fat.animal', amount: 200, area: 'main' },
      { shortname: 'cloth', amount: 300, area: 'main' },
      { shortname: 'lowgradefuel', amount: 150, area: 'main' },
      { shortname: 'metal.ore', amount: 2000, area: 'main' },
      { shortname: 'sulfur.ore', amount: 1000, area: 'main' },
      { shortname: 'sulfur', amount: 500, area: 'main' },
      { shortname: 'charcoal', amount: 1000, area: 'main' },
      { shortname: 'gunpowder', amount: 250, area: 'main' },
      { shortname: 'scrap', amount: 100, area: 'main' },
      { shortname: 'pickaxe', amount: 1, area: 'belt' },
      { shortname: 'hatchet', amount: 1, area: 'belt' },
      { shortname: 'torch', amount: 1, area: 'belt' },
    ],
  },
  {
    id: 'medic', number: '05', name: 'Medical kit', category: 'Lifetime', price: 7.99,
    items: [
      { shortname: 'cloth', amount: 300, area: 'main' },
      { shortname: 'lowgradefuel', amount: 150, area: 'main' },
      { shortname: 'smallwaterbottle', amount: 3, area: 'main' },
      { shortname: 'pumpkin', amount: 12, area: 'main' },
      { shortname: 'leather', amount: 100, area: 'main' },
      { shortname: 'fat.animal', amount: 100, area: 'main' },
      { shortname: 'syringe.medical', amount: 12, area: 'belt' },
      { shortname: 'bandage', amount: 12, area: 'belt' },
      { shortname: 'largemedkit', amount: 4, area: 'main' },
      { shortname: 'antiradpills', amount: 5, area: 'main' },
      { shortname: 'can.beans', amount: 6, area: 'main' },
      { shortname: 'can.tuna', amount: 6, area: 'main' },
      { shortname: 'corn', amount: 10, area: 'main' },
      { shortname: 'campfire', amount: 1, area: 'main' },
      { shortname: 'sleepingbag', amount: 1, area: 'main' },
    ],
  },
  {
    id: 'components', number: '06', name: 'Component kit', category: 'Lifetime', price: 9.99,
    items: [
      { shortname: 'gears', amount: 12, area: 'main' },
      { shortname: 'metalpipe', amount: 10, area: 'main' },
      { shortname: 'metalblade', amount: 12, area: 'main' },
      { shortname: 'rope', amount: 20, area: 'main' },
      { shortname: 'sewingkit', amount: 10, area: 'main' },
      { shortname: 'scrap', amount: 250, area: 'main' },
      { shortname: 'metal.fragments', amount: 500, area: 'main' },
      { shortname: 'metal.refined', amount: 20, area: 'main' },
      { shortname: 'metalspring', amount: 8, area: 'main' },
      { shortname: 'sheetmetal', amount: 10, area: 'main' },
      { shortname: 'techparts', amount: 4, area: 'main' },
      { shortname: 'semibody', amount: 4, area: 'main' },
      { shortname: 'riflebody', amount: 2, area: 'main' },
      { shortname: 'smgbody', amount: 3, area: 'main' },
      { shortname: 'fuse', amount: 3, area: 'main' },
      { shortname: 'tarp', amount: 6, area: 'main' },
    ],
  },
];
