import { redirect } from "next/navigation";
import AppShell from "@/components/dashboard/AppShell";
import { getOrCreateDbUser } from "@/lib/auth";
import { listUserDocuments } from "@/lib/documents";
import VaultClient from "./VaultClient";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const dbUser = await getOrCreateDbUser();
  if (!dbUser) redirect("/sign-in");

  const documents = await listUserDocuments(dbUser._id.toString());

  return (
    <AppShell title="Document Vault">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        <header>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-background">Document Vault</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            All your scanned contracts. Document text is stored encrypted.
          </p>
        </header>
        <VaultClient initialDocuments={documents} />
      </div>
    </AppShell>
  );
}
