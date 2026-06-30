import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b1326] text-on-background">
      {/* Navbar - Same as Landing Page */}
      <nav className="w-full z-50 bg-[#0b1326]/70 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="w-9 h-9" />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-primary leading-none">
                KanoonScan
              </span>
              <span className="text-[10px] uppercase tracking-widest text-outline font-medium mt-1">
                Know Before You Sign
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/sign-in">
              <button className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-all animate-pulse">
                Login
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-[460px] mx-auto">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl font-headline-xl text-on-background">Create Your Account</h1>
            <p className="text-on-surface-variant">Start analyzing legal documents with AI</p>
          </div>

          {/* Clerk SignUp Component */}
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-surface-container/60 backdrop-blur-md border border-outline-variant shadow-2xl rounded-xl",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-surface-container-low hover:bg-surface-variant border border-outline-variant text-on-surface font-semibold rounded-lg",
                socialButtonsBlockButtonText: "text-on-surface",
                formButtonPrimary: "bg-primary hover:bg-primary/95 text-[#002a78] font-bold py-3 shadow-lg rounded-lg border-none cursor-pointer",
                formFieldInput: "bg-[#0b1326]/50 border border-outline-variant text-on-surface placeholder:text-outline rounded-lg",
                formFieldLabel: "text-on-surface-variant font-medium",
                footerActionLink: "text-primary hover:text-primary/80 font-semibold",
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
