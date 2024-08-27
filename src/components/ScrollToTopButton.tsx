import { useState, useEffect } from "react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const toggleVisibility = debounce(() => {
    if (window.scrollY > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, 100);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [toggleVisibility]);

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 p-2 rounded-full bg-goods-500 text-white shadow-lg focus:outline-none"
      >
        <ChevronUpIcon className="h-8 w-8" />
      </button>
    )
  );
};

export default ScrollToTopButton;
