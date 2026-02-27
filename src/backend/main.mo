import Text "mo:core/Text";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Char "mo:core/Char";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import Int "mo:core/Int";

// Migration specification

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    sellerName : Text;
    sellerPrincipal : Principal;
    image : Storage.ExternalBlob;
    timestamp : Int;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      switch (Text.compare(p1.id, p2.id)) {
        case (#equal) { Float.compare(p1.price, p2.price) };
        case (order) { order };
      };
    };

    public func compareByNewest(p1 : Product, p2 : Product) : Order.Order {
      Int.compare(p2.timestamp, p1.timestamp);
    };
  };

  var productIdCounter = 0;
  let products = Map.empty<Text, Product>();

  public type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  module CartItem {
    public func compare(c1 : CartItem, c2 : CartItem) : Order.Order {
      Text.compare(c1.productId, c2.productId);
    };
  };

  let carts = Map.empty<Principal, List.List<CartItem>>();

  public type ProductInput = {
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    sellerName : Text;
    image : Storage.ExternalBlob;
  };

  public type ProductOutput = Product;
  public type CartOutput = [CartItem];

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  func toLower(text : Text) : Text {
    text.map(
      func(c) {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(c.toNat32() + 32);
        } else {
          c;
        };
      }
    );
  };

  var imageIdCounter = 0;

  func getNextImageId() : Text {
    imageIdCounter += 1;
    imageIdCounter.toText();
  };

  public shared ({ caller }) func createProduct(productInput : ProductInput) : async ProductOutput {
    let productId = productIdCounter.toText();
    productIdCounter += 1;

    let product : Product = {
      id = productId;
      name = productInput.name;
      description = productInput.description;
      price = productInput.price;
      category = productInput.category;
      sellerName = productInput.sellerName;
      sellerPrincipal = caller;
      image = productInput.image;
      timestamp = Time.now();
    };

    products.add(productId, product);

    product;
  };

  public query func getAllProducts() : async [ProductOutput] {
    products.values().toArray().sort(Product.compareByNewest);
  };

  public query func getProduct(productId : Text) : async ProductOutput {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query func filterByCategory(category : Text) : async [ProductOutput] {
    let filtered = products.values().toArray().filter(
      func(product) {
        Text.equal(product.category, category);
      }
    );
    filtered;
  };

  public query func searchByName(keyword : Text) : async [ProductOutput] {
    let loweredKeyword = toLower(keyword);
    let filtered = products.values().toArray().filter(
      func(product) {
        toLower(product.name).contains(#text loweredKeyword);
      }
    );
    filtered;
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (not AccessControl.isAdmin(accessControlState, caller) and not Principal.equal(caller, product.sellerPrincipal)) {
          Runtime.trap("Unauthorized: Only the product owner or an admin can delete this product");
        };
        products.remove(productId);
      };
    };
  };

  public shared ({ caller }) func addToCart(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let cart = switch (carts.get(caller)) {
          case (null) { List.empty<CartItem>() };
          case (?existingCart) { existingCart };
        };

        let existingCart = switch (carts.get(caller)) {
          case (null) { List.empty<CartItem>() };
          case (?c) { c };
        };

        let existingCartItem = existingCart.filter(
          func(item) { Text.equal(item.productId, productId) }
        );

        if (existingCartItem.size() > 0) {
          let updatedCart = cart.map<CartItem, CartItem>(
            func(item) {
              if (Text.equal(item.productId, productId)) {
                { productId = item.productId; quantity = item.quantity + quantity };
              } else {
                item;
              };
            }
          );
          carts.add(caller, updatedCart);
        } else {
          cart.add({ productId; quantity });
          carts.add(caller, cart);
        };
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove items from cart");
    };

    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        let updatedCart = cart.filter(
          func(item) { not Text.equal(item.productId, productId) }
        );
        carts.add(caller, updatedCart);
      };
    };
  };

  public shared ({ caller }) func updateCartItem(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart items");
    };

    if (quantity == 0) {
      return await removeFromCart(productId);
    };

    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        let updatedCart = cart.map<CartItem, CartItem>(
          func(item) {
            if (Text.equal(item.productId, productId)) {
              { productId = item.productId; quantity };
            } else {
              item;
            };
          }
        );
        carts.add(caller, updatedCart);
      };
    };
  };

  public query ({ caller }) func getCallerCart() : async CartOutput {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their cart");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existingCart) { existingCart };
    };
    cart.toArray();
  };

  public shared ({ caller }) func clearCallerCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear their cart");
    };

    carts.remove(caller);
  };

  public query ({ caller }) func getCallerCartItemCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their cart count");
    };

    switch (carts.get(caller)) {
      case (null) { 0 };
      case (?cart) {
        cart.foldLeft(0, func(count, item) { count + item.quantity });
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getTimeNow() : async Int {
    Time.now();
  };
};

