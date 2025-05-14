import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image, X } from "lucide-react";
import { useRef, useState } from "react";

interface ImageUploadProps {
  onImageSelected: (file: File | null) => void;
  defaultImageUrl?: string;
}

export function ImageUpload({ onImageSelected, defaultImageUrl }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleFileSelected(file);
      }
    }
  };

  const handleFileSelected = (file: File) => {
    // Create preview URL locally (no server upload)
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Notify parent component
    onImageSelected(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageSelected(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {preview ? (
        <div className="relative">
          <Card className="overflow-hidden">
            <img 
              src={preview} 
              alt="Product preview" 
              className="w-full h-48 object-cover"
            />
            <Button
              type="button"
              size="icon"
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-full p-1"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging 
              ? "border-green-500 bg-green-50" 
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-gray-100 p-3">
              <Image className="h-6 w-6 text-gray-500" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-medium">
                <span className="text-green-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG or GIF (max. 5MB)
              </p>
            </div>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
} 