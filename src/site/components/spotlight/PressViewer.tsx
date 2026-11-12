import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import type { ImageNewsEntry } from "@/site/data/news";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

/**
 * Digital press archive viewer. The cutting is the main attraction: at 100 % it is fitted
 * inside the viewing area (aspect ratio kept); zooming enlarges it and the area scrolls, or
 * can be dragged with a mouse. Details sit underneath.
 */
export default function PressViewer({
  entry,
  onClose,
}: {
  entry: ImageNewsEntry | null;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Each cutting opens at "fit".
  useEffect(() => setZoom(MIN_ZOOM), [entry?.id]);

  // Track the viewing area so "fit" always fills it.
  const observe = useCallback((node: HTMLDivElement | null) => {
    viewportRef.current = node;
    if (!node) return;
    const measure = () => setFrame({ width: node.clientWidth, height: node.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const changeZoom = (next: number) => {
    const viewport = viewportRef.current;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    if (!viewport || clamped === zoom) return setZoom(clamped);
    // Keep the point at the centre of the view in the centre after zooming.
    const ratio = clamped / zoom;
    const cx = viewport.scrollLeft + viewport.clientWidth / 2;
    const cy = viewport.scrollTop + viewport.clientHeight / 2;
    setZoom(clamped);
    requestAnimationFrame(() => {
      viewport.scrollLeft = cx * ratio - viewport.clientWidth / 2;
      viewport.scrollTop = cy * ratio - viewport.clientHeight / 2;
    });
  };

  useLayoutEffect(() => {
    if (zoom === MIN_ZOOM && viewportRef.current) {
      viewportRef.current.scrollLeft = 0;
      viewportRef.current.scrollTop = 0;
    }
  }, [zoom]);

  if (!entry) return null;

  // Breathing room around the cutting; tighter on phones so the cutting is as large as possible.
  const padding = frame.width > 0 && frame.width < 640 ? 10 : 24;
  const aspect = entry.fullImageWidth / entry.fullImageHeight;
  const fitWidth =
    frame.width > 0
      ? Math.min(frame.width - padding * 2, (frame.height - padding * 2) * aspect)
      : 0;
  const width = Math.max(0, Math.round(fitWidth * zoom));
  const canPan = zoom > MIN_ZOOM;
  const percent = Math.round(zoom * 100);

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 m-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:h-[min(92dvh,60rem)] sm:w-[min(94vw,68rem)] sm:rounded-3xl"
          aria-describedby="press-viewer-description"
          // Focus the close button rather than the first zoom control when the viewer opens.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            closeRef.current?.focus({ preventScroll: true });
          }}
        >
          {/* Image area */}
          <div className="relative flex min-h-0 flex-1 flex-col bg-[#f4f1ec]">
            <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-white/80 px-3 py-2 backdrop-blur sm:px-4">
              <div
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm"
                role="group"
                aria-label="Zoom"
              >
                <ToolButton
                  label="Zoom out"
                  onClick={() => changeZoom(zoom - ZOOM_STEP)}
                  disabled={zoom <= MIN_ZOOM}
                >
                  <Minus className="h-4 w-4" />
                </ToolButton>
                <span
                  className="w-12 text-center text-xs font-bold tabular-nums text-gray-600"
                  aria-live="polite"
                  data-testid="zoom-level"
                >
                  {percent}%
                </span>
                <ToolButton
                  label="Zoom in"
                  onClick={() => changeZoom(zoom + ZOOM_STEP)}
                  disabled={zoom >= MAX_ZOOM}
                >
                  <Plus className="h-4 w-4" />
                </ToolButton>
                <span className="mx-0.5 h-5 w-px bg-gray-200" aria-hidden="true" />
                <ToolButton
                  label="Reset zoom"
                  onClick={() => changeZoom(MIN_ZOOM)}
                  disabled={zoom === MIN_ZOOM}
                >
                  <RotateCcw className="h-4 w-4" />
                </ToolButton>
              </div>
              <DialogPrimitive.Close
                ref={closeRef}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close viewer"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>

            <div
              ref={observe}
              data-testid="press-viewport"
              className={`relative min-h-0 flex-1 overflow-auto overscroll-contain ${
                canPan ? (dragging ? "cursor-grabbing select-none" : "cursor-grab") : ""
              }`}
              onPointerDown={(event) => {
                if (!canPan || event.pointerType !== "mouse" || !viewportRef.current) return;
                const viewport = viewportRef.current;
                drag.current = {
                  x: event.clientX,
                  y: event.clientY,
                  left: viewport.scrollLeft,
                  top: viewport.scrollTop,
                };
                setDragging(true);
                viewport.setPointerCapture?.(event.pointerId);
              }}
              onPointerMove={(event) => {
                const start = drag.current;
                const viewport = viewportRef.current;
                if (!start || !viewport) return;
                viewport.scrollLeft = start.left - (event.clientX - start.x);
                viewport.scrollTop = start.top - (event.clientY - start.y);
              }}
              onPointerUp={() => {
                drag.current = null;
                setDragging(false);
              }}
              onPointerCancel={() => {
                drag.current = null;
                setDragging(false);
              }}
            >
              <div className="flex min-h-full min-w-full w-max" style={{ padding }}>
                <img
                  src={entry.fullImage}
                  alt={entry.thumbnailAlt}
                  width={entry.fullImageWidth}
                  height={entry.fullImageHeight}
                  draggable={false}
                  decoding="async"
                  className="m-auto block max-w-none rounded-sm bg-white shadow-[0_10px_40px_-12px_rgba(17,24,39,0.45)] ring-1 ring-black/5"
                  style={width ? { width, height: Math.round(width / aspect) } : { width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="max-h-[36%] shrink-0 overflow-y-auto border-t border-gray-100 px-5 py-5 sm:max-h-[30%] sm:px-8 sm:py-6">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-xs font-black tracking-widest text-primary uppercase">
                {entry.publicationName}
              </p>
              <span className="rounded-full bg-peach px-2.5 py-0.5 text-[11px] font-bold text-primary">
                {entry.kind}
              </span>
              {entry.publicationDate ? (
                <p className="text-xs font-semibold text-gray-500">{entry.publicationDate}</p>
              ) : null}
            </div>
            <DialogPrimitive.Title className="mb-3 text-xl font-black leading-snug text-dark sm:text-2xl">
              {entry.headline}
            </DialogPrimitive.Title>
            <div
              id="press-viewer-description"
              className="max-w-3xl space-y-3 text-sm leading-relaxed text-gray-600 sm:text-base"
            >
              {entry.description.split(/\n\s*\n/).map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-peach hover:text-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </button>
  );
}
