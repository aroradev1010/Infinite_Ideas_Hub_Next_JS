"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  ScanEye,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePreviewMode } from "@/components/preview/PreviewModeProvider";

type MenuItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const authorItems: MenuItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/posts", icon: FileText, label: "Posts" },
  { href: "/dashboard/create", icon: NotebookPen, label: "Create Post" },
];

const adminItems: MenuItem[] = [
  { href: "/admin", icon: ShieldCheck, label: "Admin Dashboard" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Author Dashboard" },
  { href: "/dashboard/posts", icon: FileText, label: "My Posts" },
  { href: "/dashboard/create", icon: NotebookPen, label: "Create Post" },
  { href: "/admin/posts", icon: FileText, label: "Manage Posts" },
  { href: "/admin/authors", icon: CircleUserRound, label: "Manage Authors" },
  { href: "/admin/users", icon: Users, label: "Manage Users" },
];

const previewItems: MenuItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/posts", icon: FileText, label: "Posts" },
  { href: "/dashboard/create", icon: NotebookPen, label: "Create Post" },
  { href: "/admin", icon: ShieldCheck, label: "Admin Dashboard" },
  { href: "/admin/posts", icon: FileText, label: "Manage Posts" },
  { href: "/admin/authors", icon: CircleUserRound, label: "Manage Authors" },
];

const itemsByRole: Record<string, MenuItem[]> = {
  admin: adminItems,
  author: authorItems,
};

interface UserMenuProps {
  onOpen?: () => void;
  previewMode?: boolean;
  user?: Session["user"];
}

export function getUserMenuItems(
  role: string | undefined,
  previewMode: boolean
): MenuItem[] {
  return previewMode ? previewItems : itemsByRole[role ?? ""] ?? [];
}

function getInitials(name?: string | null) {
  if (!name?.trim()) return null;

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserMenu({ onOpen, previewMode = false, user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { exitPreviewMode } = usePreviewMode();
  const items = getUserMenuItems(user?.role, previewMode);
  const initials = getInitials(user?.name);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!previewMode && !user) return null;

  const handleLogout = () => {
    setIsOpen(false);
    void signOut();
  };

  const handleExitPreview = () => {
    setIsOpen(false);
    exitPreviewMode();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (nextOpen) onOpen?.();
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className="group flex items-center gap-1 rounded-full bg-zinc-950/80 p-1 pr-2 text-gray-300 shadow-sm transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-cyan-400 text-sm font-extrabold text-white">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name ? `${user.name}'s profile` : "Profile"}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : previewMode ? (
              <ScanEye className="size-5" aria-hidden="true" />
            ) : initials ? (
              initials
            ) : (
              <CircleUserRound className="size-5" aria-hidden="true" />
            )}
          </span>
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        aria-label="Account menu"
        className="w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border-white/10 bg-zinc-950/95 p-0 text-white shadow-2xl shadow-primary/15 backdrop-blur-xl"
      >
        <div className="border-b border-white/10 bg-gradient-to-br from-primary/20 via-zinc-950 to-cyan-400/10 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-cyan-400 font-extrabold text-white ring-2 ring-white/10">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : previewMode ? (
                <ScanEye className="size-6" aria-hidden="true" />
              ) : initials ? (
                initials
              ) : (
                <CircleUserRound className="size-6" aria-hidden="true" />
              )}
            </span>

            <div className="min-w-0">
              {(user?.name || previewMode) && (
                <p className="truncate font-extrabold text-white">
                  {previewMode ? "Platform Preview" : user?.name}
                </p>
              )}
              {user?.email && !previewMode && (
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              )}
              <span className="mt-1 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                {previewMode ? "Preview Mode" : user?.role}
              </span>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <nav aria-label="Account navigation" className="p-2">
            <ul>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-300 transition-colors hover:bg-white/5 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                        isActive && "bg-primary/15 text-cyan-300"
                      )}
                    >
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <div className="border-t border-white/10 p-2">
          {previewMode ? (
            <button
              type="button"
              onClick={handleExitPreview}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-400/10 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Exit Preview
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log Out
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
