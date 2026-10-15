'use client';

import { useProducts, useCategories } from '@/hooks/use-api';
import { useCart } from '@/hooks/use-cart';
import { ProductCard } from '@/components/product/product-card';
import { Package, Filter, AlertCircle, RefreshCcw, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { Category, ProductGeneral } from '@/lib/schemas';

export default function RustStore() {
  const clearIfExpired = useCart(state => state.clearIfExpired);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Array<ProductGeneral & { description?: string }>>([]);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingMore = useRef(false);
  
  useEffect(() => {
    clearIfExpired();
  }, [clearIfExpired]);

  const { data: categories, error: categoriesError } = useCategories();
  const { data: products, isLoading, isFetching, isPlaceholderData, error: productsError, refetch } = useProducts({
    page: currentPage, 
    maxPage: 50, 
    onlyEnabled: true,
    category: selectedCategory ?? undefined,
  });

  const selectedCategoryData = categories?.categories.find(c => c.id === selectedCategory);

  // Group categories by parent
  const categoriesByParent = categories?.categories.reduce((acc, cat) => {
    const parentId = cat.parent_id ?? 0;
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(cat);
    return acc;
  }, {} as Record<number, typeof categories.categories>);

  const selectCategory = (category: number | null) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setCurrentPage(1);
    setAllProducts([]);
    setHasMore(true);
    loadingMore.current = false;
  };

  const renderCategoryButton = (category: Category) => {
    const isSelected = selectedCategory === category.id;

    return (
      <button
        key={category.id}
        onClick={() => selectCategory(category.id)}
        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer ${
          isSelected
            ? 'bg-primary text-background border-primary glow-primary'
            : 'bg-card border-border hover:border-primary hover:-translate-y-0.5'
        }`}
      >
        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted/50">
          {category.image ? (
            <Image
              src={category.image}
              alt={`${category.name} cover`}
              fill
              sizes="120px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={`absolute inset-0 flex items-center justify-center ${isSelected ? 'text-background/70' : 'text-muted'}`}>
              <Package className="w-4 h-4" />
            </div>
          )}
        </div>
        <span className="text-sm font-medium leading-tight">{category.name}</span>
      </button>
    );
  };

  // Append new products when data arrives
  useEffect(() => {
    // Previous-page/category placeholders must never enter the current list.
    if (isFetching || isPlaceholderData || productsError || !products?.products) {
      return;
    }
    loadingMore.current = false;
    
    // Update products - use callback to avoid race conditions
    setAllProducts(prev => {
      if (currentPage === 1) {
        return products.products;
      }
      
      // Refresh existing records too, so unchanged IDs can get new price/stock.
      const existingIds = new Set(prev.map(p => p.id));
      const newProducts = products.products.filter(p => !existingIds.has(p.id));
      const incoming = new Map(products.products.map(p => [p.id, p]));
      return [...prev.map(p => incoming.get(p.id) || p), ...newProducts];
    });
    
    // Only has more if we got a full page of products
    setHasMore(products.products.length === 50);
  }, [isFetching, isPlaceholderData, productsError, products?.products, currentPage]);

  useEffect(() => {
    // Only set up observer if we have products loaded
    if (allProducts.length === 0 || !hasMore || isFetching || isPlaceholderData || productsError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore.current) {
          loadingMore.current = true;
          setCurrentPage(prev => prev + 1);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px'
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      observer.disconnect();
    };
  }, [allProducts.length, isFetching, isPlaceholderData, productsError, hasMore]);

  return (
    <div className="cloudy-rust-store-page min-h-screen">
      <section className="cloudy-rust-store-hero">
        <img src="/images/cloudy-rust-premium-4k.avif" alt="" aria-hidden="true" className="cloudy-rust-store-hero-image" />
        <div className="cloudy-rust-store-hero-shade" aria-hidden="true" />
        <div className="cloudy-rust-store-hero-copy">
          <span>RUST</span>
          <h1>RUST STORE</h1>
          <Link href="/shop" className="cloudy-classic-button mt-5" style={{ borderColor: '#e51b2e' }}>Back</Link>
        </div>
      </section>
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        {categoriesError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>Could not load categories. Showing all products.</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Filters */}

        {categories && categories.categories.length > 0 ? (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Categories</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => selectCategory(null)}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedCategory === null
                      ? 'bg-primary text-background border-primary glow-primary'
                      : 'bg-card border-border hover:border-primary hover:-translate-y-0.5'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-md bg-muted/50 flex items-center justify-center">
                    <Filter className="w-4 h-4" />
                  </div>
                  All Products
                </button>
                
                {/* Show top-level categories OR subcategories if in a parent category */}
                {(() => {
                  // Check if selected category has subcategories
                  const hasSubcategories = 
                    selectedCategory !== null && 
                    selectedCategoryData && 
                    categoriesByParent?.[selectedCategory] && 
                    categoriesByParent[selectedCategory]!.length > 0;
                  
                  // Check if selected category is itself a subcategory
                  const isSubcategory = selectedCategoryData?.parent_id && selectedCategoryData.parent_id !== 0;
                  const parentId = isSubcategory ? selectedCategoryData.parent_id : null;
                  
                  // If selected category has subcategories OR is a subcategory, show the subcategories
                  if (hasSubcategories && selectedCategory !== null) {
                    return categoriesByParent[selectedCategory]!.filter(cat => !cat.hide).map(renderCategoryButton);
                  } else if (isSubcategory && parentId && categoriesByParent?.[parentId]) {
                    // Show siblings (other subcategories of the same parent)
                    return categoriesByParent[parentId]!.filter(cat => !cat.hide).map(renderCategoryButton);
                  }
                  
                  // Otherwise show top-level categories
                  return categoriesByParent?.[0]?.filter(cat => !cat.hide).map(renderCategoryButton);
                })()}
              </div>
            </div>
          </>
        ) : null}

        {/* Product Grid */}
        {isLoading || (isFetching && allProducts.length === 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : productsError ? (
          <div className="rounded-xl border border-border bg-red-500/10 p-6 text-red-400 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold">Could not load products.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary transition-colors text-sm cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : allProducts.length > 0 ? (
          <>
            {/* Filter results by search query */}
            {(() => {
              const filteredProducts = allProducts.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
              );

              if (filteredProducts.length === 0) {
                return (
                  <div className="text-center py-20">
                    <Package className="w-16 h-16 text-muted mx-auto mb-4" />
                    <p className="text-xl text-muted mb-4">No products found matching "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-card border border-border hover:border-primary transition-colors cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                );
              }

              return (
                <>
                  <div className="mb-4 text-sm text-muted">
                    Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} hideFeaturedBadge />
                    ))}
                  </div>
                </>
              );
            })()}
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-xl text-muted mb-4">No products found in this category</p>
            <button
              onClick={() => selectCategory(null)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-card border border-border hover:border-primary transition-colors cursor-pointer"
            >
              Show all products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
