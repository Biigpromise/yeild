
import { useState } from "react";
import { User, Session } from "@supabase/supabase-js";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  return {
    user,
    session,
    loading,
    setUser,
    setSession,
    setLoading,
  };
};
