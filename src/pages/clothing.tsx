import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import ItemList from "@/components/ItemList";
import MobileFilters from "@/components/MobileFilters";
import Button from "@/components/Button";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import mongoose from "mongoose";

// Define the ClothingItem schema directly here
const clothingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  link: { type: String, required: true },
  company: { type: String, required: true },
  tags: { type: [String], required: true },
});

const ClothingItem =
  mongoose.models.ClothingItems ||
  mongoose.model("ClothingItems", clothingItemSchema, "clothingitems");

type ClothingProps = {
  items: any[];
  availableTags: string[];
};

const Clothing: React.FC<ClothingProps> = ({ items, availableTags }) => {
  const router = useRouter();
  const [filteredItems, setFilteredItems] = useState(items);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeCompanies, setActiveCompanies] = useState<string[]>([]);
  const [activePriceRange, setActivePriceRange] = useState<string | null>(null);

  // Function to shuffle items
  const shuffleItems = () => {
    const shuffled = [...filteredItems].sort(() => Math.random() - 0.5);
    setFilteredItems(shuffled);
  };

  const handleFilterChange = (filter: string, checked: boolean) => {
    const queryParams = new URLSearchParams(router.query as any);

    const newFilters = checked
      ? [...activeFilters, filter]
      : activeFilters.filter((f) => f !== filter);

    setActiveFilters(newFilters);

    queryParams.delete("tags");
    newFilters.forEach((f) => queryParams.append("tags", f));

    router.replace({
      pathname: router.pathname,
      query: queryParams.toString(),
    });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const queryParams = new URLSearchParams(router.query as any);

    const newCategories = checked
      ? [...activeCategories, category]
      : activeCategories.filter((c) => c !== category);

    setActiveCategories(newCategories);

    queryParams.delete("categories");
    newCategories.forEach((c) => queryParams.append("categories", c));

    router.replace({
      pathname: router.pathname,
      query: queryParams.toString(),
    });
  };

  const handleCompanyChange = (company: string, checked: boolean) => {
    const queryParams = new URLSearchParams(router.query as any);

    const newCompanies = checked
      ? [...activeCompanies, company]
      : activeCompanies.filter((c) => c !== company);

    setActiveCompanies(newCompanies);

    queryParams.delete("company");
    newCompanies.forEach((c) => queryParams.append("company", c));

    router.replace({
      pathname: router.pathname,
      query: queryParams.toString(),
    });
  };

  const handlePriceChange = (priceRange: string, checked: boolean) => {
    const queryParams = new URLSearchParams(router.query as any);

    setActivePriceRange(checked ? priceRange : null);

    if (checked) {
      queryParams.set("price", priceRange);
    } else {
      queryParams.delete("price");
    }

    router.replace({
      pathname: router.pathname,
      query: queryParams.toString(),
    });
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setActiveCategories([]);
    setActiveCompanies([]);
    setActivePriceRange(null);

    router.replace({
      pathname: router.pathname,
      query: {},
    });
  };

  useEffect(() => {
    const tagsFromUrl = router.query.tags
      ? Array.isArray(router.query.tags)
        ? router.query.tags
        : [router.query.tags]
      : [];

    const categoriesFromUrl = router.query.categories
      ? Array.isArray(router.query.categories)
        ? router.query.categories
        : [router.query.categories]
      : [];

    const companiesFromUrl = router.query.company
      ? Array.isArray(router.query.company)
        ? router.query.company
        : [router.query.company]
      : [];

    const priceFromUrl = router.query.price as string | undefined;

    setActiveFilters(tagsFromUrl);
    setActiveCategories(categoriesFromUrl);
    setActiveCompanies(companiesFromUrl);
    setActivePriceRange(priceFromUrl || null);

    const filtered = items.filter((item) => {
      const itemPrice = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
      const isPriceMatch =
        !priceFromUrl ||
        (priceFromUrl === "less-50" && itemPrice < 50) ||
        (priceFromUrl === "50-100" && itemPrice >= 50 && itemPrice < 100) ||
        (priceFromUrl === "100-200" && itemPrice >= 100 && itemPrice < 200) ||
        (priceFromUrl === "200-500" && itemPrice >= 200 && itemPrice < 500) ||
        (priceFromUrl === "more-500" && itemPrice >= 500);

      const isCompanyMatch =
        companiesFromUrl.length === 0 ||
        companiesFromUrl.includes(item.company);

      const isCategoryMatch =
        categoriesFromUrl.length === 0 ||
        categoriesFromUrl.includes(item.category);

      const isTagMatch =
        tagsFromUrl.length === 0 ||
        tagsFromUrl.every((filter) => item.tags.includes(filter));

      return isPriceMatch && isCompanyMatch && isCategoryMatch && isTagMatch;
    });

    setFilteredItems(filtered);
  }, [
    router.query.tags,
    router.query.categories,
    router.query.company,
    router.query.price,
    items,
  ]);

  return (
    <div>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center border-b border-gray-200 pb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Clothing
          </h1>
          <Button
            onClick={shuffleItems}
            className="text-goods-500 text-sm font-medium"
          >
            Randomize
          </Button>
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden">
          <MobileFilters
            availableTags={availableTags}
            activeFilters={activeFilters}
            activeCategories={activeCategories}
            activeCompanies={activeCompanies}
            activePriceRange={activePriceRange}
            onFilterChange={handleFilterChange}
            onCategoryChange={handleCategoryChange}
            onCompanyChange={handleCompanyChange}
            onPriceChange={handlePriceChange}
            clearFilters={clearFilters}
          />
        </div>

        {/* Sidebar Filters */}
        <div className="pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
          <aside className="h-screen sticky top-24 lg:block hidden">
            <h2 className="sr-only">Filters</h2>
            <div className="overflow-y-auto max-h-[calc(100vh-96px)]">
              <Sidebar
                availableTags={availableTags}
                activeFilters={activeFilters}
                activeCategories={activeCategories}
                activeCompanies={activeCompanies}
                activePriceRange={activePriceRange}
                onFilterChange={handleFilterChange}
                onCategoryChange={handleCategoryChange}
                onCompanyChange={handleCompanyChange}
                onPriceChange={handlePriceChange}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Product grid */}
          <div className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3">
            <ItemList items={filteredItems} />
          </div>

          <ScrollToTopButton />
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  await mongoose.connect(process.env.MONGODB_URI!, {});

  const items = await ClothingItem.find({}).exec();
  const availableTags = await ClothingItem.distinct("tags");

  return {
    props: {
      items: JSON.parse(JSON.stringify(items)),
      availableTags,
    },
  };
};

export default Clothing;
