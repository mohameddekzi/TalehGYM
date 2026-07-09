"use client";

import { useRef, useState } from "react";
import { Camera, Upload, X, RotateCcw } from "lucide-react";

/**
 * Member photo input: take a photo with the camera or upload a file.
 * Produces a square, downscaled JPEG data URL (kept small for demo storage).
 */
export function PhotoInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [camOpen, setCamOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const SIZE = 320;

  function squareToDataURL(source: CanvasImageSource, w: number, h: number): string {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;
    const min = Math.min(w, h);
    ctx.drawImage(source, (w - min) / 2, (h - min) / 2, min, min, 0, 0, SIZE, SIZE);
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  async function openCam() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = s;
      setCamOpen(true);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = s; });
    } catch {
      alert("Camera not available. Try uploading a photo instead.");
    }
  }
  function closeCam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOpen(false);
  }
  function capture() {
    const v = videoRef.current;
    if (!v) return;
    onChange(squareToDataURL(v, v.videoWidth, v.videoHeight));
    closeCam();
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => onChange(squareToDataURL(img, img.width, img.height));
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">Member photo</label>
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line/10 bg-surface-2">
          {camOpen ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Member" className="h-full w-full object-cover" />
          ) : (
            <Camera size={26} className="text-subtle" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {camOpen ? (
            <>
              <button type="button" onClick={capture} className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark">
                <Camera size={15} /> Capture
              </button>
              <button type="button" onClick={closeCam} className="inline-flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 text-sm text-foreground hover:bg-line/5">
                <X size={15} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={openCam} className="inline-flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 text-sm text-foreground hover:bg-line/5">
                <Camera size={15} /> Take photo
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 text-sm text-foreground hover:bg-line/5">
                <Upload size={15} /> Upload
              </button>
              {value ? (
                <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 text-sm text-muted hover:bg-line/5">
                  <RotateCcw size={15} /> Clear
                </button>
              ) : null}
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>
      </div>
    </div>
  );
}
