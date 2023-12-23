import { type AppType } from "next/app";
import { Karla } from "next/font/google";
import { api } from "~/utils/api";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import "~/styles/globals.css";
import { Session } from "@supabase/supabase-js";
import { supabase } from "~/server/auth/auth";
type PageProps = {
  initialSession: Session;
};

const karla = Karla({ subsets: ["latin"] });

const MyApp: AppType<PageProps> = ({ Component, pageProps }) => {
  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <main className={karla.className}>
        <Component {...pageProps} />
      </main>
    </SessionContextProvider>
  );
};

export default api.withTRPC(MyApp);
