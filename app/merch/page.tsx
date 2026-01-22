"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Star, Heart, Filter, X, ShoppingCart, Package, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useCart } from "@/lib/cart-context";
import { CartSidebar } from "@/components/cart-sidebar";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  description: string;
  sizes?: string[];
  colors?: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
}

const categories = ["All", "Apparel", "Accessories", "Books & Media"];

export default function MerchPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart, getItemCount, setIsOpen } = useCart();
  
  // Data fetching state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseBrowserClient();
      
      if (!supabase) {
        setError("Failed to connect to database");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // Map database fields to Product interface
        const mappedProducts: Product[] = (data || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price) || 0,
          originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
          category: product.category || 'Uncategorized',
          image: product.image_url || product.thumbnail_url || '/placeholder.jpg',
          description: product.description || '',
          sizes: product.sizes || [],
          colors: product.colors || [],
          rating: parseFloat(product.rating) || 0,
          reviews: product.review_count || 0,
          inStock: product.in_stock !== false,
          featured: product.featured || false,
        }));

        setProducts(mappedProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "featured":
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating)
                ? "fill-secondary text-secondary"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background pt-24">
      <CartSidebar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
            <ShoppingBag className="w-3 h-3" />
            Ministry Store
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            GKP Radio Merchandise
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Show your support with our exclusive collection of faith-inspired merchandise.
            Every purchase helps support our ministry and broadcasts.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/30 border-border rounded-2xl pl-12 h-12 text-base"
            />
            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === category
                    ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
            <div className="flex gap-2">
              {[
                { value: "featured", label: "Featured" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
                { value: "rating", label: "Best Rating" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Error loading products</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        ) : !loading && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-muted/30 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/20" />
                  </div>
                  {product.featured && (
                    <div className="absolute top-3 left-3 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <span className="text-destructive font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>

                {/* Product Info */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="mb-4">{renderStars(product.rating)}</div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Product Options */}
                  {(product.sizes || product.colors) && (
                    <div className="mb-4 space-y-2">
                      {product.sizes && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Sizes:</p>
                          <div className="flex gap-2 flex-wrap">
                            {product.sizes.map((size) => (
                              <span
                                key={size}
                                className="px-2 py-1 text-xs bg-muted/30 rounded-lg text-muted-foreground"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {product.colors && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Colors:</p>
                          <div className="flex gap-2 flex-wrap">
                            {product.colors.map((color) => (
                              <span
                                key={color}
                                className="px-2 py-1 text-xs bg-muted/30 rounded-lg text-muted-foreground"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    disabled={!product.inStock}
                    onClick={() => {
                      if (product.inStock) {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        });
                      }
                    }}
                    className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-xl h-11 font-bold gap-2 mt-auto"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-secondary/5 border border-secondary/10 rounded-3xl p-12">
          <Heart className="w-12 h-12 text-secondary mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Support Our Ministry
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every purchase helps us continue spreading the message of God&apos;s Kingdom
            principles. Thank you for your support!
          </p>
          <Button className="bg-secondary text-white hover:bg-secondary/90 rounded-xl px-8 h-12 font-bold gap-2">
            <Heart className="w-5 h-5" />
            Learn More About Our Mission
          </Button>
        </div>
      </div>
    </main>
  );
}
