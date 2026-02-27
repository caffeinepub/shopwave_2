import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "./pages/HomePage";
import SellPage from "./pages/SellPage";
import ProductDetailPage from "./pages/ProductDetailPage";

// ─── Root Route ──────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// ─── Home ─────────────────────────────────────────────────────────────────────
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// ─── Sell ─────────────────────────────────────────────────────────────────────
const sellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sell",
  component: SellPage,
});

// ─── Product Detail ───────────────────────────────────────────────────────────
const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product/$id",
  component: function ProductRouteComponent() {
    const { id } = productRoute.useParams();
    return <ProductDetailPage productId={id} />;
  },
});

// ─── Router ───────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([homeRoute, sellRoute, productRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
