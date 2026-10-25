import Link from "next/link";
import Logo from "@/components/Logo";

interface AuthShellProps {
  title: string;
  subtitle: string;
  switchHref: string;
  switchLabel: string;
  switchPrompt: string;
  children: React.ReactNode;
}

const POINTS = [
  { icon: "gpp_maybe", text: "Flags risky clauses with a 0–100 risk score" },
  { icon: "translate", text: "Turns legalese into plain English" },
  { icon: "encrypted", text: "Document text is encrypted at rest (AES-256)" },
];

export default function AuthShell({
  title,
  subtitle,
  switchHref,
  switchLabel,
  switchPrompt,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-on-surface">
      {/* Brand panel (desktop only) */}
      <aside className="hidden lg:flex flex-col justify-between p-12 border-r border-outline-variant/30 bg-surface-container-lowest relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 blur-[140px] rounded-full pointer-events-none" />
        <Link href="/" className="flex items-center gap-3 relative">
          <Logo className="w-10 h-10" />
          <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            KanoonScan
          </span>
        </Link>

        <div className="relative space-y-8 max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Know what you&apos;re signing, <span className="text-primary">before</span> you sign it.
          </h2>
          <ul className="space-y-4">
            {POINTS.map((p) => (
              <li key={p.icon} className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary">{p.icon}</span>
                <span className="text-sm">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-outline">
          KanoonScan is an AI assistant, not a law firm. Always consult a lawyer for important decisions.
        </p>
      </aside>

      {/* Form panel */}
      <div className="flex flex-col min-h-screen">
        <header className="h-16 px-6 flex items-center justify-between border-b border-outline-variant/30 lg:border-none">
          <Link href="/" className="flex items-center gap-2 lg:invisible" aria-label="KanoonScan home">
            <Logo className="w-8 h-8" />
            <span className="font-display text-lg font-bold text-primary">KanoonScan</span>
          </Link>
          <p className="text-sm text-on-surface-variant">
            {switchPrompt}{" "}
            <Link href={switchHref} className="text-primary font-semibold hover:underline">
              {switchLabel}
            </Link>
          </p>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-[420px]">
            <div className="text-center mb-6 space-y-2">
              <h1 className="font-display text-3xl font-bold">{title}</h1>
              <p className="text-sm text-on-surface-variant">{subtitle}</p>
            </div>
            {children}
            <p className="text-center text-xs text-outline mt-6">
              By continuing you agree to use KanoonScan as an informational tool only.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export const clerkAuthAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full bg-surface-container border border-outline-variant/50 shadow-2xl rounded-xl",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 text-on-surface",
    socialButtonsBlockButtonText: "text-on-surface font-medium",
    formButtonPrimary:
      "bg-gradient-to-r from-primary-container to-primary hover:opacity-90 text-[#452b00] font-bold normal-case shadow-lg",
    formFieldInput:
      "bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary",
    formFieldLabel: "text-on-surface-variant font-medium",
    footer: "bg-transparent",
    footerActionText: "text-on-surface-variant",
    footerActionLink: "text-primary hover:text-secondary font-semibold",
    dividerLine: "bg-outline-variant/40",
    dividerText: "text-outline text-xs",
    identityPreviewText: "text-on-surface",
    identityPreviewEditButton: "text-primary",
    formResendCodeLink: "text-primary",
    otpCodeFieldInput: "border-outline-variant text-on-surface",
  },
};
