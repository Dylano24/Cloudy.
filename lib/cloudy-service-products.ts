import type { ProductDetailed } from '@/lib/schemas';

export type CloudyWebsitePackageKey = 'Starter' | 'Business' | 'Premium';

const sharedFields = [
  {
    id: 991001,
    order: 1,
    name: 'Full name',
    type: 'text',
    marker: 'customer_name',
    required: true,
  },
  {
    id: 991002,
    order: 2,
    name: 'Email address',
    type: 'text',
    marker: 'customer_email',
    required: true,
  },
  {
    id: 991003,
    order: 3,
    name: 'Website project',
    type: 'textarea',
    marker: 'project_description',
    required: true,
  },
] as const;

function makeWebsiteProduct(
  id: number,
  name: CloudyWebsitePackageKey,
  slug: string,
  price: number,
  pages: number,
  description: string,
  featured = false,
): ProductDetailed {
  return {
    id,
    name: `Cloudy Studio — ${name}`,
    status: true,
    slug,
    price,
    small_description: `${pages} complete pages · ${description}`,
    description,
    category: null,
    subscription: false,
    featured,
    created_date: 0,
    quantity: false,
    files: false,
    giftcard: false,
    enable_stock: false,
    custom_fields: sharedFields.map(field => ({ ...field })),
  };
}

export const cloudyWebsiteProducts: Record<CloudyWebsitePackageKey, ProductDetailed> = {
  Starter: makeWebsiteProduct(
    -991101,
    'Starter',
    'cloudy-studio-starter',
    750,
    5,
    'A complete professional website for individuals, creators and new businesses.',
  ),
  Business: makeWebsiteProduct(
    -991102,
    'Business',
    'cloudy-studio-business',
    1500,
    8,
    'A stronger website for growing businesses that need more room to present their work.',
    true,
  ),
  Premium: makeWebsiteProduct(
    -991103,
    'Premium',
    'cloudy-studio-premium',
    2500,
    12,
    'A larger, highly refined website for established brands and ambitious projects.',
  ),
};

export function isCloudyServiceProduct(product: { slug?: string } | null | undefined) {
  return !!product?.slug?.startsWith('cloudy-studio-');
}
