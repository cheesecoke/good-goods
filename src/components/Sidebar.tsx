import React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/20/solid";

type SidebarProps = {
  onFilterChange: (filter: string, checked: boolean) => void;
  onCategoryChange: (category: string, checked: boolean) => void;
  onCompanyChange: (company: string, checked: boolean) => void;
  onPriceChange: (priceRange: string, checked: boolean) => void;
  clearFilters: () => void;
  activeFilters: string[];
  activeCategories: string[];
  activeCompanies: string[];
  activePriceRange: string | null;
  availableTags: string[];
};

const categories = [
  {
    id: "company",
    name: "Company",
    options: ["Patagonia", "MadeTrade", "Outerknown"],
  },
  {
    id: "bottoms",
    name: "Bottoms",
    options: ["All Bottoms", "Pants", "Shorts"],
  },
  {
    id: "tops",
    name: "Tops",
    options: ["All Tops", "Shirts", "Polos", "Sweaters", "Hoodies"],
  },
  {
    id: "outerwear",
    name: "Outerwear",
    options: ["All Outerwear", "Jackets", "Pullovers", "Coats"],
  },
  {
    id: "miscellaneous",
    name: "Miscellaneous",
    options: ["All Miscellaneous", "Hats", "Belts", "Dresses"],
  },
  {
    id: "Type",
    name: "Type",
    options: ["Men's", "Women's", "Kids", "Recycled", "Pre-Owned"],
  },
];

const priceRanges = [
  { label: "Less than $50", value: "less-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100 - $200", value: "100-200" },
  { label: "$200 - $500", value: "200-500" },
  { label: "More than $500", value: "more-500" },
];

const Sidebar: React.FC<SidebarProps> = ({
  onFilterChange,
  onCategoryChange,
  onCompanyChange,
  onPriceChange,
  clearFilters,
  activeFilters = [],
  activeCategories = [],
  activeCompanies = [],
  activePriceRange = null,
}) => {
  return (
    <form className="divide-y divide-gray-200">
      <div className="flex justify-between py-6">
        <h2 className="text-lg font-bold">Filters</h2>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-goods-500"
        >
          Clear all filters
        </button>
      </div>

      {categories.map((section) => (
        <Disclosure
          defaultOpen={true}
          key={section.id}
          as="div"
          className="py-6"
        >
          {({ open }) => (
            <>
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">
                    {section.name}
                  </span>
                  <span className="ml-6 flex items-center">
                    {open ? (
                      <MinusIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <PlusIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                </DisclosureButton>
              </h3>
              <DisclosurePanel className="pt-6">
                <div className="space-y-4 pl-4">
                  {section.options.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        id={`${section.id}-${option}`}
                        name={`${section.id}[]`}
                        type="checkbox"
                        checked={
                          option.startsWith("All")
                            ? activeCategories.includes(section.name)
                            : activeFilters.includes(option) ||
                              activeCompanies.includes(option)
                        }
                        onChange={(e) => {
                          // Map "All [Category]" to the appropriate category
                          const filter = option.startsWith("All")
                            ? section.name
                            : option;
                          if (option.startsWith("All")) {
                            onCategoryChange(filter, e.target.checked);
                          } else if (section.name === "Company") {
                            onCompanyChange(filter, e.target.checked);
                          } else if (section.name === "Price") {
                            onPriceChange(filter, e.target.checked);
                          } else {
                            onFilterChange(filter, e.target.checked);
                          }
                        }}
                        className="h-4 w-4 rounded border-goods-500 text-goods-600 focus:ring-goods-500"
                      />
                      <label
                        htmlFor={`${section.id}-${option}`}
                        className="ml-3 text-sm text-gray-600"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}

      {/* Price Range Filter */}
      <Disclosure defaultOpen={true} as="div" className="py-6">
        {({ open }) => (
          <>
            <h3 className="-my-3 flow-root">
              <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                <span className="font-medium text-gray-900">Price</span>
                <span className="ml-6 flex items-center">
                  {open ? (
                    <MinusIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <PlusIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
              </DisclosureButton>
            </h3>
            <DisclosurePanel className="pt-6">
              <div className="space-y-4 pl-4">
                {priceRanges.map((range) => (
                  <div key={range.value} className="flex items-center">
                    <input
                      id={`price-${range.value}`}
                      name="price[]"
                      type="radio"
                      checked={activePriceRange === range.value}
                      onChange={(e) =>
                        onPriceChange(range.value, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-goods-500 text-goods-600 focus:ring-goods-500"
                    />
                    <label
                      htmlFor={`price-${range.value}`}
                      className="ml-3 text-sm text-gray-600"
                    >
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </form>
  );
};

export default Sidebar;
