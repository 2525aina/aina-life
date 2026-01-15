"use client";

import { useState, useMemo } from "react";
import { Search, ImageIcon, Check, LayoutGrid, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBreedImages,
  getAvailableBreeds,
} from "@/lib/constants/breed-images";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface AvatarSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSampleSelect: (imageUrl: string) => void;
  onBreedSelect: (breed: string, species: string, imageUrl: string) => void;
  currentBreed?: string;
}

export function AvatarSelectionModal({
  open,
  onClose,
  onSampleSelect,
  onBreedSelect,
  currentBreed,
}: AvatarSelectionModalProps) {
  const [activeTab, setActiveTab] = useState<"sample" | "browse">("sample");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    breed?: string;
    species?: string;
    type: "sample" | "browse";
  } | null>(null);

  // Tab switch handler
  const handleTabChange = (value: string) => {
    setActiveTab(value as "sample" | "browse");
    setSelectedImage(null);
    setSearchTerm("");
  };

  // Sample tab logic
  const sampleImages = useMemo(() => {
    if (!currentBreed) return [];
    return getBreedImages(currentBreed);
  }, [currentBreed]);

  const hasSamples = sampleImages.length > 0;

  // Browse tab logic
  const availableBreeds = useMemo(() => getAvailableBreeds(), []);

  const filteredBreeds = useMemo(() => {
    if (!searchTerm.trim()) return availableBreeds;
    const term = searchTerm.toLowerCase();
    return availableBreeds.filter(
      (b) =>
        b.breed.toLowerCase().includes(term) ||
        b.speciesLabel.toLowerCase().includes(term),
    );
  }, [availableBreeds, searchTerm]);

  const handleConfirm = () => {
    if (!selectedImage) return;

    if (selectedImage.type === "sample") {
      onSampleSelect(selectedImage.url);
    } else {
      if (selectedImage.breed && selectedImage.species) {
        onBreedSelect(
          selectedImage.breed,
          selectedImage.species,
          selectedImage.url,
        );
      }
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-lg h-[85vh] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-[var(--glass-border)] modal-content-no-padding">
        {/* Header */}
        <div className="p-4 border-b border-[var(--glass-border)] bg-background/50 backdrop-blur-md z-10 sticky top-0">
          <DialogTitle className="text-center font-bold mb-4">
            アイコン画像を選択
          </DialogTitle>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
              <TabsTrigger
                value="sample"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                サンプルから選ぶ
              </TabsTrigger>
              <TabsTrigger
                value="browse"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Grid className="w-4 h-4 mr-2" />
                画像から品種を選ぶ
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-secondary/5 relative">
          {activeTab === "sample" && (
            <div className="p-4 min-h-full">
              {!currentBreed ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-lg">
                      品種が設定されていません
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ペットの品種を設定すると、
                      <br />
                      対応するサンプル画像が表示されます。
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("browse")}
                    className="mt-4"
                  >
                    画像から品種を探す
                  </Button>
                </div>
              ) : !hasSamples ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-lg">
                      サンプル画像がありません
                    </p>
                    <p className="text-sm text-muted-foreground">
                      「{currentBreed}」のサンプル画像は
                      <br />
                      まだ用意されていません。
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("browse")}
                    className="mt-4"
                  >
                    他の品種の画像を探す
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    「{currentBreed}」の画像を選択してください
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {sampleImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setSelectedImage({ url: image.url, type: "sample" })
                        }
                        className={cn(
                          "relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-background",
                          selectedImage?.url === image.url
                            ? "border-primary ring-2 ring-primary/30 shadow-lg scale-95"
                            : "border-transparent hover:border-primary/50 hover:scale-[1.02]",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={`${currentBreed} ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {selectedImage?.url === image.url && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-primary rounded-full p-1.5 shadow-md">
                              <Check className="w-5 h-5 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "browse" && (
            <div className="p-4 flex flex-col min-h-full">
              <div className="relative mb-6 sticky top-0 z-10">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="品種名で検索..."
                  className="pl-10 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm"
                />
              </div>

              {filteredBreeds.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  該当する画像がありません
                </div>
              ) : (
                <div className="space-y-8 pb-20">
                  {filteredBreeds.map(
                    ({ breed, species, speciesLabel, images }) => (
                      <div key={breed} className="space-y-2">
                        <div className="flex items-center gap-2 sticky top-12 bg-secondary/95 backdrop-blur-sm py-2 px-2 -mx-2 z-1 rounded-lg">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            {speciesLabel}
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {breed}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                setSelectedImage({
                                  url: image.url,
                                  breed,
                                  species,
                                  type: "browse",
                                })
                              }
                              className={cn(
                                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-background",
                                selectedImage?.url === image.url
                                  ? "border-primary ring-2 ring-primary/30 shadow-lg scale-95"
                                  : "border-transparent hover:border-primary/50 hover:scale-[1.02]",
                              )}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={image.url}
                                alt={`${breed} ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              {selectedImage?.url === image.url && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                                  <div className="bg-primary rounded-full p-1.5 shadow-md">
                                    <Check className="w-4 h-4 text-primary-foreground" />
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--glass-border)] bg-background/50 backdrop-blur-md z-10">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedImage}
              className="flex-1 rounded-xl gradient-primary shadow-lg hover:shadow-primary/25"
            >
              この画像を使用
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
