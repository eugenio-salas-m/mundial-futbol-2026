"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string | null | undefined;
  alt?: string;
  size?: number;
  className?: string;
};

export default function AvatarZoom({
  src,
  alt = "Avatar",
  size = 40,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  if (!src) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`cursor-pointer rounded-full ${className}`}
      >
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="rounded-full object-cover"
        />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            p-4
          "
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              relative
              rounded-xl
              bg-white
              p-3
              shadow-xl
            "
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                absolute
                -right-3
                -top-3
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-black
                text-white
                shadow
              "
            >
              ×
            </button>

            <Image
              src={src}
              alt={alt}
              width={320}
              height={320}
              className="
                max-h-[80vh]
                w-auto
                rounded-lg
                object-contain
              "
            />
          </div>
        </div>
      )}
    </>
  );
}