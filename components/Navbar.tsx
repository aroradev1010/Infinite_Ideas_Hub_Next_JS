"use client";
import React, { useState } from "react";
import PrimaryButton from "./PrimaryButton";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

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
    <div className="relative">
      <div className="flex items-center justify-between py-4 px-4 z-[60] relative">
        <div>
          <h1 className="font-bold text-2xl text-primary">InfiniteIdeasHub</h1>
        </div>
        <div className="flex gap-3">
          <PrimaryButton className="uppercase text-lg px-6" />
          <Button
            className="bg-secondary hover:bg-secondary/60 cursor-pointer text-white rounded-full p-2"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {/* Dropdown Menu */}
      <div
        className={`fixed left-0 right-0 shadow-lg transition-all duration-300 ease-in-out overflow-hidden bg-background z-50 ${
          isMenuOpen ? "opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-start justify-start py-8 px-4">
          <ul className="space-y-6 text-center w-full">
            {navLinks.map((link) => (
              <NavItem
                key={link.id}
                name={link.name}
                href={link.link}
                toggleMenu={toggleMenu}
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
  toggleMenu,
}: {
  name: string;
  href: string;
  toggleMenu: () => void;
}) => {
  return (
    <li>
      <Link
        href={href}
        className="text-lg font-medium hover:text-primary"
        onClick={toggleMenu}
      >
        {name}
      </Link>
    </li>
  );
};
