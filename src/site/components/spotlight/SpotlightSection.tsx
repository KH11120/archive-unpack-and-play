import { useState } from "react";
import { ArrowUpRight, Newspaper, ZoomIn } from "lucide-react";
import { newsEntries, type ImageNewsEntry, type NewsEntry } from "@/site/data/news";
import PressViewer from "./PressViewer";

const cardClass =
  "group flex h-full w-[17rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-[0_2px_10px_-4px_rgba(17,24,39,0.12)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-[0_14px_30px_-14px_rgba(17,24,39,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-[18.5rem]";

function Thumbnail({ entry }: { entry: NewsEntry }) {
  if (!entry.thumbnail) {
    // No matching image was supplied: a clean text panel rather than an unrelated picture.
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 bg-peach px-6 text-center">
        <Newspaper className="h-6 w-6 text-primary" aria-hidden="true" />
        <p className="text-base font-black leading-tight text-dark">{entry.publicationName}</p>
      </div>
    );
  }
  return (
    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
      <img
        src={entry.thumbnail}
        alt={entry.thumbnailAlt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        style={{ objectPosition: entry.thumbnailPosition ?? "center" }}
      />
    </div>
  );
}

function CardBody({ entry }: { entry: NewsEntry }) {
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="min-w-0 text-xs leading-snug font-black tracking-widest text-dark uppercase">
          {entry.publicationName}
        </p>
        <span className="shrink-0 rounded-full bg-peach px-2 py-0.5 text-[10px] font-bold text-primary">
          {entry.kind}
        </span>
      </div>
      <h3 className="line-clamp-3 text-[15px] font-bold leading-snug text-gray-800">
        {entry.headline}
      </h3>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-xs font-semibold text-gray-400">{entry.publicationDate ?? ""}</span>
        {entry.type === "online" ? (
          <span className="inline-flex items-center gap-1 text-xs font-black text-primary">
            Read Article <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-black text-primary">
            <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" /> View Coverage
          </span>
        )}
      </div>
    </div>
  );
}

function NewsCard({
  entry,
  hidden,
  onOpen,
}: {
  entry: NewsEntry;
  /** The duplicate set that makes the loop seamless: clickable, but skipped by keyboard and screen readers. */
  hidden: boolean;
  onOpen: (entry: ImageNewsEntry) => void;
}) {
  const a11y = hidden ? { tabIndex: -1 } : {};
  if (entry.type === "online") {
    return (
      <a
        href={entry.articleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
        aria-label={
          hidden ? undefined : `${entry.headline}, ${entry.publicationName} (opens in a new tab)`
        }
        data-news-id={entry.id}
        {...a11y}
      >
        <Thumbnail entry={entry} />
        <CardBody entry={entry} />
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className={cardClass}
      aria-haspopup="dialog"
      aria-label={hidden ? undefined : `View coverage: ${entry.headline}, ${entry.publicationName}`}
      data-news-id={entry.id}
      {...a11y}
    >
      <Thumbnail entry={entry} />
      <CardBody entry={entry} />
    </button>
  );
}

function CardGroup({ copy, onOpen }: { copy: boolean; onOpen: (entry: ImageNewsEntry) => void }) {
  return (
    <ul
      className={`spotlight-marquee-group flex shrink-0 items-stretch ${copy ? "spotlight-marquee-copy" : ""}`}
      aria-hidden={copy || undefined}
    >
      {newsEntries.map((entry) => (
        <li key={entry.id} className="spotlight-marquee-item flex shrink-0 px-2.5 py-3">
          <NewsCard entry={entry} hidden={copy} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  );
}

export default function SpotlightSection() {
  const [open, setOpen] = useState<ImageNewsEntry | null>(null);

  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="spotlight-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 sm:mb-8">
          <div className="section-label mb-3">APTCODER IN THE SPOTLIGHT</div>
          <h2 id="spotlight-heading" className="mb-3 text-3xl font-black text-dark sm:text-4xl">
            From India to the World
          </h2>
          {/* One line on desktop (about 790px at 16px); wraps naturally on smaller screens. */}
          <p className="max-w-4xl text-sm text-gray-500 sm:text-base">
            Discover APTCODER’s media features, institutional milestones and growing impact in
            technology education.
          </p>
        </div>
      </div>

      {/* Full-width strip: scrolls on its own, pauses on hover or keyboard focus. On touch
          screens and for reduced motion it becomes a swipeable row instead. */}
      <div className="mx-auto max-w-7xl sm:px-4 lg:px-6">
        <div className="spotlight-marquee" data-testid="spotlight-strip">
          <div className="spotlight-marquee-track">
            <CardGroup copy={false} onOpen={setOpen} />
            <CardGroup copy onOpen={setOpen} />
          </div>
        </div>
      </div>

      <PressViewer entry={open} onClose={() => setOpen(null)} />
    </section>
  );
}
