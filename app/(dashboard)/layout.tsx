"use client";

import Link from "next/link";
import { use, useState, Suspense, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Binary,
  Home,
  LogOut,
  ExternalLink,
  QrCode,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/app/(login)/actions";
import { useRouter } from "next/navigation";
import { User } from "@/lib/db/schema";
import useSWR from "swr";
import QRCode from "qrcode";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function VisitStoreButton() {
  const { data: user } = useSWR<User>("/api/user", fetcher);

  function getShopfrontUrl() {
    if (!user?.name) return null;

    if (typeof window === "undefined") return null;

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    // For development with localhost
    if (hostname.includes("localhost")) {
      return `${protocol}//${user.name}.localhost:${port || "3000"}`;
    }

    // For production domains
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      // For 1minute.shop domain
      if (
        parts[parts.length - 2] === "1minute" &&
        parts[parts.length - 1] === "shop"
      ) {
        return `${protocol}//${user.name}.1minute.shop`;
      }
      // For custom domains
      const domain = parts.slice(-2).join(".");
      return `${protocol}//${user.name}.${domain}`;
    }

    return null;
  }

  const shopfrontUrl = getShopfrontUrl();

  if (!shopfrontUrl) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className="text-orange-600 border-orange-200 hover:bg-orange-50"
    >
      <a href={shopfrontUrl} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="w-4 h-4 mr-2" />
        Visit Store
      </a>
    </Button>
  );
}

function QRCodeButton() {
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function getShopfrontUrl() {
    if (!user?.name) return null;

    if (typeof window === "undefined") return null;

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    // For development with localhost
    if (hostname.includes("localhost")) {
      return `${protocol}//${user.name}.localhost:${port || "3000"}`;
    }

    // For production domains
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      // For 1minute.shop domain
      if (
        parts[parts.length - 2] === "1minute" &&
        parts[parts.length - 1] === "shop"
      ) {
        return `${protocol}//${user.name}.1minute.shop`;
      }
      // For custom domains
      const domain = parts.slice(-2).join(".");
      return `${protocol}//${user.name}.${domain}`;
    }

    return null;
  }

  const generateQRCode = useCallback(async () => {
    const shopfrontUrl = getShopfrontUrl();
    if (!shopfrontUrl) return;

    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(shopfrontUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [user?.name]);

  const downloadQRCode = useCallback(() => {
    if (!qrCodeDataUrl || !user?.name) return;

    const link = document.createElement("a");
    link.download = `${user.name}-store-qr-code.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [qrCodeDataUrl, user?.name]);

  const shopfrontUrl = getShopfrontUrl();

  if (!shopfrontUrl) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={generateQRCode}
          className="text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Store QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {isGenerating ? (
            <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <QrCode className="w-8 h-8 mx-auto mb-2 animate-pulse text-gray-400" />
                <p className="text-sm text-gray-500">Generating QR code...</p>
              </div>
            </div>
          ) : qrCodeDataUrl ? (
            <>
              <div className="p-4 bg-white rounded-lg border">
                <img
                  src={qrCodeDataUrl}
                  alt="Store QR Code"
                  className="w-64 h-64"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Scan to visit{" "}
                  <span className="font-medium">{user?.name}'s store</span>
                </p>
                <p className="text-xs text-gray-400 break-all">
                  {shopfrontUrl}
                </p>
              </div>
              <Button
                onClick={downloadQRCode}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push("/");
  }

  function getShopfrontUrl() {
    if (!user?.name) return null;

    if (typeof window === "undefined") return null;

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    // For development with localhost
    if (hostname.includes("localhost")) {
      return `${protocol}//${user.name}.localhost:${port || "3000"}`;
    }

    // For production domains
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      // For 1minute.shop domain
      if (
        parts[parts.length - 2] === "1minute" &&
        parts[parts.length - 1] === "shop"
      ) {
        return `${protocol}//${user.name}.1minute.shop`;
      }
      // For custom domains
      const domain = parts.slice(-2).join(".");
      return `${protocol}//${user.name}.${domain}`;
    }

    return null;
  }

  const shopfrontUrl = getShopfrontUrl();

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Pricing
        </Link>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ""} />
          <AvatarFallback>
            {user.email
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        {shopfrontUrl && (
          <DropdownMenuItem className="cursor-pointer">
            <a
              href={shopfrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Visit Store</span>
            </a>
          </DropdownMenuItem>
        )}
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Binary className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-xl font-semibold text-gray-900">
            1 Minute
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Suspense fallback={<div className="h-9" />}>
              <VisitStoreButton />
            </Suspense>
            <Suspense fallback={<div className="h-9" />}>
              <QRCodeButton />
            </Suspense>
          </div>
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}
