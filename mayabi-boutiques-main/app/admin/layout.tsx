import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mt-20 sm:-mt-28 pt-2 min-h-screen bg-[#070706]">
      {children}
    </div>
  );
}