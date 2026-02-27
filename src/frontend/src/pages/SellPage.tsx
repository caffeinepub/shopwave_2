import { useState, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Upload,
  ImagePlus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreateProduct } from "../hooks/useQueries";

const CATEGORIES = ["Electronics", "Fashion", "Home", "Books", "Sports", "Other"];

const FIELD_TIPS: Record<string, string> = {
  name: "Give your product a clear, descriptive name",
  description: "Tell buyers what makes your product special",
  price: "Set a fair price in USD",
  category: "Choose the most relevant category",
  sellerName: "Your display name for buyers",
};

export default function SellPage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sellerName: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      newErrors.price = "Enter a valid price greater than 0";
    }
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.sellerName.trim()) newErrors.sellerName = "Seller name is required";
    if (!imageFile) newErrors.image = "Please upload a product image";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.keys(validationErrors)[0];
      document.getElementById(firstError)?.focus();
      return;
    }

    try {
      const buffer = await imageFile!.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      await createProduct.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        sellerName: form.sellerName.trim(),
        image: blob,
      });

      toast.success("Product listed successfully! 🎉");
      navigate({ to: "/" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to list product. Please try again.");
      setUploadProgress(0);
    }
  };

  const isPending = createProduct.isPending;

  return (
    <div className="min-h-screen bg-background page-enter">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-nav">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <div className="flex-1" />
          <h1
            className="text-base font-bold text-foreground"
            style={{ fontFamily: "Sora, system-ui, sans-serif" }}
          >
            List a Product
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-2xl mb-4">
            <ImagePlus className="w-7 h-7 text-primary" />
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
            style={{ fontFamily: "Sora, system-ui, sans-serif" }}
          >
            Sell your product
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Fill in the details below and your item will be live in the marketplace instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label
              htmlFor="imageUpload"
              className="text-sm font-semibold text-foreground block"
              style={{ fontFamily: "Sora, system-ui, sans-serif" }}
            >
              Product Image <span className="text-primary">*</span>
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 aspect-video
                ${errors.image ? "border-destructive bg-destructive/5" : "border-border hover:border-primary hover:bg-accent/50"}`}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1.5 rounded-lg">
                      Click to change image
                    </span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Click or drag to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
              aria-label="Product image upload"
            />
            {errors.image && (
              <p className="text-xs text-destructive mt-1">{errors.image}</p>
            )}
          </div>

          {/* Two column grid for smaller fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Product Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="name"
                className="text-sm font-semibold text-foreground block"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                Product Name <span className="text-primary">*</span>
              </label>
              <p className="text-xs text-muted-foreground">{FIELD_TIPS.name}</p>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Vintage Leather Jacket"
                disabled={isPending}
                className={`w-full px-4 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground
                  ${errors.name ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="description"
                className="text-sm font-semibold text-foreground block"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                Description <span className="text-primary">*</span>
              </label>
              <p className="text-xs text-muted-foreground">{FIELD_TIPS.description}</p>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product — condition, features, why it's great..."
                rows={4}
                disabled={isPending}
                className={`w-full px-4 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground resize-none
                  ${errors.description ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label
                htmlFor="price"
                className="text-sm font-semibold text-foreground block"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                Price (USD) <span className="text-primary">*</span>
              </label>
              <p className="text-xs text-muted-foreground">{FIELD_TIPS.price}</p>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  disabled={isPending}
                  className={`w-full pl-8 pr-4 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground
                    ${errors.price ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
                />
              </div>
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="category"
                className="text-sm font-semibold text-foreground block"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                Category <span className="text-primary">*</span>
              </label>
              <p className="text-xs text-muted-foreground">{FIELD_TIPS.category}</p>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={isPending}
                className={`w-full px-4 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-all duration-200 text-foreground
                  ${!form.category ? "text-muted-foreground" : ""}
                  ${errors.category ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
              >
                <option value="" disabled>Select a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Seller Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="sellerName"
                className="text-sm font-semibold text-foreground block"
                style={{ fontFamily: "Sora, system-ui, sans-serif" }}
              >
                Your Name / Shop Name <span className="text-primary">*</span>
              </label>
              <p className="text-xs text-muted-foreground">{FIELD_TIPS.sellerName}</p>
              <input
                id="sellerName"
                name="sellerName"
                type="text"
                value={form.sellerName}
                onChange={handleChange}
                placeholder="e.g. Jane's Boutique"
                disabled={isPending}
                className={`w-full px-4 py-2.5 text-sm bg-secondary border rounded-xl outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground
                  ${errors.sellerName ? "border-destructive ring-1 ring-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"}`}
              />
              {errors.sellerName && (
                <p className="text-xs text-destructive">{errors.sellerName}</p>
              )}
            </div>
          </div>

          {/* Upload progress */}
          {isPending && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading image...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full btn-coral py-3.5 text-base flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadProgress > 0 && uploadProgress < 100
                  ? `Uploading... ${uploadProgress}%`
                  : "Publishing..."}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Publish Product
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
