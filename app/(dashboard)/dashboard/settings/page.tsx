"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import AppShell from "@/components/dashboard/AppShell";
import ConfirmDialog from "@/components/ui/confirm-dialog";

function Row({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/50">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-on-surface">{title}</p>
          <p className="text-xs text-on-surface-variant">{body}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "—";
  const email = user?.primaryEmailAddress?.emailAddress || "—";
  const hasPassword = user?.passwordEnabled;
  const twoFactor = user?.twoFactorEnabled;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/user/delete-account", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Deletion failed");
      await signOut({ redirectUrl: "/" });
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred while deleting your account.");
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <AppShell title="Settings">
      <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
        <header>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-background">Settings</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage your profile, sign-in security and data.</p>
        </header>

        {error && (
          <div role="alert" className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Profile */}
        <section className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-on-surface">Profile</h3>
              <p className="text-on-surface-variant text-xs mt-0.5">Your name and email come from your sign-in account.</p>
            </div>
            <button onClick={() => openUserProfile()} className="btn-secondary !py-2">
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Edit profile
            </button>
          </div>
          <div className="p-5 flex items-center gap-4">
            {isLoaded && user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="" className="size-14 rounded-full border border-primary/30 object-cover" />
            ) : (
              <div className="size-14 rounded-full bg-surface-variant animate-pulse" />
            )}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1 min-w-0">
              <div className="min-w-0">
                <dt className="text-[11px] uppercase tracking-widest text-outline font-data-label">Name</dt>
                <dd className="text-sm text-on-surface truncate">{isLoaded ? displayName : "…"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[11px] uppercase tracking-widest text-outline font-data-label">Email</dt>
                <dd className="text-sm text-on-surface truncate">{isLoaded ? email : "…"}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Security */}
        <section className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
          <div className="p-5 border-b border-outline-variant/40">
            <h3 className="font-bold text-on-surface">Security</h3>
            <p className="text-on-surface-variant text-xs mt-0.5">Password, two-factor authentication and active sessions.</p>
          </div>
          <div className="p-5 space-y-3">
            <Row
              icon="password"
              title="Password"
              body={hasPassword ? "A password is set for your account." : "You sign in with a social account or email code."}
              action={
                <button onClick={() => openUserProfile()} className="btn-secondary !py-2 shrink-0">
                  {hasPassword ? "Change password" : "Set password"}
                </button>
              }
            />
            <Row
              icon="verified_user"
              title="Two-factor authentication"
              body={twoFactor ? "Enabled — your account is protected with a second factor." : "Not enabled. Add an authenticator app for extra protection."}
              action={
                <button onClick={() => openUserProfile()} className="btn-secondary !py-2 shrink-0">
                  {twoFactor ? "Manage" : "Enable"}
                </button>
              }
            />
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded-xl border border-error/30 bg-error/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-error">Delete account</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 max-w-md">
              Permanently deletes your login, every document, analysis, saved clause and chat. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => {
              setConfirmText("");
              setConfirmOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-error text-on-error font-bold text-sm hover:opacity-90 focus-ring shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            Delete account
          </button>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete your account?"
        destructive
        loading={isDeleting}
        confirmDisabled={confirmText !== "DELETE"}
        confirmLabel={isDeleting ? "Deleting…" : "Delete everything"}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => confirmText === "DELETE" && handleDeleteAccount()}
        description={
          <div className="space-y-3">
            <p>This removes your login and all of your data from KanoonScan.</p>
            <label className="block">
              <span className="text-xs">
                Type <span className="font-bold text-on-surface">DELETE</span> to confirm
              </span>
              <input
                className="field mt-1.5 !py-2"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
            </label>
          </div>
        }
      />
    </AppShell>
  );
}
