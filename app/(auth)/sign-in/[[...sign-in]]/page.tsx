import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import AuthShell, { clerkAuthAppearance } from "@/components/auth/AuthShell";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue analysing your documents"
      switchPrompt="New here?"
      switchHref="/sign-up"
      switchLabel="Create an account"
    >
      <ClerkLoading>
        <div className="w-full h-[380px] rounded-xl border border-outline-variant/50 bg-surface-container flex items-center justify-center" role="status">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
          appearance={clerkAuthAppearance}
        />
      </ClerkLoaded>
    </AuthShell>
  );
}
