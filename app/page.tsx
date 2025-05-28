"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Database, Binary } from "lucide-react";
import Link from "next/link";
import { Terminal } from "./(dashboard)/terminal";

function getSubdomainFromHost(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  // For development with custom hosts (e.g., shop1.localhost)
  if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
    const subdomain = parts[0];
    return subdomain === "localhost" ? null : subdomain;
  }

  // For 1minute.shop domain (e.g., shop1.1minute.shop)
  if (
    parts.length >= 3 &&
    parts[parts.length - 2] === "1minute" &&
    parts[parts.length - 1] === "shop"
  ) {
    const subdomain = parts[0];
    return subdomain === "www" ? null : subdomain;
  }

  // For production domains (e.g., shop1.example.com)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  isRecommended,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  isRecommended?: boolean;
}) {
  return (
    <div
      className={`relative pt-6 pb-6 px-6 rounded-lg border ${
        isRecommended
          ? "border-orange-500 border-2 bg-orange-50"
          : "border-gray-200"
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Recommended
          </span>
        </div>
      )}
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        ${price / 100}{" "}
        <span className="text-xl font-normal text-gray-600">
          per user / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/sign-up">
        <Button className="w-full rounded-full bg-orange-500 hover:bg-orange-600">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

function LandingPage({ currentHost }: { currentHost: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Binary className="h-6 w-6 text-orange-500 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">1minute.shop</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-5xl">
                  From Idea to Online Store
                  <span className="block text-orange-500">in 60 Seconds</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Set up your business's online store in under a minute. Choose
                  between our free, self-hosted solution or a fully managed
                  cloud service.{" "}
                  <span className="text-orange-500 underline">
                    {" "}
                    No coding required
                  </span>{" "}
                  —just instant results.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col gap-4">
                  <a
                    href="https://github.com/1minshop/sink.git"
                    target="_blank"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg rounded-full"
                    >
                      Free Self-Hosted (GitHub)
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <a href="http://1minute.shop/sign-up" target="_blank">
                    <Button
                      size="lg"
                      variant="default"
                      className="text-lg rounded-full bg-orange-500 text-white"
                    >
                      Cloud Hosted (1-Minute Setup)
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <Terminal />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                  <svg viewBox="0 0 24 24" className="h-6 w-6">
                    <path
                      fill="currentColor"
                      d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"
                    />
                  </svg>
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Modern Tech Stack
                  </h2>
                  <p className="mt-2 text-base text-gray-500">
                    Built with Next.js and React for blazing-fast performance
                    and a seamless user experience.
                  </p>
                </div>
              </div>

              <div className="mt-10 lg:mt-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                  <Database className="h-6 w-6" />
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Reliable Data & Scalability
                  </h2>
                  <p className="mt-2 text-base text-gray-500">
                    Powered by Postgres and Drizzle ORM for robust data
                    management and effortless scaling as your shop grows.
                  </p>
                </div>
              </div>

              <div className="mt-10 lg:mt-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-gray-900">
                    Instant Payments
                  </h2>
                  <p className="mt-2 text-base text-gray-500">
                    Integrated with Stripe for secure, seamless payment
                    processing and subscription management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Choose the plan that works best for your business
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <PricingCard
                name="Base"
                price={100}
                interval="month"
                trialDays={12}
                features={[
                  "Unlimited Usage",
                  "Unlimited Products",
                  "Unlimited Orders",
                  "Email Support",
                ]}
                isRecommended={true}
              />
              <PricingCard
                name="Plus"
                price={1000}
                interval="month"
                trialDays={7}
                features={[
                  "Everything in Base, and:",
                  "AI Assistant",
                  "International Payments",
                  "24/7 Support",
                ]}
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Get Your Shop Online—Fast ⚡
                </h2>
                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                  Whether you want full control with our open-source,
                  self-hosted option or prefer a hassle-free cloud experience,
                  you can launch your e-commerce business in just one minute.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
                <a href="https://github.com/1minshop/sink.git" target="_blank">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full"
                  >
                    Explore on GitHub
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-8 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center">
              <p className="text-sm text-gray-500 font-bold">
                Made in Bhutan 🇧🇹 with ❤️
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function HomePage() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const detectedSubdomain = getSubdomainFromHost();
    setSubdomain(detectedSubdomain);

    // If subdomain detected, redirect to /shop
    if (detectedSubdomain) {
      router.push("/shop");
    }
  }, [router]);

  // Don't render anything on server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  // If subdomain is detected, show loading while redirecting
  if (subdomain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const currentHost = isClient ? window.location.host : "1minute.shop";

  // Show landing page for main domain
  return <LandingPage currentHost={currentHost} />;
}
