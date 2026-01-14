"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BREED_IMAGES, type BreedImage } from "@/lib/constants/breed-images";
import { SPECIES_DATA } from "@/lib/constants/species";

interface BreedImageBrowserProps {
    onSelect: (breed: string, species: string, imageUrl: string) => void;
    onClose: () => void;
}

// 品種からspeciesを逆引きするヘルパー
function findSpeciesForBreed(
    breed: string
): { species: string; label: string } | null {
    // 犬
    const dogs = SPECIES_DATA.mammals.categories.dogs;
    if ((dogs.breeds as readonly string[]).includes(breed)) {
        return { species: dogs.species, label: dogs.label };
    }

    // 猫
    const cats = SPECIES_DATA.mammals.categories.cats;
    if ((cats.breeds as readonly string[]).includes(breed)) {
        return { species: cats.species, label: cats.label };
    }

    // 小動物
    const smallMammals = SPECIES_DATA.mammals.categories.small_mammals.categories;
    for (const category of Object.values(smallMammals)) {
        if ((category.breeds as readonly string[]).includes(breed)) {
            return { species: breed, label: category.label };
        }
    }

    // 鳥類
    const birds = SPECIES_DATA.birds.categories.parrots_and_finches;
    if ((birds.breeds as readonly string[]).includes(breed)) {
        return { species: breed, label: birds.label };
    }

    // 爬虫類
    for (const category of Object.values(SPECIES_DATA.reptiles.categories)) {
        if ((category.breeds as readonly string[]).includes(breed)) {
            return { species: breed, label: category.label };
        }
    }

    // 両生類
    const amphibians = SPECIES_DATA.amphibians.categories.frogs_and_salamanders;
    if ((amphibians.breeds as readonly string[]).includes(breed)) {
        return { species: breed, label: amphibians.label };
    }

    // 魚類
    for (const category of Object.values(SPECIES_DATA.fish.categories)) {
        if ((category.breeds as readonly string[]).includes(breed)) {
            return { species: breed, label: category.label };
        }
    }

    // 無脊椎動物
    const invertebrates =
        SPECIES_DATA.invertebrates.categories.insects_and_others;
    if ((invertebrates.breeds as readonly string[]).includes(breed)) {
        return { species: breed, label: invertebrates.label };
    }

    return null;
}

// 画像が登録されている品種のみを取得
function getAvailableBreeds(): {
    breed: string;
    species: string;
    speciesLabel: string;
    images: BreedImage[];
}[] {
    const result: {
        breed: string;
        species: string;
        speciesLabel: string;
        images: BreedImage[];
    }[] = [];

    for (const [breed, images] of Object.entries(BREED_IMAGES)) {
        if (images && images.length > 0) {
            const speciesInfo = findSpeciesForBreed(breed);
            if (speciesInfo) {
                result.push({
                    breed,
                    species: speciesInfo.species,
                    speciesLabel: speciesInfo.label,
                    images,
                });
            }
        }
    }

    return result;
}

export function BreedImageBrowser({
    onSelect,
    onClose,
}: BreedImageBrowserProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const availableBreeds = useMemo(() => getAvailableBreeds(), []);

    const filteredBreeds = useMemo(() => {
        if (!searchTerm.trim()) return availableBreeds;
        const term = searchTerm.toLowerCase();
        return availableBreeds.filter(
            (b) =>
                b.breed.toLowerCase().includes(term) ||
                b.speciesLabel.toLowerCase().includes(term)
        );
    }, [availableBreeds, searchTerm]);

    if (availableBreeds.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card rounded-2xl p-6 m-4 max-w-sm w-full shadow-xl"
                >
                    <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-foreground font-medium mb-2">
                            サンプル画像がありません
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            まだサンプル画像が登録されていません。
                        </p>
                        <Button onClick={onClose} variant="outline" className="w-full">
                            閉じる
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-2xl p-4 m-4 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                        画像から品種を選択
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="品種名で検索..."
                        className="pl-10 rounded-xl"
                    />
                </div>

                {/* Image Grid */}
                <div className="flex-1 overflow-y-auto">
                    {filteredBreeds.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            該当する画像がありません
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredBreeds.map(({ breed, species, speciesLabel, images }) => (
                                <div key={breed}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            {speciesLabel}
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {breed}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => onSelect(breed, species, image.url)}
                                                className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:scale-105"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={image.url}
                                                    alt={`${breed} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} className="w-full">
                        キャンセル
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

interface BrowseAllImagesButtonProps {
    onSelect: (breed: string, species: string, imageUrl: string) => void;
    className?: string;
}

/**
 * 全サンプル画像を閲覧するボタン
 * 画像から品種を逆設定できる
 */
export function BrowseAllImagesButton({
    onSelect,
    className,
}: BrowseAllImagesButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const availableBreeds = getAvailableBreeds();

    // 画像が1つもない場合は非表示
    if (availableBreeds.length === 0) {
        return null;
    }

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(true)}
                className={className}
            >
                <ImageIcon className="w-4 h-4 mr-2" />
                画像から品種を選ぶ
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <BreedImageBrowser
                        onSelect={(breed, species, imageUrl) => {
                            onSelect(breed, species, imageUrl);
                            setIsOpen(false);
                        }}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
