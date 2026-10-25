import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import AuthShell, { clerkAuthAppearance } from "@/components/auth/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start analysing legal documents with AI — it's free"
      switchPrompt="Already have an account?"
      switchHref="/sign-in"
      switchLabel="Sign in"
    >
      <ClerkLoading>
        <div className="w-full h-[380px] rounded-xl border border-outline-variant/50 bg-surface-container flex items-center justify-center" role="status">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
          appearance={clerkAuthAppearance}
        />
      </ClerkLoaded>
    </AuthShell>
  );
}
