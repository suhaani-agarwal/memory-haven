import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js";
import { redirect } from "next/navigation";
import { MemoryJournalApp } from "@/components/MemoryJournalApp";

export default async function JournalPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  return <MemoryJournalApp />;
}