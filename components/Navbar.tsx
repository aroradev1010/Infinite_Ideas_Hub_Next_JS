"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import PrimaryButton from "./PrimaryButton";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import SecondaryButton from "./SecondaryButton";

const navLinks = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "Authors", link: "/authors" },
  { id: 3, name: "Categories", link: "/categories" },
];

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Lock scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup in case component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <div className={`max-w-7xl mx-auto ${isMenuOpen ? "" : ""}`}>
      <div className="flex items-center justify-between py-4 px-4 relative">
        <Link
          href="/"
          className="font-extrabold md:text-2xl text-[#00CBF1] tracking-widest"
        >
          Infinite Ideas Hub
        </Link>

        <ul className="hidden xl:flex gap-5 items-center">
          {navLinks.map((link) => (
            <NavItem
              key={link.id}
              name={link.name}
              href={link.link}
              isActive={pathname === link.link}
            />
          ))}
        </ul>

        <div className="flex gap-3 items-center">
          <div className="flex gap-5">
            {session?.user ? (
              <>
                <PrimaryButton
                  className="uppercase md:text-sm font-extrabold px-5 tracking-wider hidden sm:flex w-[90px]"
                  text="Log Out"
                  onClick={() => signOut()}
                />
                <PrimaryButton
                  className="uppercase md:text-sm font-extrabold px-5 tracking-wider hidden sm:flex"
                  text="Subscribe"
                />
              </>
            ) : (
              <>
                <Link href="/auth/sign-in">
                  <PrimaryButton
                    className="uppercase md:text-sm font-extrabold px-5 tracking-wider hidden sm:flex w-[90px]"
                    text="Sign Up"
                  />
                </Link>
                <Link href="/subscribe">
                  <PrimaryButton
                    className="uppercase md:text-sm font-extrabold px-5 tracking-wider hidden sm:flex "
                    text="Subscribe"
                  />
                </Link>
              </>
            )}
          </div>

          <SecondaryButton
            className="bg-secondary hover:bg-secondary/60 text-white rounded-full p-2 xl:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </SecondaryButton>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div
        className={cn(
          "fixed left-0 right-0 shadow-lg transition-all duration-300 ease-in-out overflow-hidden bg-background z-50",
          isMenuOpen ? "opacity-100 h-full" : "max-h-0 opacity-0"
        )}
      >
        <div className="my-10 mx-10">
          <ul className="space-y-6 w-full">
            {navLinks.map((link) => (
              <NavItem
                key={link.id}
                name={link.name}
                href={link.link}
                isActive={pathname === link.link}
                toggleMenu={toggleMenu}
                className="text-2xl"
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  name: string;
  href: string;
  isActive?: boolean;
  className?: string;
  toggleMenu?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  name,
  href,
  isActive = false,
  className,
  toggleMenu,
}) => {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          className,
          "font-bold transition-colors duration-200",
          isActive ? "text-primary" : "hover:text-primary"
        )}
        onClick={toggleMenu}
      >
        {name}
      </Link>
    </li>
  );
};
