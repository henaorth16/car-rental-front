"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Car, FuelType, Transmission, NewCarFormValues } from "@/types/car";
import { useState, useRef, useEffect } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ImageIcon, Upload, X } from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";

const CAR_TYPES = [
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Convertible",
  "Coupe",
  "Hatchback",
  "Wagon",
];

const FUEL_TYPES: FuelType[] = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];
const TRANSMISSIONS: Transmission[] = ["AUTOMATIC", "MANUAL"];

interface CarFormProps {
  initialData?: Car;
}

export default function CarForm({ initialData }: CarFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.images?.map(img => getImageUrl(img.url)) || []
  );

  const isEdit = !!initialData;

  const form = useForm<NewCarFormValues>({
    defaultValues: initialData
      ? {
          brand: initialData.brand,
          model: initialData.model,
          type: initialData.type,
          fuelType: initialData.fuelType,
          transmission: initialData.transmission,
          description: initialData.description,
          seats: initialData.seats,
          doors: initialData.doors,
          color: initialData.color,
          images: initialData.images, // We still keep this in defaultValues but will manage submission manually
          pricePerDay: initialData.pricePerDay,
          available: initialData.available,
        }
      : {
          brand: "",
          model: "",
          type: "Sedan",
          fuelType: "PETROL",
          transmission: "MANUAL",
          description: "",
          seats: 5,
          doors: 4,
          color: "",
          images: [],
          pricePerDay: 0,
          available: true,
        },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const carMutation = useMutation({
    mutationFn: async (values: NewCarFormValues) => {
      const formData = new FormData();

      // Append all text/numeric fields
      formData.append("brand", values.brand);
      formData.append("model", values.model);
      formData.append("type", values.type);
      formData.append("fuelType", values.fuelType);
      formData.append("transmission", values.transmission);
      formData.append("description", values.description);
      formData.append("color", values.color);
      formData.append("seats", String(values.seats));
      formData.append("doors", String(values.doors));
      formData.append("pricePerDay", String(values.pricePerDay));
      formData.append("available", String(values.available));

      // Append existing images that were kept
      existingImages.forEach((url) => {
        formData.append("existingImages", url);
      });

      // Append new files
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEdit && initialData) {
        const res = await api.put<Car>(`/api/cars/${initialData.id}`, formData, config);
        return res.data;
      } else {
        const res = await api.post<Car>("/api/cars", formData, config);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      router.push("/admin/cars");
      router.refresh();
    },
  });

  const onSubmit = (values: NewCarFormValues) => {
    carMutation.mutate(values);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);
    
    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  const isAvailable = watch("available");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isEdit ? "Edit Car Details" : "Car Details"}
        </CardTitle>
        <CardDescription>
          All fields marked with * are required. You can upload multiple images.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Brand & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Brand <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Toyota"
                {...register("brand", { required: "Brand is required" })}
              />
              {errors.brand && (
                <p className="text-xs text-red-500">{errors.brand.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Model <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Camry"
                {...register("model", { required: "Model is required" })}
              />
              {errors.model && (
                <p className="text-xs text-red-500">{errors.model.message}</p>
              )}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CAR_TYPES.map((type) => {
                const selected = watch("type") === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("type", type)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register("type", { required: true })} />
          </div>

          {/* Fuel Type & Transmission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Fuel Type <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FUEL_TYPES.map((ft) => {
                  const selected = watch("fuelType") === ft;
                  return (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => setValue("fuelType", ft)}
                      className={`px-3 py-1.5 rounded-md text-sm border capitalize transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      {ft}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...register("fuelType", { required: true })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Transmission <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TRANSMISSIONS.map((tr) => {
                  const selected = watch("transmission") === tr;
                  return (
                    <button
                      key={tr}
                      type="button"
                      onClick={() => setValue("transmission", tr)}
                      className={`px-3 py-1.5 rounded-md text-sm border capitalize transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      {tr}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...register("transmission", { required: true })} />
            </div>
          </div>

          {/* Specifications: Seats, Doors, Color */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Seats <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                {...register("seats", { required: true, min: 1 })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Doors <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                {...register("doors", { required: true, min: 1 })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Color <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. White"
                {...register("color", { required: true })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the car's features, condition, etc."
              {...register("description", { required: true })}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Car Images <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Images
              </Button>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Existing Images (When Editing) */}
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative group aspect-square rounded-lg border overflow-hidden bg-muted">
                  <img src={url} alt="Existing" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/40 py-1 text-[10px] text-white text-center">
                    Server
                  </div>
                </div>
              ))}

              {/* Newly Selected Files */}
              {filePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative group aspect-square rounded-lg border overflow-hidden bg-muted">
                  <img src={preview} alt="New" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-primary/80 py-1 text-[10px] text-white text-center">
                    New
                  </div>
                </div>
              ))}

              {existingImages.length === 0 && selectedFiles.length === 0 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="col-span-full border-2 border-dashed rounded-lg bg-muted/30 p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">No images uploaded yet</p>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Click here or the upload button to add images</p>
                </div>
              )}
            </div>
          </div>

          {/* Price per day */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Price per Day <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ETB
              </span>
              <Input
                type="number"
                min={1}
                step="0.01"
                className="pl-12"
                placeholder="0.00"
                {...register("pricePerDay", {
                  required: "Price is required",
                  min: { value: 1, message: "Price must be at least 1 ETB" },
                })}
              />
            </div>
            {errors.pricePerDay && (
              <p className="text-xs text-red-500">
                {errors.pricePerDay.message}
              </p>
            )}
          </div>

          {/* Availability toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Available for Rental</p>
              <p className="text-xs text-muted-foreground">
                Toggle whether this car can be booked immediately.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              onClick={() => setValue("available", !isAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isAvailable ? "bg-black" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  isAvailable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <input type="hidden" {...register("available")} />
          </div>

          {/* Error */}
          {carMutation.isError && (
            <p className="text-sm text-red-500 text-center">
              {(carMutation.error as any)?.response?.data?.error ??
                `Failed to ${isEdit ? "update" : "create"} car. Please try again.`}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={carMutation.isPending}
            >
              {carMutation.isPending
                ? isEdit
                  ? "Updating Car..."
                  : "Adding Car..."
                : isEdit
                ? "Update Car"
                : "Add Car"}
            </Button>
            <Link
              href="/admin/cars"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Cancel
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

