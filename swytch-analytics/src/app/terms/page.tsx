import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LAST_UPDATED = "April 2, 2026";
const COMPANY = "Statsy";
const DOMAIN = "statsy.in";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using Statsy at statsy.in, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service. We reserve the right to update these terms at any time, and your continued use of the service constitutes acceptance of any changes.",
  },
  {
    title: "2. Description of Service",
    content: "Statsy is a SaaS analytics dashboard that connects to your Google Analytics account and displays your data in a unified interface. The service includes a dashboard, email reports, and property management tools. Features may vary based on your subscription plan (Free or Pro).",
  },
  {
    title: "3. Eligibility",
    content: "You must be at least 16 years old to use this service. By using Statsy, you represent that you are of legal age to form a binding contract and that all information you provide is accurate and truthful.",
  },
  {
    title: "4. User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately at legal@statsy.in if you suspect any unauthorized use of your account.",
  },
  {
    title: "5. Google Analytics Data",
    content: "When you connect your Google Analytics property, you grant Statsy read-only access to your analytics data solely for the purpose of displaying it in your dashboard and sending configured email reports. We do not modify, sell, or share your Google Analytics data with any third party.",
  },
  {
    title: "6. Acceptable Use",
    content: "You agree not to: use the service for any unlawful purpose; attempt to gain unauthorized access to any part of the service; reverse-engineer or decompile any part of the service; use automated tools to scrape data from the service; or interfere with the security or integrity of the service.",
  },
  {
    title: "7. Subscription and Billing",
    content: "Statsy offers a Free plan and a Pro plan. Pro plan billing is processed by Stripe on a recurring basis. You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period. We do not offer refunds for partial billing periods unless required by applicable law.",
  },
  {
    title: "8. Intellectual Property",
    content: "The Statsy name, logo, and all related product names and designs are trademarks of Statsy. The source code is open-source and available under the MIT License. Your Google Analytics data remains your property at all times.",
  },
  {
    title: "9. Disclaimer of Warranties",
    content: "Statsy is provided as is and as available without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free, or that analytics data will be 100% accurate.",
  },
  {
    title: "10. Limitation of Liability",
    content: "To the maximum extent permitted by law, Statsy shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you in the three months preceding the claim.",
  },
  {
    title: "11. Termination",
    content: "We reserve the right to suspend or terminate your account if you violate these Terms. You may delete your account at any time from the Settings page. Upon termination, your data will be deleted within 30 days.",
  },
  {
    title: "12. Governing Law",
    content: "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in India.",
  },
  {
    title: "13. Contact",
    content: "For questions about these Terms of Service, please contact us at legal@statsy.in.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F0]">
      <nav className="fixed top-0 left-0 right-0 z-30 bg-[#FAF8F4]/90 backdrop-blur-md border-b border-[#E5E0D8]">
        <div className="w-full h-14 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 h-14 px-6 border-r border-[#E5E0D8] hover:bg-[#EDE8E0] transition-all duration-200 cursor-pointer group">
              <Logo iconSize="w-7 h-7" textSize="text-lg" />
            </div>
          </Link>
          <Link href="/">
            <button className="flex items-center gap-2 h-14 px-6 text-xs font-bold tracking-widest uppercase text-[#6B6760] border-l border-[#E5E0D8] hover:bg-[#EDE8E0] hover:text-[#1A1814] transition-all duration-200 cursor-pointer">
              <ArrowLeft size={13} />
              Back to Home
            </button>
          </Link>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-[#C4956A] font-medium mb-3">
              Legal
            </p>
            <h1 className="text-4xl md:text-5xl text-[#1A1814] mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Terms of Service
            </h1>
            <p className="text-sm text-[#8C8578]">Last updated: {LAST_UPDATED}</p>
            <div className="mt-6 p-4 bg-white border border-[#E5E0D8] rounded-xl">
              <p className="text-base text-[#46403A] leading-relaxed">
                Please read these Terms of Service carefully before using {COMPANY}. These terms
                govern your access to and use of our service, including any content, functionality,
                and services offered on or through {DOMAIN}.
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl text-[#1A1814] mb-4 pb-3 border-b border-[#E5E0D8]" style={{ fontFamily: "var(--font-display)" }}>
                  {section.title}
                </h2>
                <p className="text-base text-[#46403A] leading-relaxed">{section.content}</p>
              </section>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#8C8578]">© {new Date().getFullYear()} {COMPANY}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-[#8C8578] hover:text-[#1B3A6B] transition-colors duration-200 underline underline-offset-2">
                Privacy Policy
              </Link>
              <Link href="/" className="text-xs text-[#8C8578] hover:text-[#1B3A6B] transition-colors duration-200">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
