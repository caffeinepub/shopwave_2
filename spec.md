# ShopWave

## Current State

ShopWave is a marketplace where anyone can list products (no login required) and browse/search/filter by category. The cart is functional but gated to users with the `#user` role in the backend. Currently there is no login flow in the UI, so the cart and product listing work only for anonymous visitors where the backend allows it. The authorization component is already installed.

## Requested Changes (Diff)

### Add
- Internet Identity login button in the Navbar (shows "Sign In" when logged out, shows user initials/principal + logout when logged in)
- On first login, automatically call `assignCallerUserRole` to assign `#user` role so the caller can use cart APIs
- A `useAuth` context/hook wrapping `InternetIdentityProvider` so any component can check `isLoggedIn`
- Prompt to sign in when an anonymous user tries to add to cart or view the cart

### Modify
- Navbar: add login/logout button on the right side
- CartDrawer: show "Sign in to use your cart" message for anonymous visitors instead of cart contents
- ProductDetailPage and ProductCard: show "Sign in to add to cart" instead of silently failing for anonymous users
- SellPage: allow listing without login (already working) -- no change needed

### Remove
Nothing

## Implementation Plan
1. Wrap `main.tsx` with `InternetIdentityProvider`
2. Create `useAuth` hook that exposes `{ isLoggedIn, identity, login, logout, principal }` using `useInternetIdentity`
3. After successful login, call `backend.assignCallerUserRole(principal, UserRole.user)` so the user's cart APIs work
4. Add login/logout button to Navbar
5. In CartDrawer, gate content behind login check -- show sign-in prompt for anonymous users
6. In ProductCard and ProductDetailPage add-to-cart buttons, show sign-in prompt toast if not logged in

## UX Notes
- Login flow opens Internet Identity in a popup
- After login the user is returned to the same page, cart count reloads automatically
- Logout clears local identity; cart count resets to 0
- The sell form remains accessible to everyone (anonymous listing already works)
