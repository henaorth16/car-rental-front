"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Car } from "@/lib/types";
import { CarCard } from "@/components/CarCard";
import {
  Car as CarIcon,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Sedan", "SUV", "Luxury", "Electric", "Van", "Truck", "Hatchback"];

const FUEL_TYPES = [
  { label: "All Fuels", value: "" },
  { label: "Petrol", value: "PETROL" },
  { label: "Diesel", value: "DIESEL" },
  { label: "Electric", value: "ELECTRIC" },
  { label: "Hybrid", value: "HYBRID" },
];

const TRANSMISSIONS = [
  { label: "All Transmissions", value: "" },
  { label: "Automatic", value: "AUTOMATIC" },
  { label: "Manual", value: "MANUAL" },
];

const SORT_OPTIONS = [
  { label: "Newest First", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Price: Low to High", sortBy: "pricePerDay", sortOrder: "asc" },
  { label: "Price: High to Low", sortBy: "pricePerDay", sortOrder: "desc" },
];

export default function CarsListPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortIndex, setSortIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Active filter count
  const activeFiltersCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedFuel ? 1 : 0) +
    (selectedTransmission ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (search ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedFuel("");
    setSelectedTransmission("");
    setMinPrice("");
    setMaxPrice("");
    setSortIndex(0);
    setPage(1);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "cars",
      {
        page,
        search,
        selectedCategory,
        selectedFuel,
        selectedTransmission,
        minPrice,
        maxPrice,
        sortIndex,
      },
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        limit: 12,
        sortBy: SORT_OPTIONS[sortIndex].sortBy,
        sortOrder: SORT_OPTIONS[sortIndex].sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory !== "All") params.type = selectedCategory;
      if (selectedFuel) params.fuelType = selectedFuel;
      if (selectedTransmission) params.transmission = selectedTransmission;
      if (minPrice && !isNaN(Number(minPrice))) params.minPrice = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) params.maxPrice = Number(maxPrice);

      const res = await api.get<Car[] | { cars: Car[]; pagination: any }>("/api/cars", { params });

      if (Array.isArray(res.data)) {
        return {
          cars: res.data,
          pagination: { page: 1, limit: 12, total: res.data.length, totalPages: 1 },
        };
      }

      return {
        cars: res.data?.cars || [],
        pagination: res.data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 },
      };
    },
  });

  const cars = data?.cars || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <CarIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Our Vehicle Fleet</h1>
            <p className="text-muted-foreground mt-0.5">
              Explore and reserve from our curated selection of high-standard rental cars.
            </p>
          </div>
        </div>

        {/* Quick Search & Filter Toggle on Mobile */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search make, model, type..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant={showFilters ? "default" : "outline"}
            className="shrink-0 gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-primary-foreground text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Expandable Advanced Filters & Sort Tray */}
      {showFilters && (
        <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Advanced Filters
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Transmission */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Transmission
              </label>
              <select
                value={selectedTransmission}
                onChange={(e) => {
                  setSelectedTransmission(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {TRANSMISSIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Fuel Type
              </label>
              <select
                value={selectedFuel}
                onChange={(e) => {
                  setSelectedFuel(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Price (ETB / Day)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 text-xs"
                />
                <span className="text-muted-foreground text-xs">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Sort Fleet
              </label>
              <select
                value={sortIndex}
                onChange={(e) => {
                  setSortIndex(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {SORT_OPTIONS.map((opt, idx) => (
                  <option key={idx} value={idx}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Results Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Showing <span className="font-semibold text-foreground">{cars.length}</span> of{" "}
          <span className="font-semibold text-foreground">{pagination.total}</span> vehicles
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{SORT_OPTIONS[sortIndex].label}</span>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Skeleton Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card overflow-hidden shadow-xs animate-pulse space-y-4"
            >
              <div className="w-full h-48 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded-md w-3/4" />
                <div className="h-3 bg-muted rounded-md w-1/2" />
                <div className="flex gap-2 pt-2">
                  <div className="h-4 bg-muted rounded-md w-16" />
                  <div className="h-4 bg-muted rounded-md w-16" />
                </div>
                <div className="h-6 bg-muted rounded-md w-1/3 pt-2" />
                <div className="h-10 bg-muted rounded-md w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-destructive bg-destructive/10 rounded-2xl border border-destructive/20 max-w-xl mx-auto space-y-3">
          <p className="font-semibold">Unable to load fleet inventory.</p>
          <p className="text-sm text-destructive/80">Please check your network connection or server status.</p>
          <Button variant="outline" size="sm" onClick={() => resetFilters()}>
            Try Again
          </Button>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-28 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center">
            <CarIcon className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">No vehicles found</p>
            <p className="text-sm max-w-md mx-auto text-muted-foreground">
              We couldn't find any vehicles matching your current search or filter combination.
            </p>
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={resetFilters} className="gap-1.5 mt-2">
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          <span className="text-xs font-medium text-muted-foreground px-2">
            Page <span className="font-bold text-foreground">{page}</span> of{" "}
            <span className="font-bold text-foreground">{pagination.totalPages}</span>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
