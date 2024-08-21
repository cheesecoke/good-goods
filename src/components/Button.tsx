import React from "react";
import Link from "next/link";

const Button = ({
  children,
  variant = "flat",
  disabled = false,
  href,
  ...props
}: {
  children: React.ReactNode;
  variant?: "flat" | "outlined";
  disabled?: boolean;
  href?: string;
  [key: string]: any;
}) => {
  const baseStyles =
    "font-bold py-2 px-4 rounded focus:outline-none transition ease-in-out duration-150";

  const flatStyles = `
    ${
      disabled
        ? "bg-goods-100 text-goods-400 cursor-not-allowed"
        : "bg-goods-500 text-white hover:bg-goods-600 active:bg-goods-700"
    }
  `;

  const outlinedStyles = `
    ${
      disabled
        ? "text-goods-200 border-goods-200 cursor-not-allowed"
        : "text-goods-600 border border-goods-600 hover:text-goods-700 hover:border-goods-700 active:text-goods-700 active:border-goods-700"
    }
  `;

  const styles = variant === "flat" ? flatStyles : outlinedStyles;

  if (href && !disabled) {
    return (
      <Link href={href} passHref legacyBehavior>
        <a className={`${baseStyles} ${styles}`} {...props}>
          {children}
        </a>
      </Link>
    );
  } else {
    return (
      <button
        className={`${baseStyles} ${styles}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
};

export default Button;
