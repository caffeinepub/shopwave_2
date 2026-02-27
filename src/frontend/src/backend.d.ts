import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ProductInput {
    name: string;
    description: string;
    sellerName: string;
    category: string;
    image: ExternalBlob;
    price: number;
}
export type CartOutput = Array<CartItem>;
export interface CartItem {
    productId: string;
    quantity: bigint;
}
export interface ProductOutput {
    id: string;
    sellerPrincipal: Principal;
    name: string;
    description: string;
    sellerName: string;
    timestamp: bigint;
    category: string;
    image: ExternalBlob;
    price: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCallerCart(): Promise<void>;
    createProduct(productInput: ProductInput): Promise<ProductOutput>;
    deleteProduct(productId: string): Promise<void>;
    filterByCategory(category: string): Promise<Array<ProductOutput>>;
    getAllProducts(): Promise<Array<ProductOutput>>;
    getCallerCart(): Promise<CartOutput>;
    getCallerCartItemCount(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(productId: string): Promise<ProductOutput>;
    getTimeNow(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeFromCart(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchByName(keyword: string): Promise<Array<ProductOutput>>;
    updateCartItem(productId: string, quantity: bigint): Promise<void>;
}
