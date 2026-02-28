"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "border border-white/15 !bg-[#040716] !text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
          title: "!text-white",
          description: "!text-white/70",
        },
      }}
    />
  );
}
