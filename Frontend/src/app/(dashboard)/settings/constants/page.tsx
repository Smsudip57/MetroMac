"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Constants() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to departments by default
    router.replace("/settings/constants/roles");
  }, [router]);

  return <></>;
}
