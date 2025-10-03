"use client";

import Image from "next/image";
import { LogOut, LogIn, UserPlus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white dark:bg-black border-b border-slate-200 dark:border-gray-800 shadow-sm">
      {/* Left side: Logo + Branding */}
      <div className="flex items-center gap-3">
        <Image
          src="/logo-light.ico"
          alt="Deeptrack Logo Light"
          width={40}
          height={40}
          className="rounded-md block dark:hidden"
        />
        <Image
          src="/logo-dark.jpg"
          alt="Deeptrack Logo Dark"
          width={40}
          height={40}
          className="rounded-md hidden dark:block"
        />

        <div className="flex flex-col">
          <span className="text-lg font-semibold text-black dark:text-white leading-tight">
            Deeptrack Gotham
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 -mt-0.5">
            Deepfakes Detection
          </span>
        </div>
      </div>

      {/* Right side (desktop) */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-500 dark:hover:text-slate-400"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-500 dark:hover:text-slate-400"
        >
          Dashboard
        </Link>

        {isSignedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center">
                <Image
                  src={user.imageUrl || "/avatar.png"}
                  alt={user.fullName || "User Avatar"}
                  width={36}
                  height={36}
                  className="rounded-full border border-gray-300 dark:border-gray-600"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2 text-sm">
                <p className="font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-500">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <DropdownMenuItem onClick={() => signOut()} className="bg-red-500/90 dark:bg-red-500/70">
                <LogOut className="h-4 w-4 mr-2 dark:text-white" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-500 dark:hover:text-slate-400"
              >
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Log In
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Sign Up
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <ThemeToggle />
      </div>

      {/* Mobile menu (hamburger) */}
      <div className="flex md:hidden items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/">Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            {isSignedIn ? (
              <>
                <DropdownMenuItem onClick={() => signOut()} className="bg-red-500/90 dark:bg-red-500/70">
                  <LogOut className="h-4 w-4 mr-2 dark:text-white " /> Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" /> Log In
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/signup">
                    <UserPlus className="h-4 w-4 mr-2" /> Sign Up
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
