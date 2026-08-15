"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/fallback.avif";

interface BlogCardImageProps
  extends Omit<ImageProps, "alt" | "onError" | "src"> {
  alt: string;
  src?: string | null;
}

function normalizeImageSource(source?: string | null) {
  const value = source?.trim();
  if (!value) return FALLBACK_IMAGE;

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? value
      : FALLBACK_IMAGE;
  } catch {
    return FALLBACK_IMAGE;
  }
}

export default function BlogCardImage({
  alt,
  src,
  ...imageProps
}: BlogCardImageProps) {
  const normalizedSrc = normalizeImageSource(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = failedSrc === normalizedSrc ? FALLBACK_IMAGE : normalizedSrc;

  return (
    <Image
      {...imageProps}
      src={imageSrc}
      alt={alt}
      onError={() => {
        if (imageSrc !== FALLBACK_IMAGE) setFailedSrc(normalizedSrc);
      }}
    />
  );
}
