"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { FileBarChart, LineChart, LogIn, Menu, X } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { Text } from "@/components/ui/typography";
import { NavHorizontal } from "@/components/layout/nav-horizontal";
import { headerNav } from "@/lib/navigation";

export function Header() {
  const { data: session } = useSession();
  const [openNameMenu, setOpenNameMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLElement>(null);

  const userName = session?.user?.name ?? session?.user?.email ?? "";

  const handleBlur = (e: React.FocusEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget as Node)) {
      setOpenNameMenu(false);
    }
  };

  return (
    <header className="py-6 max-md-tab:py-4" ref={dropdownRef}>
      <Container>
        <Wrapper className="flex items-center justify-between p-4 max-md-mobile:px-2 bg-white rounded-xl">
          <Wrapper className="hidden w-8 max-md-tab:block flex-1">
            <button className="block" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu className="w-8 h-8 text-black" />
            </button>
          </Wrapper>
          <Wrapper className="min-w-[171px] max-lg:flex-1 max-md-tab:flex max-md-tab:justify-center">
            <Link aria-label="Home" href="/">
              <Image
                src="/images/SEOGenie.png"
                alt="SEOGENIE"
                width={171}
                height={36}
                loading="eager"
                fetchPriority="high"
              />
            </Link>
          </Wrapper>
          <Wrapper className="max-3xl:w-full max-md-tab:hidden">
            <NavHorizontal items={headerNav} />
          </Wrapper>
          <Wrapper className="flex gap-[17px] max-lg:flex-1 items-center max-md-tab:flex max-md-tab:justify-end">
            {session ? (
              <Wrapper className="relative">
                <button
                  type="button"
                  aria-label="User menu"
                  onClick={() => setOpenNameMenu((v) => !v)}
                  onBlur={handleBlur}
                  className="
      group flex items-center gap-2.5 rounded-full
      border border-gray-200 bg-white
      py-1.5 pl-1.5 pr-3
      max-md-mobile:p-0.5!
      transition-all duration-200
      hover:border-gray-300 hover:bg-gray-50
      focus:outline-none focus:ring-2 focus:ring-dark-100/10
    "
                >
                  {/* Avatar */}
                  <Wrapper
                    className="
        flex h-8 w-8 min-h-8 min-w-8 
        items-center justify-center rounded-full
        bg-dark-100 text-sm font-bold uppercase text-white
        shadow-sm
      "
                  >
                    {userName.slice(0, 1)}
                  </Wrapper>

                  {/* User Name */}
                  <Text className="max-w-[140px] max-md-mobile:hidden truncate text-sm font-semibold capitalize tracking-normal text-gray-800">
                    {userName}
                  </Text>

                  {/* Chevron */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-4 w-4 max-md-mobile:hidden text-gray-400 transition-transform duration-200 ${
                      openNameMenu ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                {openNameMenu && (
                  <div
                    className="
        absolute right-0 top-[calc(100%+8px)] z-50
        w-56 overflow-hidden rounded-xl
        border border-gray-200 bg-white
        p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.10)]
      "
                  >
                    {/* User Info */}
                    <div className="border-b border-gray-100 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold capitalize text-gray-900">
                        {userName}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">Manage your account</p>
                    </div>

                    {/* Menu */}
                    <ul className="py-1.5">
                      <li>
                        <Link
                          aria-label="Go to My Keywords"
                          href="/keyword-planner/collections"
                          onClick={() => setOpenNameMenu(false)}
                          className="
              flex items-center gap-2.5 rounded-lg
              px-3 py-2.5
              text-sm font-medium text-gray-700
              transition-colors duration-150
              hover:bg-gray-100 hover:text-gray-900
            "
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4.5 w-4.5 text-gray-500"
                          >
                            <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                          </svg>
                          My Keywords
                        </Link>
                        <Link
                          aria-label="Go to My Content"
                          href="/content-writer/history"
                          onClick={() => setOpenNameMenu(false)}
                          className="
              flex items-center gap-2.5 rounded-lg
              px-3 py-2.5
              text-sm font-medium text-gray-700
              transition-colors duration-150
              hover:bg-gray-100 hover:text-gray-900
            "
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4.5 w-4.5 text-gray-500"
                          >
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6M8 13h8M8 17h6" />
                          </svg>
                          My Content
                        </Link>
                        <Link
                          aria-label="Go to My Reports"
                          href="/domain-analysis/reports"
                          onClick={() => setOpenNameMenu(false)}
                          className="
              flex items-center gap-2.5 rounded-lg
              px-3 py-2.5
              text-sm font-medium text-gray-700
              transition-colors duration-150
              hover:bg-gray-100 hover:text-gray-900
            "
                        >
                          <FileBarChart className="h-4.5 w-4.5 text-gray-500" aria-hidden="true" />
                          My Reports
                        </Link>
                        <Link
                          aria-label="Go to Rank Tracker"
                          href="/rank-tracker/packs"
                          onClick={() => setOpenNameMenu(false)}
                          className="
              flex items-center gap-2.5 rounded-lg
              px-3 py-2.5
              text-sm font-medium text-gray-700
              transition-colors duration-150
              hover:bg-gray-100 hover:text-gray-900
            "
                        >
                          <LineChart className="h-4.5 w-4.5 text-gray-500" aria-hidden="true" />
                          Rank Tracker
                        </Link>
                      </li>

                      <li className="mt-1 border-t border-gray-100 pt-1">
                        <button
                          aria-label="Sign out"
                          type="button"
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="
              flex w-full items-center gap-2.5 rounded-lg
              px-3 py-2.5
              text-left text-sm font-medium text-red-600
              transition-colors duration-150
              hover:bg-red-50
            "
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4.5 w-4.5"
                          >
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <path d="M16 17l5-5-5-5M21 12H9" />
                          </svg>
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </Wrapper>
            ) : (
              <button
                aria-label="Sign up or log in"
                onClick={() => signIn("google")}
                className="pt-[7px] max-md-mobile:p-0! max-md-mobile:w-8 max-md-mobile:h-8 max-md-mobile:flex max-md-mobile:justify-center max-md-mobile:items-center pb-2 px-[21px] text-center block text-base leading-[21.28px] font-normal rounded-[9px] border border-dark-100 transition-colors duration-300 whitespace-nowrap bg-dark-100 text-white hover:bg-transparent hover:text-dark-100"
              >
                <span className="max-md-mobile:hidden">Sign up / Log in</span>

                <LogIn className="max-md-mobile:block hidden" />
              </button>
            )}
          </Wrapper>
        </Wrapper>
      </Container>
      {menuOpen && (
        <Wrapper className="fixed top-0 left-0 z-[99999999] w-full h-full backdrop-blur-xl bg-dark-100/80">
          <button
            className="absolute top-3 right-3 z-30"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="text-white w-8 h-8" />
          </button>
          <Wrapper className="pt-16 px-6">
            <ul className="mb-8 flex flex-col gap-6">
              {headerNav.map((item) => (
                <li key={item.link}>
                  <Link
                    aria-label={`Go to ${item.label}`}
                    href={item.link}
                    className="text-xl text-lightblue-100 font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Wrapper>
        </Wrapper>
      )}
    </header>
  );
}
