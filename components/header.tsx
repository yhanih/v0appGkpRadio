"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Heart, ShoppingBag, User, LogOut, ShoppingCart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/components/auth/AuthModalManager";
import { useCart } from "@/lib/cart-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" },
  { href: "/live", label: "Live" },
  { href: "/media", label: "Media" },
  { href: "/hub", label: "Hub" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { openLogin, openSignup } = useAuthModal();
  const { getItemCount, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest(".user-menu-container")) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <div
          className={`rounded-full px-3 sm:px-5 transition-all duration-300 ${scrolled || mobileMenuOpen
            ? "bg-[#203E3F] shadow-xl shadow-black/20"
            : "bg-[#203E3F]/80 backdrop-blur-md sm:bg-[#203E3F]/90"
            }`}
        >
          <div className="flex items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C4A76C] to-[#8B7343] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm tracking-tight">
                  GK
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
              <div className="flex items-center gap-1 bg-[#1A2E2F]/50 rounded-full p-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full ${isActive
                        ? "bg-[#2A4A4B] text-white shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-[#2A4A4B]/50"
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              {/* Cart Icon */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative hidden md:flex items-center justify-center w-10 h-10 bg-[#1A2E2F] hover:bg-[#2A4A4B] rounded-full text-[#F5E3B0] hover:text-white transition-all shadow-sm hover:shadow-md"
                aria-label="Open shopping cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {getItemCount() > 99 ? '99+' : getItemCount()}
                  </span>
                )}
              </button>

              {/* Merch */}
              <Link
                href="/merch"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#1A2E2F] hover:bg-[#2A4A4B] rounded-full text-[#F5E3B0] hover:text-white text-sm transition-all group shadow-sm hover:shadow-md"
                aria-label="Open merch store"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3B2B10]">
                  <ShoppingBag className="w-4 h-4 text-[#D7B866] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
                </span>
                <span className="text-[#F5E3B0] font-medium tracking-wide">
                  Merch
                </span>
              </Link>

              {/* Auth Buttons */}
              {authLoading ? (
                <div className="hidden sm:block w-20 h-9" />
              ) : user ? (
                <div className="hidden sm:block relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full hover:bg-[#2A4A4B]/50"
                  >
                    <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="hidden md:inline">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#203E3F] border border-[#2A4A4B] rounded-xl shadow-xl overflow-hidden z-50 user-menu-container">
                      <div className="px-4 py-3 border-b border-[#2A4A4B]">
                        <p className="text-sm font-medium text-white">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/hub"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2A4A4B] hover:text-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Hub
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2A4A4B] hover:text-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile & Settings
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          await signOut();
                          setUserMenuOpen(false);
                          router.push("/");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A4A4B] hover:text-white transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </button>
              )}

              {/* Donate Button */}
              <Button
                asChild
                className="bg-white text-[#203E3F] hover:bg-gray-100 rounded-full px-4 sm:px-5 h-9 text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/donate">
                  <Heart className="w-4 h-4 fill-[#AC9258] text-[#AC9258]" />
                  <span className="hidden sm:inline">Donate</span>
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="lg:hidden p-2 text-white hover:bg-[#2A4A4B] rounded-full transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
          <div className="bg-[#203E3F] rounded-2xl shadow-xl shadow-black/20 overflow-hidden border border-[#2A4A4B]">
            <nav className="flex flex-col p-3 gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 text-sm font-medium transition-all rounded-xl ${isActive
                        ? "bg-[#2A4A4B] text-white"
                        : "text-gray-300 hover:text-white hover:bg-[#2A4A4B]/60"
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 pt-3 border-t border-[#2A4A4B]">
              <Link
                href="/merch"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2E2F] hover:bg-[#2A4A4B] rounded-xl text-[#F5E3B0] text-sm transition-all group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#3B2B10]">
                  <ShoppingBag className="w-4 h-4 text-[#D7B866] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
                </span>
                <span className="font-medium tracking-wide">Merch</span>
              </Link>
                {user ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      setMobileMenuOpen(false);
                      router.push("/");
                    }}
                    className="flex-1 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2A4A4B] transition-colors py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLogin();
                    }}
                    className="flex-1 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2A4A4B] transition-colors py-3 rounded-xl text-center"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
