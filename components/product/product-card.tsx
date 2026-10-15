'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Zap, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { ProductGeneral, ProductDetailed } from '@/lib/schemas';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { useProduct } from '@/hooks/use-api';
import { CustomFieldsModal } from './custom-fields-modal';
import { useRouter } from 'next/navigation';

type ProductCardProps = {
  product: ProductGeneral;
  hideFeaturedBadge?: boolean;
};

function needsCustomization(product: ProductDetailed | undefined) {
  return !!product && Boolean(
    product.custom_fields?.length ||
    (product.subscription && product.onetime_sub === true) ||
    product.donation ||
    product.server_choice
  );
}

export function ProductCard({ product, hideFeaturedBadge = false }: ProductCardProps) {
  const addItem = useCart(state => state.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const pendingAdd = useRef(false);
  const { data: detailedProduct, refetch } = useProduct(product.slug, true, false);
  const needsCustomFields = needsCustomization(detailedProduct);
  
  const isOutOfStock = typeof product.stock === 'number' && product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isOutOfStock || pendingAdd.current) return;
    pendingAdd.current = true;
    setLoadingDetails(true);
    setDetailsError(null);
    try {
      const result = await refetch();
      if (result.error || !result.data) throw result.error || new Error('Missing product details');
      const selectedProduct = result.data;
      if (!selectedProduct.status || selectedProduct.stock === 0) return;

      if (needsCustomization(selectedProduct)) {
        setShowModal(true);
        return;
      }

      const currentInCart = useCart.getState().items
        .filter(item => item.product.id === selectedProduct.id)
        .reduce((count, item) => count + item.quantity, 0);
      if (typeof selectedProduct.stock === 'number' && currentInCart + 1 > selectedProduct.stock) return;
      const subscriptionType = selectedProduct.subscription ? 'recurring' : undefined;
      addItem(selectedProduct, 1, {}, subscriptionType);
      if (selectedProduct.subscription) {
        router.push('/cart');
        return;
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      setDetailsError('Unable to load product details. Please try again.');
    } finally {
      pendingAdd.current = false;
      setLoadingDetails(false);
    }
  };

  // Strip HTML tags from description
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const CardContent = (
    <div className={`group relative h-full rounded-xl bg-card border border-border transition-all duration-300 overflow-hidden ${
      isOutOfStock 
        ? 'opacity-60 grayscale cursor-not-allowed' 
        : 'hover:border-primary'
    }`}>
          {/* Badges */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
            {/* Non-recurring discount badge - shows period and normal price after first payment */}
            {product.subscription && product.recurring_discount === false && product.old_price && product.old_price > product.price && product.period_num && product.duration_periodicity && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full border border-primary/70 text-primary bg-background/60">
                {product.period_num} {product.duration_periodicity}{product.period_num > 1 ? 's' : ''} at ${product.old_price.toFixed(2)}
              </span>
            )}
            {product.featured && !hideFeaturedBadge && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full border border-primary/70 text-primary bg-background/60">
                Featured
              </span>
            )}
            {product.percent_off && product.percent_off > 0 && product.price > 0 && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full border border-primary/70 text-primary bg-background/60">
                -{product.percent_off}%
              </span>
            )}
            {typeof product.stock === 'number' && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full border border-red-500/70 text-red-400 bg-background/60">
                {product.stock === 0 ? 'Out of stock' : `Stock: ${product.stock}`}
              </span>
            )}
          </div>

          {/* Image */}
          <div className="relative w-full h-48 bg-gradient-card overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={`object-contain transition-transform duration-300 ${
                  isOutOfStock ? '' : 'group-hover:scale-105'
                }`}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-16 h-16 text-primary/30" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-3 h-full">
            <h3 className={`font-semibold text-lg line-clamp-1 transition-colors ${
              isOutOfStock ? '' : 'group-hover:text-primary'
            }`}>
              {product.name}
            </h3>
            
            <div className="min-h-[44px] text-sm text-muted">
              {product.small_description ? (
                <p className="line-clamp-2">{stripHtml(product.small_description)}</p>
              ) : (
                <span className="invisible">placeholder</span>
              )}
            </div>

            {/* Price & CTA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {product.price > 0 ? `$${product.price.toFixed(2)}` : 'Free'}
                  </span>
                  {/* For subscriptions with non-recurring discount, show "then original price / period" */}
                  {product.subscription && product.recurring_discount === false && product.old_price && product.old_price > product.price ? (
                    <>
                      <span className="text-sm text-muted">then</span>
                      <span className="text-sm text-muted">
                        ${product.old_price.toFixed(2)}
                      </span>
                      {product.period_num && product.duration_periodicity && (
                        <span className="text-sm text-muted">
                          / {product.period_num > 1 ? `${product.period_num} ` : ''}{product.duration_periodicity}
                          {product.period_num > 1 ? 's' : ''}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {product.subscription && product.period_num && product.duration_periodicity && (
                        <span className="text-sm text-muted">
                          / {product.period_num > 1 ? `${product.period_num} ` : ''}{product.duration_periodicity}
                          {product.period_num > 1 ? 's' : ''}
                        </span>
                      )}
                      {product.old_price && product.old_price > 0 && product.old_price > product.price ? (
                        <span className="text-sm text-muted line-through">
                          ${product.old_price.toFixed(2)}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.9 }}
                  animate={added ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`p-2 rounded-lg text-background transition-all cursor-pointer ${
                    isOutOfStock 
                      ? 'bg-muted/50 cursor-not-allowed' 
                      : added 
                        ? 'bg-green-500 glow-primary' 
                        : 'bg-primary hover:bg-primary/90 glow-primary'
                  }`}
                  aria-label={detailsError || (product.subscription && !needsCustomFields ? 'Subscribe' : 'Add to cart')}
                  aria-busy={loadingDetails}
                  title={detailsError || undefined}
                  disabled={isOutOfStock || loadingDetails}
                >
                  {loadingDetails ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : detailsError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : added ? (
                    <Check className="w-5 h-5" />
                  ) : product.subscription && !needsCustomFields ? (
                    <ArrowRight className="w-5 h-5" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                </motion.button>
                {detailsError && <span className="sr-only" role="alert">{detailsError}</span>}
              </div>
            </div>
          </div>
        </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isOutOfStock ? (
        CardContent
      ) : (
        <Link href={`/product/${product.slug}`}>
          {CardContent}
        </Link>
      )}

      {/* Custom Fields Modal */}
      {needsCustomFields && detailedProduct && (
        <CustomFieldsModal
          product={detailedProduct}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </motion.div>
  );
}
