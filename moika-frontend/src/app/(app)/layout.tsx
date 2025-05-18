"use client";
import EmotionCacheProvider from "@/components/EmotionCacheProvider";
import AppLayout from "@/components/AppLayout";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmotionCacheProvider>
      <AppLayout>{children}</AppLayout>
    </EmotionCacheProvider>
  );
}
