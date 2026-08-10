import { supabaseAdmin } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/settings";
import AdminDashboard from "./admin-dashboard";

export default async function AdminPage() {
  const [{ data: products }, { data: orders }, settings, { data: reviews }] = await Promise.all([
    supabaseAdmin.from("products").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }),
    getSiteSettings(),
    supabaseAdmin.from("reviews").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <AdminDashboard
      initialProducts={products ?? []}
      initialOrders={orders ?? []}
      initialSettings={settings}
      initialReviews={reviews ?? []}
    />
  );
}