"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface GalleryItem {
  id: string;
  album: string;
  src: string;
  alt: string;
  caption: string;
  credit: string;
}

export function Gallery({
  albums,
  items,
  labels,
}: {
  albums: { id: string; name: string }[];
  items: GalleryItem[];
  labels: { all: string; previous: string; next: string; credit: string; album: string };
}) {
  const [album, setAlbum] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const list = items.filter((i) => !album || i.album === album);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    const idx = items.findIndex((i) => i.id === id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (idx >= 0) setOpen(idx);
  }, [items]);

  const current = open === null ? null : list[open];
  const step = (dir: number) => setOpen((o) => (o === null ? o : (o + dir + list.length) % list.length));

  return (
    <div>
      <div role="group" aria-label={labels.album} className="flex flex-wrap gap-2">
        {[{ id: "", name: labels.all }, ...albums].map((a) => (
          <button
            key={a.id || "all"}
            type="button"
            aria-pressed={album === a.id}
            onClick={() => {
              setAlbum(a.id);
              setOpen(null);
            }}
            className="h-10 rounded-full border border-royal-200 px-4 text-sm font-semibold text-royal-800 transition hover:border-royal-600 aria-pressed:border-royal-800 aria-pressed:bg-royal-800 aria-pressed:text-white"
          >
            {a.name}
          </button>
        ))}
      </div>

      <ul className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {list.map((item, i) => (
          <li key={item.id} id={item.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden rounded-md border border-line bg-white text-start outline-none focus-visible:ring-3 focus-visible:ring-gold-500/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.alt} loading="lazy" className="w-full transition duration-300 group-hover:opacity-90" />
              <span className="block px-3 py-2.5">
                <span className="block text-sm font-semibold text-royal-900">{item.caption}</span>
                <span className="block text-xs text-muted-ink">{item.credit}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current !== null} onOpenChange={(o) => !o && setOpen(null)}>
        {current ? (
          <DialogContent
            className="max-h-[94svh] w-[min(96vw,68rem)] max-w-none gap-3 overflow-y-auto border-royal-800 bg-royal-950 p-3 text-white sm:max-w-none sm:p-5"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") step(document.dir === "rtl" ? -1 : 1);
              if (e.key === "ArrowLeft") step(document.dir === "rtl" ? 1 : -1);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.alt} className="mx-auto max-h-[72svh] w-auto max-w-full object-contain" />
            <div className="flex flex-wrap items-end justify-between gap-3 pe-8">
              <div className="min-w-0">
                <DialogTitle className="font-heading text-xl font-normal text-gold-300">{current.caption}</DialogTitle>
                <DialogDescription className="text-xs text-royal-200">
                  {labels.credit}: {current.credit}
                </DialogDescription>
              </div>
              {list.length > 1 ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="size-10 border-royal-600 bg-transparent text-white hover:bg-royal-800 hover:text-white" onClick={() => step(-1)} aria-label={labels.previous}>
                    <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
                  </Button>
                  <Button variant="outline" size="icon" className="size-10 border-royal-600 bg-transparent text-white hover:bg-royal-800 hover:text-white" onClick={() => step(1)} aria-label={labels.next}>
                    <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
                  </Button>
                </div>
              ) : null}
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
