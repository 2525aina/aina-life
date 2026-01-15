"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBreedImages, hasBreedImages } from "@/lib/constants/breed-images";

interface SampleImagePickerProps {
  breed: string;
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

export function SampleImagePicker({
  breed,
  onSelect,
  onClose,
}: SampleImagePickerProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const images = getBreedImages(breed);

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  if (images.length === 0) {
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
              「{breed}」のサンプル画像はまだ用意されていません。
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
        className="bg-card rounded-2xl p-4 m-4 max-w-md w-full max-h-[80vh] overflow-hidden shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            サンプル画像を選択
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          「{breed}」のサンプル画像から選んでください
        </p>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedUrl(image.url)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedUrl === image.url
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={`${breed} サンプル ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selectedUrl === image.url && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary rounded-full p-1">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                )}
                {image.credit && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                    📷 {image.credit}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">
            キャンセル
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedUrl}
            className="flex-1"
          >
            この画像を使用
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

interface SampleImageButtonProps {
  breed: string;
  onSelect: (imageUrl: string) => void;
  className?: string;
}

/**
 * サンプル画像選択ボタン
 * 品種にサンプル画像がある場合のみ表示
 */
export function SampleImageButton({
  breed,
  onSelect,
  className,
}: SampleImageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 品種が未選択または画像がない場合は非表示
  if (!breed || !hasBreedImages(breed)) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <ImageIcon className="w-4 h-4 mr-2" />
        サンプル画像から選ぶ
      </Button>

      <AnimatePresence>
        {isOpen && (
          <SampleImagePicker
            breed={breed}
            onSelect={onSelect}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
