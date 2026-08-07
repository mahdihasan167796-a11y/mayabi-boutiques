import Link from "next/link";
import { Product } from "@/lib/products";
import { formatBDT } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="bg-[#121211] rounded-2xl overflow-hidden border border-[#c9a054]/15 p-4 flex flex-col justify-between group cursor-pointer shadow-xl transition-all duration-300 hover:border-[#c9a054]/50 hover:-translate-y-1.5"
    >
      <div className="h-56 w-full overflow-hidden rounded-xl bg-black relative mb-4">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2 left-2 bg-[#7a121d] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
          PREMIUM
        </span>
      </div>
      <div>
        <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#c9a054] line-clamp-1">
          {product.name}
        </h4>
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-800">
          <p className="text-sm font-black text-[#c9a054]">{formatBDT(product.price)}</p>
          <span className="text-[10px] text-gray-400 bg-[#1e1e1d] px-2.5 py-1 rounded-md border border-gray-800">
            অর্ডার করুন →
          </span>
        </div>
      </div>
    </Link>
  );
}
