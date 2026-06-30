"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "analysis" | "notifications">("general");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirm("WARNING: Are you absolutely sure you want to delete your account? This will permanently delete all your documents, analysis results, and logs. This action is completely IRREVERSIBLE under GDPR regulation.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
      });
      if (res.ok) {
        alert("Account and all associated records have been successfully purged from our databases. You will now be redirected.");
        window.location.href = "/";
      } else {
        const data = await res.json();
        alert(`Deletion failed: ${data.error || "Unknown error"}`);
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred during data deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get user display name
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.username || "Legal Counsel";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1326] text-on-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Top Bar */}
        <TopBar />

        {/* Content Canvas */}
        <div className="p-8 max-w-4xl mx-auto w-full space-y-gutter">
          {/* Page Header */}
          <header className="mb-stack-lg">
            <h2 className="font-headline-xl text-headline-xl text-on-background mb-2">Settings</h2>
            <p className="font-body-lg text-on-surface-variant">Manage your institutional intelligence environment and security protocols.</p>
          </header>

          {/* Settings Navigation Tabs */}
          <div className="flex flex-wrap gap-6 mb-stack-lg border-b border-outline-variant pb-2">
            <button 
              className={`pb-2 px-1 transition-all text-sm font-semibold border-b-2 ${
                activeTab === "general" ? "text-primary border-primary" : "text-on-surface-variant hover:text-primary border-transparent"
              }`}
              onClick={() => setActiveTab("general")}
            >
              General
            </button>
            <button 
              className={`pb-2 px-1 transition-all text-sm font-semibold border-b-2 ${
                activeTab === "security" ? "text-primary border-primary" : "text-on-surface-variant hover:text-primary border-transparent"
              }`}
              onClick={() => setActiveTab("security")}
            >
              Security
            </button>
            <button 
              className={`pb-2 px-1 transition-all text-sm font-semibold border-b-2 ${
                activeTab === "analysis" ? "text-primary border-primary" : "text-on-surface-variant hover:text-primary border-transparent"
              }`}
              onClick={() => setActiveTab("analysis")}
            >
              AI Analysis
            </button>
            <button 
              className={`pb-2 px-1 transition-all text-sm font-semibold border-b-2 ${
                activeTab === "notifications" ? "text-primary border-primary" : "text-on-surface-variant hover:text-primary border-transparent"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              Notifications
            </button>
          </div>

          <div className="space-y-gutter">
            {/* General Section */}
            {activeTab === "general" && (
              <section className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden shadow-xl">
                <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
                  <div>
                    <h3 className="text-md font-bold text-on-surface">Profile Identity</h3>
                    <p className="text-on-surface-variant text-xs mt-0.5">Update your account identification details.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container flex items-center justify-center border border-primary/20">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "size-full rounded-full",
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-data-label text-on-surface-variant uppercase mb-2 font-data-label text-[11px] tracking-widest">Legal Professional Name</label>
                      <input 
                        className="w-full bg-[#0b1326]/50 border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm" 
                        type="text" 
                        defaultValue={displayName}
                      />
                    </div>
                    <div>
                      <label className="block text-data-label text-on-surface-variant uppercase mb-2 font-data-label text-[11px] tracking-widest">Institutional Email</label>
                      <input 
                        className="w-full bg-[#0b1326]/50 border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm opacity-80 cursor-not-allowed" 
                        type="email" 
                        defaultValue={user?.primaryEmailAddress?.emailAddress || "counsel@kanoonscan.ai"}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-outline-variant/20">
                    <button className="bg-primary-container text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95">
                      Save Changes
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Security Section */}
            {activeTab === "security" && (
              <section className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden shadow-xl">
                <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/50">
                  <h3 className="text-md font-bold text-on-surface">Security & Authentication</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5">Manage encryption keys and access protocols.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#0b1326]/30 rounded-lg border border-outline-variant/50">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary text-3xl">password</span>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">Change Password</p>
                        <p className="text-xs text-on-surface-variant">Update your account credential regularly.</p>
                      </div>
                    </div>
                    <button className="border border-primary text-primary font-semibold text-xs px-4 py-2 rounded-lg hover:bg-primary/10 transition-all">
                      Reset Password
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#0b1326]/30 rounded-lg border border-outline-variant/50">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-tertiary text-3xl">verified_user</span>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">Two-Factor Authentication (2FA)</p>
                        <p className="text-xs text-on-surface-variant">Secure your repository with app-based verification codes.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        twoFactor ? "bg-primary" : "bg-[#2d3449]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          twoFactor ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></span>
                    </button>
                  </div>

                  {/* Danger Zone - GDPR Compliance */}
                  <div className="pt-6 border-t border-outline-variant/30 mt-6">
                    <h4 className="text-sm font-bold text-error mb-2 uppercase tracking-wider font-data-label text-[11px]">Danger Zone</h4>
                    <div className="flex items-center justify-between p-4 bg-error/5 rounded-lg border border-error/20">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">Delete Account & All Data</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">Permanently delete your profile, vault, analyses, and history. This is irreversible under GDPR Right to be Forgotten.</p>
                      </div>
                      <button 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-error text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting..." : "Purge My Data"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* AI Analysis Section */}
            {activeTab === "analysis" && (
              <section className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden shadow-xl">
                <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/50">
                  <h3 className="text-md font-bold text-on-surface">AI Model Configuration</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5">Fine-tune extraction algorithms and risk sensitivity metrics.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-data-label text-on-surface-variant uppercase mb-2 font-data-label text-[11px] tracking-widest">Playbook Template Mode</label>
                    <select className="w-full bg-[#0b1326]/50 border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm">
                      <option className="bg-[#0b1326]">Standard Commercial Agreements</option>
                      <option className="bg-[#0b1326]">Strict NDA & Confidentiality</option>
                      <option className="bg-[#0b1326]">Employment Agreements</option>
                      <option className="bg-[#0b1326]">M&A Due Diligence Playbook</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#0b1326]/30 rounded-lg border border-outline-variant/50">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">Deep Analysis Level</p>
                        <p className="text-xs text-on-surface-variant">Enable deeper scanning logic (takes slightly longer).</p>
                      </div>
                    </div>
                    <div className="size-6 bg-tertiary/20 text-tertiary flex items-center justify-center rounded-full text-xs font-bold font-data-label">
                      ON
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Notifications Section */}
            {activeTab === "notifications" && (
              <section className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden shadow-xl">
                <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/50">
                  <h3 className="text-md font-bold text-on-surface">Communication Preferences</h3>
                  <p className="text-on-surface-variant text-xs mt-0.5">Determine when and how you receive alerts.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-on-surface">Email Alerts</p>
                      <p className="text-xs text-on-surface-variant">Receive alerts when document scan finishes processing.</p>
                    </div>
                    <button 
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        emailNotifications ? "bg-primary" : "bg-[#2d3449]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          emailNotifications ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-on-surface">Weekly Compliance Digest</p>
                      <p className="text-xs text-on-surface-variant">A summary digest of compliance risks identified across all documents.</p>
                    </div>
                    <button 
                      onClick={() => setWeeklySummary(!weeklySummary)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        weeklySummary ? "bg-primary" : "bg-[#2d3449]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          weeklySummary ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
