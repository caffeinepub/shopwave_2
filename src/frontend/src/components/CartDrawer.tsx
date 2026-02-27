import { useEffect } from "react";
import { X, ShoppingBag, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  useGetCallerCart,
  useGetAllProducts,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from "../hooks/useQueries";
import type { CartItem, ProductOutput } from "../backend.d";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function CartItemRow({
  item,
  product,
}: {
  item: CartItem;
  product: ProductOutput | undefined;
}) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const quantity = Number(item.quantity);

  const handleDecrement = async () => {
    if (quantity <= 1) {
      try {
        await removeItem.mutateAsync(item.productId);
      } catch {
        toast.error("Failed to remove item");
      }
      return;
    }
    try {
      await updateItem.mutateAsync({
        productId: item.productId,
        quantity: BigInt(quantity - 1),
      });
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleIncrement = async () => {
    try {
      await updateItem.mutateAsync({
        productId: item.productId,
        quantity: BigInt(quantity + 1),
      });
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem.mutateAsync(item.productId);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const imageUrl = product?.image.getDirectURL();

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      {/* Image */}
      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-secondary">
        {imageUrl ? (
          <img src={imageUrl} alt={product?.name ?? "Product"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="w-5 h-5 opacity-40" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5"
          style={{ fontFamily: "Sora, system-ui, sans-serif" }}
        >
          {product?.name ?? `Product #${item.productId.slice(0, 8)}`}
        </p>
        <p className="text-xs text-muted-foreground mb-2">{product?.sellerName ?? "Unknown seller"}</p>

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-1.5 bg-secondary rounded-lg p-0.5">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={updateItem.isPending || removeItem.isPending}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-card transition-colors disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span
              className="w-6 text-center text-sm font-semibold"
              style={{ fontFamily: "Sora, system-ui, sans-serif" }}
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={updateItem.isPending || removeItem.isPending}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-card transition-colors disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold text-foreground"
              style={{ fontFamily: "Sora, system-ui, sans-serif" }}
            >
              ${product ? (product.price * quantity).toFixed(2) : "—"}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={removeItem.isPending}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10 disabled:opacity-50"
              aria-label="Remove item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { data: cartItems, isLoading: cartLoading } = useGetCallerCart();
  const { data: allProducts } = useGetAllProducts();
  const clearCart = useClearCart();

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const productMap = new Map<string, ProductOutput>(
    (allProducts ?? []).map((p) => [p.id, p])
  );

  const items = cartItems ?? [];

  const subtotal = items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    if (!product) return sum;
    return sum + product.price * Number(item.quantity);
  }, 0);

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        className="cart-overlay"
        onClick={onClose}
        aria-label="Close cart"
        style={{ cursor: "default" }}
      />

      {/* Drawer Panel */}
      <aside className="cart-drawer" aria-label="Shopping cart">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2
              className="text-base font-bold text-foreground"
              style={{ fontFamily: "Sora, system-ui, sans-serif" }}
            >
              Your Cart
            </h2>
            {items.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                {items.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5">
          {cartLoading ? (
            <div className="py-8 flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton w-16 h-16 shrink-0 rounded-xl" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                    <div className="skeleton h-6 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3
                className="text-base font-bold text-foreground mb-1"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                Your cart is empty
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Add some products to get started!
              </p>
              <Link
                to="/"
                onClick={onClose}
                className="btn-coral inline-flex"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  product={productMap.get(item.productId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearCart}
              disabled={clearCart.isPending}
              className="w-full py-2.5 text-sm font-semibold text-muted-foreground border border-border rounded-xl hover:bg-secondary hover:text-foreground transition-all duration-200 disabled:opacity-50"
              style={{ fontFamily: "Sora, system-ui, sans-serif" }}
            >
              {clearCart.isPending ? "Clearing..." : "Clear Cart"}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              Checkout coming soon — stay tuned!
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
