"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
}

const desktopLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contribute", label: "How to Help" },
];

export default function PageShell({ children, title }: PageShellProps) {
  const pathname = usePathname();

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Skip link */}
      <a
        href="#page-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-green-700 focus:font-medium"
      >
        Skip to content
      </a>

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded"
            aria-label="Back to map"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Map</span>
            <span className="sm:hidden">Map</span>
          </Link>
          {title && (
            <>
              <span className="text-gray-300" aria-hidden="true">|</span>
              <span className="text-sm font-semibold text-gray-900 truncate">{title}</span>
            </>
          )}

          {/* Desktop nav */}
          <nav aria-label="Site navigation" className="hidden sm:flex items-center gap-4 ml-auto text-sm">
            {desktopLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded ${
                    isActive
                      ? "text-green-700 font-medium"
                      : "text-gray-500 hover:text-green-700"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main id="page-content" className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-16 sm:pb-8">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
