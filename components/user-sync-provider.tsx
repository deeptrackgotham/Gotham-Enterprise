"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncUserToDb } from "@/lib/api";

export default function UserSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      syncUserToDb({
        email: user.primaryEmailAddress?.emailAddress || "",
        fullName: user.fullName || "",
        imageUrl: user.imageUrl,
      }).catch((error) => {
        console.error("Failed to sync user:", error);
      });
    }
  }, [isSignedIn, user]);

  return <>{children}</>;
}
