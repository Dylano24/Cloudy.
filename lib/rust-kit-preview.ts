export type KitCategory = 'Essentials' | 'Resources' | 'Support';
export type ItemSymbol = 'wood' | 'stone' | 'metal' | 'cloth' | 'tool' | 'medical' | 'food' | 'gear' | 'bow';
export type PreviewKit = {
  id: string;
  number: string;
  name: string;
  category: KitCategory;
  subtitle: string;
  price: number;
  symbol: 'explorer' | 'builder' | 'ranger' | 'medic' | 'resources' | 'workshop';
  note: string;
  items: { name: string; amount: string; symbol: ItemSymbol }[];
};

// Design proposals only. These records are never passed to the cart or checkout.
export const previewKits: readonly PreviewKit[] = [
  {
    id: 'explorer', number: '01', name: 'Explorer kit', category: 'Essentials',
    subtitle: 'A small start. A world to explore.', price: 2.99, symbol: 'explorer',
    note: 'Basic tools and a modest supply of materials to get a first shelter started. Progression still happens in game.',
    items: [
      { name: 'Stone pickaxe', amount: '1', symbol: 'tool' },
      { name: 'Stone hatchet', amount: '1', symbol: 'tool' },
      { name: 'Wood', amount: '1,500', symbol: 'wood' },
      { name: 'Stones', amount: '1,000', symbol: 'stone' },
      { name: 'Cloth', amount: '50', symbol: 'cloth' },
      { name: 'Bandages', amount: '4', symbol: 'medical' },
    ],
  },
  {
    id: 'builder', number: '02', name: 'Builder kit', category: 'Resources',
    subtitle: 'Lay the foundations. Make it yours.', price: 4.99, symbol: 'builder',
    note: 'A practical building supply for a compact base. No complete base, automated defences or raid materials included.',
    items: [
      { name: 'Wood', amount: '3,000', symbol: 'wood' },
      { name: 'Stones', amount: '2,000', symbol: 'stone' },
      { name: 'Metal fragments', amount: '300', symbol: 'metal' },
      { name: 'Hammer', amount: '1', symbol: 'tool' },
      { name: 'Building plan', amount: '1', symbol: 'tool' },
      { name: 'Code lock', amount: '1', symbol: 'gear' },
    ],
  },
  {
    id: 'ranger', number: '03', name: 'Ranger kit', category: 'Essentials',
    subtitle: 'Travel light. Find your own way.', price: 3.49, symbol: 'ranger',
    note: 'A simple hunting loadout with basic protection. No military weapons, explosives or high-tier armour.',
    items: [
      { name: 'Hunting bow', amount: '1', symbol: 'bow' },
      { name: 'Wooden arrows', amount: '64', symbol: 'bow' },
      { name: 'Burlap shirt', amount: '1', symbol: 'cloth' },
      { name: 'Burlap trousers', amount: '1', symbol: 'cloth' },
      { name: 'Bandages', amount: '4', symbol: 'medical' },
      { name: 'Pumpkins', amount: '6', symbol: 'food' },
    ],
  },
  {
    id: 'medic', number: '04', name: 'Field Medic kit', category: 'Support',
    subtitle: 'Recover, regroup and head back out.', price: 2.49, symbol: 'medic',
    note: 'A compact recovery supply for one player. A helping hand between encounters, with no weapons or armour included.',
    items: [
      { name: 'Medical syringes', amount: '6', symbol: 'medical' },
      { name: 'Bandages', amount: '8', symbol: 'medical' },
      { name: 'Cloth', amount: '100', symbol: 'cloth' },
      { name: 'Low grade fuel', amount: '60', symbol: 'gear' },
      { name: 'Water bottle', amount: '1', symbol: 'food' },
      { name: 'Pumpkins', amount: '4', symbol: 'food' },
    ],
  },
  {
    id: 'resources', number: '05', name: 'Resource Supply', category: 'Resources',
    subtitle: 'Keep your next project moving.', price: 3.99, symbol: 'resources',
    note: 'A measured top-up of everyday materials. No sulfur, gunpowder or explosives, keeping this supply focused on building and upkeep.',
    items: [
      { name: 'Wood', amount: '2,500', symbol: 'wood' },
      { name: 'Stones', amount: '2,000', symbol: 'stone' },
      { name: 'Metal fragments', amount: '500', symbol: 'metal' },
      { name: 'High quality metal', amount: '20', symbol: 'metal' },
      { name: 'Leather', amount: '100', symbol: 'cloth' },
      { name: 'Animal fat', amount: '100', symbol: 'gear' },
    ],
  },
  {
    id: 'workshop', number: '06', name: 'Workshop kit', category: 'Support',
    subtitle: 'A few useful parts. Your next idea.', price: 4.49, symbol: 'workshop',
    note: 'A small set of crafting components rather than finished high-tier equipment. Research and crafting remain part of the experience.',
    items: [
      { name: 'Gears', amount: '6', symbol: 'gear' },
      { name: 'Metal pipes', amount: '4', symbol: 'metal' },
      { name: 'Metal blades', amount: '6', symbol: 'metal' },
      { name: 'Rope', amount: '10', symbol: 'cloth' },
      { name: 'Sewing kits', amount: '4', symbol: 'tool' },
      { name: 'Scrap', amount: '100', symbol: 'gear' },
    ],
  },
];
