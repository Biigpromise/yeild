import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketplaceImageCarouselProps {
  images: string[];
  alt: string;
}

export function MarketplaceImageCarousel({ images, alt }: MarketplaceImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // YouTube thumbnail aspect ratio is 16:9 - using aspect-[16/9] for exact match
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden shadow-md">
        <img
          src={images[0]}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden group shadow-md">
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />

        {/* Navigation Buttons */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? 'border-primary scale-105'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={image}
              alt={`${alt} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
