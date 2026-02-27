import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  User,
  Tag,
  Loader2,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useGetProduct } from "../hooks/useQueries";
import { useAddToCart } from "../hooks/useQueries";
import { useAuth } from "../hooks/useAuth";

interface ProductDetailPageProps {
  productId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-100 text-blue-700",
  Fashion: "bg-pink-100 text-pink-700",
  Home: "bg-amber-100 text-amber-700",
  Books: "bg-purple-100 text-purple-700",
  Sports: "bg-green-100 text-green-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const { data: product, isLoading, isError } = useGetProduct(productId);
  const addToCart = useAddToCart();
  const { isLoggedIn, login } = useAuth();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (added || addToCart.isPending || !product) return;
    if (!isLoggedIn) {
      toast.info("Sign in to add items to your cart");
      login();
      return;
    }
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
      setAdded(true);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const categoryClass = product
    ? (CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS["Other"])
    : "";

  return (
    <div className="min-h-screen bg-background page-enter">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4 pt-4">
              <div className="skeleton h-6 w-24 rounded-full" />
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-6 w-1/3 rounded" />
              <div className="skeleton h-24 w-full rounded" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          </div>
        ) : isError || !product ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6">
              <PackageOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2
              className="text-xl font-bold text-foreground mb-2"
              style={{ fontFamily: "Sora, system-ui, sans-serif" }}
            >
              Product not found
            </h2>
            <p className="text-muted-foreground mb-6">
              This product may have been removed.
            </p>
            <Link to="/" className="btn-coral inline-flex">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
            {/* Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary shadow-card">
              {product.image.getDirectURL() ? (
                <img
                  src={product.image.getDirectURL()}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <PackageOpen className="w-16 h-16 opacity-30" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col py-2">
              {/* Category badge */}
              <span
                className={`inline-flex items-center gap-1 self-start text-xs font-semibold px-3 py-1 rounded-full mb-4 ${categoryClass}`}
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                <Tag className="w-3 h-3" />
                {product.category}
              </span>

              {/* Name */}
              <h1
                className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-5">
                <span
                  className="text-3xl font-bold text-coral"
                  style={{ fontFamily: "Sora, system-ui, sans-serif" }}
                >
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Seller info */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-secondary rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sold by</p>
                  <p
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: "Sora, system-ui, sans-serif" }}
                  >
                    {product.sellerName}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8 flex-1">
                <h2
                  className="text-sm font-semibold text-foreground mb-2"
                  style={{ fontFamily: "Sora, system-ui, sans-serif" }}
                >
                  About this product
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-200
                  ${added
                    ? "bg-green-500 text-white"
                    : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.99]"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                {addToCart.isPending && !added ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026. Built with <span className="text-coral">♥</span> using{" "}
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
    </div>
  );
}
