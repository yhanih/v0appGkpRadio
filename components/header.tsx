"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Heart } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" },
  { href: "/live", label: "Live" },
  { href: "/programs", label: "Podcasts" },
  { href: "/video", label: "Videos" },
  { href: "/hub", label: "Hub" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              {/* Search */}
              <button
                type="button"
                className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-[#1A2E2F]/60 hover:bg-[#2A4A4B] rounded-full text-gray-400 hover:text-gray-200 text-sm transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
                <span className="text-gray-500">Search...</span>
              </button>

              {/* Sign In */}
              <button
                type="button"
                className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </button>

              {/* Donate Button */}
              <Button className="bg-white text-[#203E3F] hover:bg-gray-100 rounded-full px-4 sm:px-5 h-9 text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                <Heart className="w-4 h-4 fill-[#AC9258] text-[#AC9258]" />
                <span className="hidden sm:inline">Donate</span>
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
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2E2F] hover:bg-[#2A4A4B] rounded-xl text-gray-300 text-sm transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button
                  type="button"
                  className="flex-1 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2A4A4B] transition-colors py-3 rounded-xl"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
