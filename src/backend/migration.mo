import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldProduct = {
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

  type OldCartItem = {
    productId : Text;
    quantity : Nat;
  };

  type OldActor = {
    products : Map.Map<Text, OldProduct>;
    carts : Map.Map<Principal, List.List<OldCartItem>>;
    productIdCounter : Nat;
    imageIdCounter : Nat;
  };

  type NewProduct = {
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

  type NewCartItem = {
    productId : Text;
    quantity : Nat;
  };

  type NewActor = {
    products : Map.Map<Text, NewProduct>;
    carts : Map.Map<Principal, List.List<NewCartItem>>;
    productIdCounter : Nat;
    imageIdCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    { old with imageIdCounter = 0 };
  };
};
