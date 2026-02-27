# ShopWave

## Current State
E-commerce marketplace where sellers can list products with images and buyers can browse, search, filter by category, and manage a cart. The backend uses blob-storage for images and has authorization/access-control mixins included. The `createProduct` endpoint currently checks for `#user` permission, which blocks all anonymous visitors from listing products (causing the "Failed to list" error).

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Remove the `#user` authorization check from `createProduct` so any visitor (including anonymous principals) can list a product without needing to log in

### Remove
- The `Runtime.trap("Unauthorized: Only users can create products")` guard in `createProduct`

## Implementation Plan
1. Regenerate the backend without the authorization guard on `createProduct` -- all other functions stay the same
2. No frontend changes needed

## UX Notes
- No visible UI changes; the sell form will simply work instead of throwing an error
