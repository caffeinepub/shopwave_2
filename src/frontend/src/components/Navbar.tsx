import { useState, useCallback } from "react";
import { ShoppingCart, Search, Store, X, User, LogOut, Loader2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useGetCartItemCount } from "../hooks/useQueries";
import { useAuth } from "../hooks/useAuth";

interface NavbarProps {
  onSearchChange: (query: string) => void;
  onCartOpen: () => void;
  searchValue: string;
}

export default function Navbar({
  onSearchChange,
  onCartOpen,
  searchValue,
}: NavbarProps) {
  const navigate = useNavigate();
  const { data: cartCount } = useGetCartItemCount();
  const [focused, setFocused] = useState(false);
  const { isLoggedIn, login, logout, principal, isInitializing } = useAuth();

  const handleClear = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  const count = cartCount ? Number(cartCount) : 0;

  const handleCartOpen = () => {
    if (!isLoggedIn) {
      toast.info("Sign in to view your cart");
      login();
      return;
    }
    onCartOpen();
  };

  const principalShort = principal
    ? `${principal.toString().slice(0, 4)}...`
    : "";

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 group"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          <span
            className="text-foreground font-bold text-lg hidden sm:block"
            style={{ fontFamily: "Sora, system-ui, sans-serif" }}
          >
            Market
            <span className="text-coral">Place</span>
          </span>
        </Link>

        {/* Search */}
        <div
          className={`flex-1 max-w-xl mx-auto relative transition-all duration-200 ${focused ? "scale-[1.01]" : ""}`}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search products, brands, categories..."
            className={`w-full pl-10 pr-10 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground
              ${focused ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cart */}
          <button
            type="button"
            onClick={handleCartOpen}
            className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors group"
            aria-label={isLoggedIn ? `Cart (${count} items)` : "Sign in to view cart"}
          >
            <ShoppingCart className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            {isLoggedIn && count > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center leading-none"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>

          {/* Start Selling */}
          <button
            type="button"
            onClick={() => navigate({ to: "/sell" })}
            className="btn-coral hidden sm:flex items-center gap-1.5"
          >
            <span className="text-lg leading-none">+</span>
            <span>Start Selling</span>
          </button>

          {/* Mobile sell icon */}
          <button
            type="button"
            onClick={() => navigate({ to: "/sell" })}
            className="sm:hidden p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            aria-label="Start Selling"
          >
            <span className="text-lg font-bold leading-none">+</span>
          </button>

          {/* Auth button */}
          {isInitializing ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              {/* Principal chip */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary rounded-xl text-xs font-semibold text-foreground"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-primary" />
                </div>
                {principalShort}
              </div>
              {/* Logout */}
              <button
                type="button"
                onClick={logout}
                className="p-2.5 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground group"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 group-hover:text-destructive transition-colors" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={login}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-secondary text-sm font-semibold text-foreground transition-all duration-200"
              style={{ fontFamily: "Sora, system-ui, sans-serif" }}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:block">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
