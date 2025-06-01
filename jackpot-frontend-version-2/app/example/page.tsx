"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const DemoJackpotGame = dynamic(
  () => import("@/components/demo-jackpot-game"),
  { ssr: false }
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0E27] via-[#0F1635] to-[#1A1F3A]">
    <div className="relative">
      <div className="w-20 h-20 rounded-full border-4 border-[#FFE500] border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-[#00D4FF] border-t-transparent animate-spin animate-reverse"></div>
    </div>
  </div>
);

export default function DemoPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DemoJackpotGame />
    </Suspense>
  );
}