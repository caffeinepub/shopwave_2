import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { PackageOpen, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import {
  useGetAllProducts,
  useSearchProducts,
  useFilterByCategory,
} from "../hooks/useQueries";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Books", "Sports", "Other"];

function ProductSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearching = debouncedSearch.trim().length > 0;
  const isFiltering = activeCategory !== "All";

  const allProductsQuery = useGetAllProducts();
  const searchQuery_ = useSearchProducts(debouncedSearch);
  const categoryQuery = useFilterByCategory(activeCategory);

  // Pick active query
  const activeQuery = isSearching
    ? searchQuery_
    : isFiltering
    ? categoryQuery
    : allProductsQuery;

  const products = activeQuery.data ?? [];
  const isLoading = activeQuery.isLoading || activeQuery.isFetching;

  // On category change, clear search
  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    if (searchQuery) setSearchQuery("");
  };

  // On search, reset category
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) setActiveCategory("All");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        onSearchChange={handleSearchChange}
        onCartOpen={() => setCartOpen(true)}
        searchValue={searchQuery}
      />

      <main className="flex-1">
        {/* Hero / Category filters */}
        <section className="border-b border-border bg-card/50 py-3 sticky top-16 z-20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`category-chip shrink-0 ${activeCategory === cat && !isSearching ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-foreground"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                {isSearching
                  ? `Results for "${debouncedSearch}"`
                  : activeCategory === "All"
                  ? "All Products"
                  : activeCategory}
              </h1>
              {!isLoading && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {products.length} {products.length === 1 ? "item" : "items"} found
                </p>
              )}
            </div>

            <Link
              to="/sell"
              className="btn-coral hidden md:flex items-center gap-1.5 text-sm"
            >
              <span className="text-base leading-none font-bold">+</span>
              List a Product
            </Link>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {(["s1","s2","s3","s4","s5","s6","s7","s8"]).map((key) => (
                <ProductSkeleton key={key} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center page-enter">
              <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6 shadow-card">
                <PackageOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2
                className="text-xl font-bold text-foreground mb-2"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                {isSearching
                  ? "No products found"
                  : "No products yet"}
              </h2>
              <p className="text-muted-foreground max-w-xs mb-6">
                {isSearching
                  ? `We couldn't find anything matching "${debouncedSearch}". Try a different search term.`
                  : "Be the first to sell something amazing! It only takes a minute to list your product."}
              </p>
              {!isSearching && (
                <Link to="/sell" className="btn-coral inline-flex items-center gap-1.5">
                  <span className="text-base leading-none font-bold">+</span>
                  Start Selling
                </Link>
              )}
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="btn-coral"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="product-grid-item"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026. Built with{" "}
            <span className="text-coral">♥</span>{" "}
            using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
