import { useState } from "react";
import { ShoppingCart, Check, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ProductOutput } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";

interface ProductCardProps {
  product: ProductOutput;
}

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-100 text-blue-700",
  Fashion: "bg-pink-100 text-pink-700",
  Home: "bg-amber-100 text-amber-700",
  Books: "bg-purple-100 text-purple-700",
  Sports: "bg-green-100 text-green-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (added || addToCart.isPending) return;
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // silent – toast handled higher up if needed
    }
  };

  const imageUrl = product.image.getDirectURL();
  const categoryClass = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS["Other"];

  return (
    <article className="product-card flex flex-col">
      {/* Image */}
      <Link to="/product/$id" params={{ id: product.id }} className="relative aspect-[4/3] overflow-hidden bg-secondary block">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <title>No image</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category badge */}
        <span className={`absolute top-2.5 left-2.5 text-xs font-semibold px-2 py-0.5 rounded-full ${categoryClass}`}
          style={{ fontFamily: "Sora, system-ui, sans-serif" }}
        >
          {product.category}
        </span>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="font-semibold text-foreground text-sm leading-snug mb-1 line-clamp-2 hover:text-primary transition-colors"
          style={{ fontFamily: "Sora, system-ui, sans-serif" }}
        >
          {product.name}
        </Link>

        <p className="text-muted-foreground text-xs mb-3 line-clamp-1 flex items-center gap-1">
          <User className="w-3 h-3 shrink-0" />
          {product.sellerName}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span
            className="text-foreground font-bold text-base"
            style={{ fontFamily: "Sora, system-ui, sans-serif" }}
          >
            ${product.price.toFixed(2)}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addToCart.isPending && !added}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-200
              ${added
                ? "bg-green-500 text-white"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
              }`}
            style={{ fontFamily: "Sora, system-ui, sans-serif" }}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
