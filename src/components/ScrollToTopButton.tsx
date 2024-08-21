import { useState, useEffect } from "react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show the button when the user scrolls down 200px from the top
  const toggleVisibility = () => {
    if (window.pageYOffset > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

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
