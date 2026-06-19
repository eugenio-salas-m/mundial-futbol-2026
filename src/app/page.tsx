"use client";

import { useEffect, useState } from "react";

import GoogleLoginButton from "@/components/google-login-button";
import AuthenticatedHome from "@/components/authenticated-home";
import { createClient } from "@/lib/supabase-client";

export default function Home() {

  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {

    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {

      setAuthenticated(
        !!data.session
      );

    });

  }, []);

  return (

    <main className="min-h-screen flex flex-col items-center justify-center gap-6">

      <h1 className="text-4xl font-bold">
        Mundial 2026
      </h1>

      {authenticated
        ? <AuthenticatedHome />
        : <GoogleLoginButton />
      }

    </main>

  );

}