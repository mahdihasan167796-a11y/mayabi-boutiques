import { supabaseAdmin } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/settings";
import * as AdminModule from "./admin-dashboard";

export default async function AdminPage() {
  const [{ data: products }, { data: orders }, settings] = await Promise.all([
    supabaseAdmin.from("products").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }),
    getSiteSettings(),
  ]);

  const ComponentToRender =
    (AdminModule as any).default ||
    (AdminModule as any).AdminDashboard ||
    (AdminModule as any).ProductsTab;

  return (
    <ComponentToRender
      initialProducts={products ?? []}
      initialOrders={orders ?? []}
      initialSettings={settings}
    />
  );
}