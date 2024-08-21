import React from "react";
import Link from "next/link";
import Button from "@/components/Button";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-white p-4 fixed top-0 w-full z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center max-w-2xl lg:max-w-7xl">
        <Link href="/" className="text-goods-800 font-semibold text-xl">
          Good Goods
        </Link>
        <div className="relative">
          <Button variant="outlined" href="/clothing">
            Clothing
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
