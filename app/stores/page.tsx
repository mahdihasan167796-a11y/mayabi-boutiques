import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export default async function StoresPage() {
  const { data } = await supabaseAdmin.from("store_locations").select("*").order("created_at", { ascending: true });
  const stores = data ?? [];

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Visit Us</span>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mt-1">আমাদের আউটলেট</h1>
      </div>

      {stores.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-16">
          বর্তমানে আমরা শুধু অনলাইনেই সক্রিয় — সারা বাংলাদেশে হোম ডেলিভারি সুবিধা আছে।
        </p>
      ) : (
        <div className="space-y-4">
          {stores.map((store: any) => (
            <div key={store.id} className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-serif text-lg font-bold text-white mb-1">{store.name}</h3>
              <p className="text-sm text-gray-400 mb-2">{store.address}</p>
              <div className="flex gap-4 text-xs">
                {store.phone && <span className="text-gray-500">📞 {store.phone}</span>}
                {store.map_link && (
                  <a href={store.map_link} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">
                    ম্যাপে দেখুন →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
