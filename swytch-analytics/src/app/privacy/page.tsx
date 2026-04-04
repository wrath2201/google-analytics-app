import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LAST_UPDATED = "April 2, 2026";
const COMPANY = "Statsy";
const DOMAIN = "statsy.in";
const CONTACT_EMAIL = "privacy@statsy.in";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you sign in with Google via Firebase Authentication, we receive your name, email address, and profile picture. We do not store your Google password.",
      },
      {
        subtitle: "Google Analytics Data",
        text: "We access your Google Analytics properties only after you explicitly grant permission by providing your Measurement ID or completing the OAuth flow. This data is used solely to display analytics inside your dashboard.",
      },
      {
        subtitle: "Usage Data",
        text: "We collect basic usage information such as pages visited, features used, and session duration to improve the product. This data is anonymized and never sold.",
      },
      {
        subtitle: "Payment Information",
        text: "Billing is handled entirely by Stripe. We never store your credit card details on our servers. We only receive a tokenized reference from Stripe.",
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "",
        text: "We use the information we collect to: provide and maintain the Statsy service; send analytics report emails at the frequency you configure; process payments and manage your subscription; improve and debug the product; and comply with legal obligations.",
      },
    ],
  },
  {
    title: "3. Data Sharing",
    content: [
      {
        subtitle: "",
        text: "We do not sell, trade, or rent your personal information to third parties. We share data only with the following service providers, strictly to operate the product:",
      },
      {
        subtitle: "Firebase (Google)",
        text: "Used for authentication. Governed by Google's Privacy Policy.",
      },
      {
        subtitle: "Stripe",
        text: "Used for payment processing. Governed by Stripe's Privacy Policy.",
      },
      {
        subtitle: "Resend",
        text: "Used to deliver email analytics reports. Only your email address is shared.",
      },
    ],
  },
  {
    title: "4. Data Retention",
    content: [
      {
        subtitle: "",
        text: "We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it longer.",
      },
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      {
        subtitle: "",
        text: "Depending on your location, you may have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data; withdraw consent for data processing; and lodge a complaint with a supervisory authority. To exercise any of these rights, contact us at privacy@statsy.in.",
      },
    ],
  },
  {
    title: "6. Google Analytics API Usage",
    content: [
      {
        subtitle: "",
        text: "Statsy uses Google Analytics data solely to display your own analytics metrics to you. We do not use this data for advertising, profiling, or any purpose beyond rendering your dashboard. Our use of Google Analytics data complies with Google's API Services User Data Policy, including the Limited Use requirements.",
      },
    ],
  },
  {
    title: "7. Cookies",
    content: [
      {
        subtitle: "",
        text: "We use a session cookie to keep you logged in. This cookie is essential to the service and cannot be disabled. We do not use advertising or tracking cookies.",
      },
    ],
  },
  {
    title: "8. Security",
    content: [
      {
        subtitle: "",
        text: "We use industry-standard security measures including HTTPS, encrypted storage of OAuth tokens (AES-256), and JWT-based session management. While we take security seriously, no system is 100% secure.",
      },
    ],
  },
  {
    title: "9. Changes to This Policy",
    content: [
      {
        subtitle: "",
        text: "We may update this Privacy Policy from time to time. When we do, we will update the last updated date at the top of this page. If the changes are significant, we will notify you by email.",
      },
    ],
  },
  {
    title: "10. Contact Us",
    content: [
      {
        subtitle: "",
        text: "If you have any questions about this Privacy Policy, please contact us at privacy@statsy.in or write to us at statsy.in.",
      },
    ],
  },
];

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm text-[#8C8578]">Last updated: {LAST_UPDATED}</p>
            <div className="mt-6 p-4 bg-white border border-[#E5E0D8] rounded-xl">
              <p className="text-base text-[#46403A] leading-relaxed">
                {COMPANY} (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates {DOMAIN}. This Privacy Policy
                explains how we collect, use, and protect your information when you use our service.
                By using {COMPANY}, you agree to the practices described in this policy.
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl text-[#1A1814] mb-4 pb-3 border-b border-[#E5E0D8]" style={{ fontFamily: "var(--font-display)" }}>
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((item, i) => (
                    <div key={i}>
                      {item.subtitle && (
                        <p className="text-base font-semibold text-[#1A1814] mb-1">{item.subtitle}</p>
                      )}
                      <p className="text-base text-[#46403A] leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#8C8578]">© {new Date().getFullYear()} {COMPANY}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-xs text-[#8C8578] hover:text-[#1B3A6B] transition-colors duration-200 underline underline-offset-2">
                Terms of Service
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
