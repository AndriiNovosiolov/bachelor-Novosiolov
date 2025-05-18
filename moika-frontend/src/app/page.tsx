"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
    } else {
      router.replace("/dashboard");
    }
  }, [router]);
  return null;
}
