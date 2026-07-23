import { supabaseAdmin } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/settings";
import AdminDashboard from "./admin-dashboard";

export default async function AdminPage() {
  const [{ data: products }, { data: orders }, settings] = await Promise.all([
    supabaseAdmin.from("products").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }),
    getSiteSettings(),
  ]);

  return (
    <AdminDashboard
      initialProducts={products ?? []}
      initialOrders={orders ?? []}
      initialSettings={settings}
    />
  );
}