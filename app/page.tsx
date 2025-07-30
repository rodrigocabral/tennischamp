"use client";

import Home from "@/components/Home";
import { TournamentProvider } from "@/contexts/TournamentContext";

export default function Page() {

  return (
    <TournamentProvider>
      <Home />
    </TournamentProvider>
  );
}