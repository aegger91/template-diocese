"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, LayerGroup, Marker } from "leaflet";

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  href: string;
  address: string;
  linkLabel: string;
}

// Same geometry as OrthodoxCross (slavic), inlined because Leaflet markers are plain HTML strings.
const CROSS_SVG =
  '<svg viewBox="0 0 40 60" width="9" height="14" fill="currentColor" aria-hidden="true"><rect x="18" y="0" width="4" height="60"/><rect x="12" y="8" width="16" height="3.5"/><rect x="3" y="18" width="34" height="5"/><polygon points="9,39.5 31,46.5 31,50.5 9,43.5"/></svg>';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export function ParishMap({
  points,
  focusId,
  tileUrl,
  attribution,
  unavailableLabel,
  ariaLabel,
}: {
  points: MapPoint[];
  focusId: string | null;
  tileUrl: string;
  attribution: string;
  unavailableLabel: string;
  ariaLabel: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);
  const [tilesFailed, setTilesFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !el.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(el.current, { scrollWheelZoom: false, attributionControl: true, zoomControl: true });
      let errors = 0;
      L.tileLayer(tileUrl, { attribution, maxZoom: 18 })
        .on("tileerror", () => {
          errors += 1;
          if (errors > 3) setTilesFailed(true);
        })
        .addTo(map);
      map.setView([42, -87], 5);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [tileUrl, attribution]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();
    for (const p of points) {
      const icon = L.divIcon({
        className: "parish-pin",
        html: `<span class="parish-pin__dot parish-pin__dot--${p.type}">${CROSS_SVG}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -14],
      });
      const marker = L.marker([p.lat, p.lng], { icon, title: p.name, alt: p.name, keyboard: true })
        .bindPopup(
          `<strong class="parish-popup__name">${escapeHtml(p.name)}</strong><br/><span>${escapeHtml(p.address)}</span><br/><a href="${escapeHtml(p.href)}">${escapeHtml(p.linkLabel)}</a>`,
        )
        .addTo(layer);
      markersRef.current.set(p.id, marker);
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 11);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [36, 36], maxZoom: 10 });
    }
  }, [points, ready]);

  useEffect(() => {
    if (!focusId || !mapRef.current) return;
    const m = markersRef.current.get(focusId);
    if (m) {
      mapRef.current.setView(m.getLatLng(), Math.max(mapRef.current.getZoom(), 9));
      m.openPopup();
    }
  }, [focusId]);

  return (
    <div className="relative isolate size-full">
      <div ref={el} className="size-full" role="region" aria-label={ariaLabel} />
      {tilesFailed ? (
        <p className="absolute inset-x-3 bottom-3 z-[1000] rounded-md bg-white/95 p-2 text-center text-xs text-muted-ink shadow">
          {unavailableLabel}
        </p>
      ) : null}
    </div>
  );
}
