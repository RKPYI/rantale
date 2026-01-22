"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area, Point } from "react-easy-crop";
import { Button } from "./button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Label } from "./label";
import { ZoomIn, ZoomOut, RotateCw, Crop } from "lucide-react";

export interface ImageCropperProps {
  /** Image URL to crop */
  image: string;
  /** Aspect ratio for cropping (e.g., 1 for square, 2/3 for portrait) */
  aspect?: number;
  /** Callback when crop is completed */
  onCropComplete: (croppedImage: Blob) => void;
  /** Callback when cropping is cancelled */
  onCancel: () => void;
  /** Whether the dialog is open */
  open: boolean;
  /** Title for the crop dialog */
  title?: string;
  /** Description for the crop dialog */
  description?: string;
  /** Shape of the crop area */
  cropShape?: "rect" | "round";
}

/**
 * Create a cropped image from the crop area
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Get cropped image as blob
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5,
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      "image/jpeg",
      0.95,
    );
  });
}

export function ImageCropper({
  image,
  aspect = 1,
  onCropComplete,
  onCancel,
  open,
  title = "Crop Image",
  description = "Adjust the crop area to your liking",
  cropShape = "rect",
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleCropComplete = async () => {
    if (!croppedAreaPixels) return;

    try {
      setLoading(true);
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation,
      );
      onCropComplete(croppedImage);
    } catch (e) {
      console.error("Error cropping image:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cropper Area */}
          <div className="relative h-[300px] w-full overflow-hidden rounded-md bg-gray-100 sm:h-[350px] md:h-[400px] dark:bg-gray-800">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={cropShape}
              showGrid={true}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={onZoomChange}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <ZoomOut className="h-4 w-4" />
                  Zoom
                </Label>
                <span className="text-muted-foreground text-sm">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value: number[]) => setZoom(value[0])}
                  className="flex-1"
                />
                <ZoomIn className="text-muted-foreground h-4 w-4" />
              </div>
            </div>

            {/* Rotation Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotation
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                >
                  Rotate 90°
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[rotation]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={(value: number[]) => setRotation(value[0])}
                  className="flex-1"
                />
                <span className="text-muted-foreground w-12 text-right text-sm">
                  {rotation}°
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleCropComplete} disabled={loading}>
            {loading ? (
              "Processing..."
            ) : (
              <>
                <Crop className="mr-2 h-4 w-4" />
                Crop Image
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
