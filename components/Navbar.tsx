"use client";
import React, { useState } from "react";
import PrimaryButton from "./PrimaryButton";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navLinks = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "Authors", link: "/authors" },
  { id: 3, name: "Categories", link: "/categories" },
];

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="lg:mx-auto lg:w-4/5 xl:w-5/6">
      <div className="flex items-center justify-between py-4 px-4 relative">
        <div>
          <Link
            href={"/"}
            className="font-extrabold md:text-2xl  text-[#00CBF1] tracking-widest"
          >
            Infinite Ideas Hub
          </Link>
        </div>

        <ul className="flex gap-5 items-center">
          {navLinks.map((link) => (
            <NavItem key={link.id} name={link.name} href={link.link} />
          ))}
        </ul>

        <div className="flex gap-3 items-center">
          <PrimaryButton
            className="uppercase md:text-[15px] font-extrabold px-5 tracking-wider hidden sm:flex"
            text="Subscribe"
          />
          <button
            className="bg-secondary hover:bg-secondary/60 cursor-pointer text-white rounded-full p-2 xl:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {/* Dropdown Menu */}
      <div
        className={`fixed left-0 right-0 shadow-lg transition-all duration-300 ease-in-out overflow-hidden bg-background z-50 ${
          isMenuOpen ? "opacity-100 h-full" : "max-h-0 opacity-0"
        }`}
      >
        <div className="my-10 mx-10">
          <ul className="space-y-6 w-full">
            {navLinks.map((link) => (
              <NavItem
                key={link.id}
                name={link.name}
                href={link.link}
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

const NavItem = ({
  name,
  href,
  className,
  toggleMenu,
}: {
  name: string;
  href: string;
  className?: string;
  toggleMenu: () => void;
}) => {
  return (
    <li>
      <Link
        href={href}
        className={cn(className, `font-bold hover:text-primary`)}
        onClick={toggleMenu}
      >
        {name}
      </Link>
    </li>
  );
};
