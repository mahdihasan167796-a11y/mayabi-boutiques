export type Locale = "bn" | "en";

// এখানে সাইটের কমন UI টেক্সট (মেনু, বাটন, লেবেল) দুই ভাষায় রাখা আছে।
// প্রোডাক্ট/ক্যাটাগরির নিজস্ব নাম এখানে না থেকে সরাসরি ডাটাবেজের name_en কলাম থেকে আসে।
// নতুন কোনো UI টেক্সট যোগ করলে এখানেও দুই ভাষায় একটা এন্ট্রি যোগ করে দিতে হবে।
export const translations: Record<Locale, Record<string, string>> = {
  bn: {
    // নেভিগেশন
    nav_home: "হোম",
    nav_featured: "ফিচার্ড কালেকশন",
    nav_combo: "কম্বো প্যাকেজ",
    nav_our_story: "আমাদের গল্প",
    nav_why_us: "কেন আমরা সেরা",
    nav_reviews: "গ্রাহকদের মন্তব্য",
    nav_contact: "যোগাযোগ",
    nav_more: "আরও",
    search_placeholder: "পণ্য খুঁজুন...",

    // সাধারণ বাটন
    btn_view_collection: "কালেকশন দেখুন",
    btn_add_to_cart: "কার্টে যোগ করুন",
    btn_buy_now: "এখনই কিনুন",
    btn_checkout: "চেকআউটে যান",
    btn_view_all: "সব দেখুন",
    btn_order_now: "অর্ডার করুন",
    btn_read_more: "বিস্তারিত জানুন",

    // কার্ট ড্রয়ার
    cart_title: "আপনার কার্ট",
    cart_empty: "আপনার কার্ট এখনো খালি",
    cart_subtotal: "সাবটোটাল",

    // চেকআউট
    checkout_title: "ডেলিভারি তথ্য ও পেমেন্ট",
    checkout_full_name: "আপনার নাম",
    checkout_phone: "মোবাইল নাম্বার",
    checkout_email: "ইমেইল (ঐচ্ছিক)",
    checkout_address: "ঠিকানা",
    checkout_payment_method: "পেমেন্ট পদ্ধতি নির্বাচন করুন",
    checkout_coupon_placeholder: "কুপন কোড থাকলে দিন",
    checkout_apply: "প্রয়োগ করুন",
    checkout_order_summary: "অর্ডার সামারি",
    checkout_grand_total: "সর্বমোট",

    // প্রোডাক্ট পেজ
    product_size: "সাইজ",
    product_color: "কালার",
    product_quantity: "পরিমাণ",
    product_size_chart: "Size Chart",
    product_out_of_stock: "স্টক শেষ",
    product_in_stock: "স্টকে আছে",
    product_related: "আপনাদের পছন্দের আরও কিছু কালেকশন",
    product_reviews: "গ্রাহকদের রিভিউ",

    // ফুটার
    footer_quick_links: "কুইক লিঙ্ক",
    footer_policy: "জরুরি পলিসি",
    footer_contact: "যোগাযোগ",

    // সাধারণ
    currency_symbol: "৳",
  },
  en: {
    nav_home: "Home",
    nav_featured: "Featured Collection",
    nav_combo: "Combo Packages",
    nav_our_story: "Our Story",
    nav_why_us: "Why Choose Us",
    nav_reviews: "Reviews",
    nav_contact: "Contact",
    nav_more: "More",
    search_placeholder: "Search products...",

    btn_view_collection: "View Collection",
    btn_add_to_cart: "Add to Cart",
    btn_buy_now: "Buy Now",
    btn_checkout: "Go to Checkout",
    btn_view_all: "View All",
    btn_order_now: "Order Now",
    btn_read_more: "Read More",

    cart_title: "Your Cart",
    cart_empty: "Your cart is empty",
    cart_subtotal: "Subtotal",

    checkout_title: "Delivery Info & Payment",
    checkout_full_name: "Your Name",
    checkout_phone: "Mobile Number",
    checkout_email: "Email (optional)",
    checkout_address: "Address",
    checkout_payment_method: "Select Payment Method",
    checkout_coupon_placeholder: "Enter coupon code",
    checkout_apply: "Apply",
    checkout_order_summary: "Order Summary",
    checkout_grand_total: "Grand Total",

    product_size: "Size",
    product_color: "Color",
    product_quantity: "Quantity",
    product_size_chart: "Size Chart",
    product_out_of_stock: "Out of Stock",
    product_in_stock: "In Stock",
    product_related: "You Might Also Like",
    product_reviews: "Customer Reviews",

    footer_quick_links: "Quick Links",
    footer_policy: "Policies",
    footer_contact: "Contact",

    currency_symbol: "৳",
  },
};
