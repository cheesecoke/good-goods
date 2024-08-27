import React from "react";

type MobileFiltersProps = {
  availableTags: string[];
  activeFilters: string[];
  activeCategories: string[];
  activeCompanies: string[];
  activePriceRange: string | null;
  onFilterChange: (filter: string, checked: boolean) => void;
  onCategoryChange: (category: string, checked: boolean) => void;
  onCompanyChange: (company: string, checked: boolean) => void;
  onPriceChange: (priceRange: string, checked: boolean) => void;
  clearFilters: () => void;
};

const companies = ["Patagonia", "MadeTrade"];
const categories = ["Bottoms", "Tops", "Outerwear", "Miscellaneous"];
const priceRanges = [
  { label: "Less than $50", value: "less-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100 - $200", value: "100-200" },
  { label: "$200 - $500", value: "200-500" },
  { label: "More than $500", value: "more-500" },
];

const MobileFilters: React.FC<MobileFiltersProps> = ({
  availableTags,
  activeFilters = [],
  activeCategories = [],
  activeCompanies = [],
  activePriceRange = null,
  onFilterChange,
  onCategoryChange,
  onCompanyChange,
  onPriceChange,
  clearFilters,
}) => {
  return (
    <div className="flex flex-wrap gap-2 my-4">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-gray-600"
        >
          Clear all
        </button>
      </div>
      {/* Render price range pills */}
      {priceRanges.map((range) => (
        <button
          key={range.value}
          onClick={() =>
            onPriceChange(range.value, activePriceRange !== range.value)
          }
          className={`flex items-center px-4 py-2 rounded-full border text-sm ${
            activePriceRange === range.value
              ? "bg-goods-500 text-white hover:bg-goods-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {range.label}
          {activePriceRange === range.value && (
            <span
              onClick={() => onPriceChange(range.value, false)}
              className="ml-2 cursor-pointer"
            >
              &times;
            </span>
          )}
        </button>
      ))}

      {/* Render company pills */}
      {companies.map((company) => (
        <button
          key={company}
          onClick={() =>
            onCompanyChange(company, !activeCompanies.includes(company))
          }
          className={`flex items-center px-4 py-2 rounded-full border text-sm ${
            activeCompanies.includes(company)
              ? "bg-goods-500 text-white hover:bg-goods-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {company}
          {activeCompanies.includes(company) && (
            <span
              onClick={() => onCompanyChange(company, false)}
              className="ml-2 cursor-pointer"
            >
              &times;
            </span>
          )}
        </button>
      ))}

      {/* Render category pills */}
      {categories.map((category) => (
        <button
          key={category}
          onClick={() =>
            onCategoryChange(category, !activeCategories.includes(category))
          }
          className={`flex items-center px-4 py-2 rounded-full border text-sm ${
            activeCategories.includes(category)
              ? "bg-goods-500 text-white hover:bg-goods-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {category}
          {activeCategories.includes(category) && (
            <span
              onClick={() => onCategoryChange(category, false)}
              className="ml-2 cursor-pointer"
            >
              &times;
            </span>
          )}
        </button>
      ))}

      {/* Render tag pills */}
      {availableTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onFilterChange(tag, !activeFilters.includes(tag))}
          className={`flex items-center px-4 py-2 rounded-full border text-sm ${
            activeFilters.includes(tag)
              ? "bg-goods-500 text-white hover:bg-goods-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {tag}
          {activeFilters.includes(tag) && (
            <span
              onClick={() => onFilterChange(tag, false)}
              className="ml-2 cursor-pointer"
            >
              &times;
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MobileFilters;
