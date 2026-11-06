"use client";

import { useId, useState, type ChangeEvent } from "react";
import { IMAGE_ACCEPT, IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/lib/admin/limits";

const MAX_EDGE = 1600;
const RESIZE_ABOVE = 1.5 * 1024 * 1024;

/** Shrinks big phone photos in the browser (longest side 1600px, JPEG) so uploads are quick and always under the limit. */
async function downscale(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= RESIZE_ABOVE) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

export function PhotoInput({ name = "image", hint }: { name?: string; hint?: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const id = useId();

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    setMsg(null);
    input.setCustomValidity("");
    if (!file) return;
    if (!IMAGE_TYPES[file.type]) {
      input.value = "";
      setMsg("Use a JPG, PNG, WEBP or AVIF photo.");
      return;
    }
    let out = file;
    try {
      out = await downscale(file);
    } catch {
      /* keep the original if the browser cannot resize it */
    }
    if (out.size > MAX_IMAGE_BYTES) {
      input.value = "";
      setMsg(`That photo is ${(out.size / 1048576).toFixed(1)} MB. The limit is ${MAX_IMAGE_LABEL}; try a smaller export.`);
      return;
    }
    if (out !== file) {
      const dt = new DataTransfer();
      dt.items.add(out);
      input.files = dt.files;
      setMsg(`Resized to ${(out.size / 1048576).toFixed(1)} MB for a quick upload.`);
    }
  }

  return (
    <div>
      <input
        id={id}
        name={name}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={onChange}
        className="mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-white"
      />
      <p className="mt-1 text-xs text-muted">{msg ?? hint}</p>
    </div>
  );
}
