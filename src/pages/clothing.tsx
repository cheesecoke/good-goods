import dynamic from "next/dynamic";
import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import mongoose from "mongoose";
import ClothingItem from "@/models/ClothingItem";

// Next.js dynamic imports
const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false });
const ScrollToTopButton = dynamic(
  () => import("@/components/ScrollToTopButton"),
  {
    ssr: false,
  }
);

// React.lazy components
const ItemList = React.lazy(() => import("@/components/ItemList"));
const MobileFilters = React.lazy(() => import("@/components/MobileFilters"));

const Clothing: React.FC<{
  initialItems: any[];
  totalItemsCount: number;
  availableTags: string[];
}> = ({ initialItems, totalItemsCount, availableTags }) => {
  const router = useRouter();
  const [loadedItems, setLoadedItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialItems.length < totalItemsCount);
  const [filters, setFilters] = useState({
    tags: Array.isArray(router.query.tags)
      ? router.query.tags
      : router.query.tags
      ? router.query.tags.split(",")
      : [],
    categories: Array.isArray(router.query.categories)
      ? router.query.categories
      : router.query.categories
      ? router.query.categories.split(",")
      : [],
    companies: Array.isArray(router.query.companies)
      ? router.query.companies
      : router.query.companies
      ? router.query.companies.split(",")
      : [],
    price: Array.isArray(router.query.price)
      ? router.query.price[0]
      : router.query.price || null,
  });

  // Cache to store loaded items
  const itemCache = useRef<{ [key: string]: any[] }>({});

  const generateCacheKey = (filters: any, page: number) => {
    return `${JSON.stringify(filters)}|page:${page}`;
  };

  const cleanFilters = (filters: any) => {
    const cleanedFilters = { ...filters };
    Object.keys(cleanedFilters).forEach((key) => {
      if (
        Array.isArray(cleanedFilters[key]) &&
        cleanedFilters[key].length === 0
      ) {
        delete cleanedFilters[key];
      } else if (!cleanedFilters[key]) {
        delete cleanedFilters[key];
      }
    });
    return cleanedFilters;
  };

  const fetchItems = useCallback(
    async (newPage = 1, appliedFilters = filters) => {
      setLoading(true);
      const cacheKey = generateCacheKey(appliedFilters, newPage);

      if (itemCache.current[cacheKey]) {
        const cachedItems = itemCache.current[cacheKey];
        if (newPage === 1) {
          setLoadedItems(cachedItems);
        } else {
          setLoadedItems((prev) => [...prev, ...cachedItems]);
        }
      } else {
        const query = new URLSearchParams(
          cleanFilters({
            ...appliedFilters,
            page: String(newPage),
          })
        );

        const res = await fetch(`/api/items?${query.toString()}`);
        const { items } = await res.json();

        if (newPage === 1) {
          setLoadedItems(items);
        } else {
          setLoadedItems((prev) => [...prev, ...items]);
        }

        // Cache the loaded items
        itemCache.current[cacheKey] = items;

        if (items.length === 0 || items.length < 16) {
          setHasMore(false);
        }
      }

      setPage(newPage);
      setLoading(false);
    },
    [filters]
  );

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset page to 1 when filters change
    setHasMore(true); // Allow loading more items after filters change
    fetchItems(1, newFilters);

    const query = new URLSearchParams(cleanFilters(newFilters));

    router.push({
      pathname: router.pathname,
      query: query.toString(),
    });
  };

  const toggleFilter = (filterType: string, value: string | string[]) => {
    let newFilters: {
      tags: string[];
      categories: string[];
      companies: string[];
      price: string | null;
    } = { ...filters };

    if (
      filterType === "tags" ||
      filterType === "categories" ||
      filterType === "companies"
    ) {
      const filterIndex = newFilters[filterType].indexOf(value as string);
      if (filterIndex > -1) {
        // If the filter already exists, remove it
        newFilters[filterType] = newFilters[filterType].filter(
          (f) => f !== value
        );
      } else {
        // Otherwise, add it
        if (Array.isArray(value)) {
          newFilters[filterType].push(...value);
        } else {
          newFilters[filterType].push(value);
        }
      }
    } else if (filterType === "price") {
      // Toggle price filter
      newFilters.price = Array.isArray(value) ? value[0] : value;
    }

    handleFilterChange(newFilters);
  };

  const loadMoreItems = useCallback(() => {
    if (!hasMore || loading) return;
    fetchItems(page + 1);
  }, [page, hasMore, loading, fetchItems]);

  // Use Intersection Observer instead of scroll event
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreItems();
        }
      },
      { rootMargin: "100px" } // Trigger 100px before the end of the page
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loading, hasMore, loadMoreItems]);

  return (
    <div>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center border-b border-gray-200 pb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Clothing
          </h1>
        </div>

        <div className="lg:hidden">
          <Suspense fallback={<div>Loading Filters...</div>}>
            <MobileFilters
              availableTags={availableTags}
              activeFilters={filters.tags}
              activeCategories={filters.categories}
              activeCompanies={filters.companies}
              activePriceRange={filters.price as string | null}
              onFilterChange={(tags) => toggleFilter("tags", tags)}
              onCategoryChange={(categories) =>
                toggleFilter("categories", categories)
              }
              onCompanyChange={(companies) =>
                toggleFilter("companies", companies)
              }
              onPriceChange={(price) => toggleFilter("price", price)}
              clearFilters={() =>
                handleFilterChange({
                  tags: [],
                  categories: [],
                  companies: [],
                  price: null,
                })
              }
            />
          </Suspense>
        </div>

        <div className="pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
          <aside className="h-screen sticky top-24 lg:block hidden">
            <h2 className="sr-only">Filters</h2>
            <div className="overflow-y-auto max-h-[calc(100vh-96px)]">
              <Sidebar
                availableTags={availableTags}
                activeFilters={filters.tags}
                activeCategories={filters.categories}
                activeCompanies={filters.companies}
                activePriceRange={filters.price}
                onFilterChange={(tags) => toggleFilter("tags", tags)}
                onCategoryChange={(categories) =>
                  toggleFilter("categories", categories)
                }
                onCompanyChange={(companies) =>
                  toggleFilter("companies", companies)
                }
                onPriceChange={(price) => toggleFilter("price", price)}
                clearFilters={() =>
                  handleFilterChange({
                    tags: [],
                    categories: [],
                    companies: [],
                    price: null,
                  })
                }
              />
            </div>
          </aside>

          <div className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3">
            <Suspense fallback={<div>Loading Items...</div>}>
              <ItemList items={loadedItems} />
            </Suspense>
            <div ref={observerRef}></div>
          </div>

          {loading && <div>Loading more items...</div>}

          <ScrollToTopButton />
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {});
    const initialItems = await ClothingItem.find({}).limit(16).exec();
    const totalItemsCount = await ClothingItem.countDocuments();
    const availableTags = await ClothingItem.distinct("tags");

    return {
      props: {
        initialItems: JSON.parse(JSON.stringify(initialItems)),
        totalItemsCount,
        availableTags,
      },
    };
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    return {
      props: {
        initialItems: [],
        totalItemsCount: 0,
        availableTags: [],
      },
    };
  }
};

export default Clothing;
