import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Navbar */}
      <nav className="w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="w-9 h-9" />
            <div className="flex flex-col">
              <span className="text-xl font-display-lg text-headline-md bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
                KanoonScan
              </span>
              <span className="text-[10px] uppercase tracking-widest text-outline font-data-mono mt-1">
                Know Before You Sign
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/sign-in">
              <button className="hairline-gold px-5 py-2 text-sm font-label-caps text-primary font-medium rounded-DEFAULT hover:bg-primary/5 transition-all">
                Login
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 py-12">
        <div className="w-full max-w-[460px] mx-auto flex flex-col items-center justify-center">
          {/* Header */}
          <div className="text-center space-y-3 mb-8 w-full">
            <h1 className="text-3xl font-display-lg font-bold text-on-surface">Create Your Account</h1>
            <p className="font-body-sm text-on-surface-variant">Start analyzing legal documents with AI</p>
          </div>

          {/* Clerk SignUp Component */}
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full flex justify-center",
                cardBox: "w-full flex justify-center",
                card: "bg-surface border-2 border-primary/20 shadow-2xl rounded-xl w-full p-6",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface font-semibold rounded-lg",
                socialButtonsBlockButtonText: "text-on-surface",
                formButtonPrimary: "bg-gradient-to-r from-primary-container to-primary hover:opacity-90 text-[#452b00] font-bold py-3 shadow-lg rounded-lg border-none cursor-pointer",
                formFieldInput: "bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-outline rounded-lg",
                formFieldLabel: "text-on-surface-variant font-medium",
                footerActionLink: "text-primary hover:text-secondary font-semibold",
                footerActionText: "text-on-surface-variant",
                dividerLine: "bg-outline-variant/30",
                dividerText: "text-outline text-xs",
              },
            }}
          />

          {/* Footer */}
          <p className="text-center text-xs text-outline mt-6">
            By signing up, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline font-semibold">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="text-primary hover:underline font-semibold">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
