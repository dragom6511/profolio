// Gallery — four layouts, all reading from window.ARTWORKS.
// Spotlight: single piece at a time with full plaque, prev/next.
// Grid: clean equal-sized cells.
// Masonry: column-flow varied heights.
// Editorial: staggered, magazine-collage feel.

function useKeyNav(prev, next) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();else
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);
}

function GallerySpotlight({ t, lang, index, setIndex, onPickSeries, activeSeries, onZoom }) {
  const list = window.ARTWORKS;
  const filtered = activeSeries === "all" ? list : list.filter((w) => w.series === activeSeries);
  const safeIdx = Math.max(0, Math.min(index, filtered.length - 1));
  const work = filtered[safeIdx];
  const series = work.series ? window.SERIES.find((s) => s.id === work.series) : null;

  // Book-flip transition: when navigation happens, the currently-displayed
  // work becomes "outgoing" and rotates out around its spine, revealing the
  // new work behind it. After the animation ends, we drop the outgoing.
  const [outgoing, setOutgoing] = React.useState(null); // { work, dir } | null
  const lastSeenRef = React.useRef(work);
  const dirRef = React.useRef("next");
  const FLIP_MS = 420;

  React.useEffect(() => {
    if (lastSeenRef.current && lastSeenRef.current.id !== work.id) {
      setOutgoing({ work: lastSeenRef.current, dir: dirRef.current });
      const t = setTimeout(() => setOutgoing(null), FLIP_MS);
      lastSeenRef.current = work;
      return () => clearTimeout(t);
    }
    lastSeenRef.current = work;
  }, [work.id]);

  const prev = () => {dirRef.current = "prev";setIndex((safeIdx - 1 + filtered.length) % filtered.length);};
  const next = () => {dirRef.current = "next";setIndex((safeIdx + 1) % filtered.length);};
  useKeyNav(prev, next);

  const wInfo = lang === "zh" ? work.zh : work.en;
  const medium = work.medium ? lang === "zh" ? work.medium.zh : work.medium.en : "—";
  const size = work.size ? lang === "zh" ? work.size.zh : work.size.en : "—";
  const seriesName = series ? lang === "zh" ? series.zh.name : series.en.name : null;

  return (
    <div className="gx-spot">
      <div className="gx-stage">
        <button className="gx-nav gx-nav-l" onClick={prev} aria-label={t.gallery.prev}>
          <span className="gx-nav-arrow">←</span>
          <span className="gx-nav-label mono">{t.gallery.prev}</span>
        </button>
        <div className="gx-spot-art" data-flip-dir={dirRef.current}>
          {/* incoming / now-displayed work */}
          <div
            className="gx-spot-frame gx-spot-frame--incoming gx-spot-frame--zoomable"
            key={work.id}
            style={{ aspectRatio: window.aspectFor(work) }}
            onClick={() => onZoom && onZoom(safeIdx)}
            title={lang === "zh" ? "放大檢視" : "View larger"}>
            <div className="gx-spot-beam" />
            <ArtworkFrame work={work} sizing="contain" showLabel={!work.src} paper={false} />
            <span className="gx-spot-zoom mono" aria-hidden="true">⤢</span>
          </div>
          {/* outgoing work — slides out alongside the new one */}
          {outgoing &&
          <div
            className={`gx-spot-frame gx-spot-frame--outgoing gx-spot-frame--${outgoing.dir}`}
            style={{ aspectRatio: window.aspectFor(outgoing.work) }}
            key={`out-${outgoing.work.id}-${Date.now()}`}>
            
              <div className="gx-spot-beam" />
              <ArtworkFrame work={outgoing.work} sizing="contain" showLabel={!outgoing.work.src} paper={false} />
            </div>
          }
        </div>
        <button className="gx-nav gx-nav-r" onClick={next} aria-label={t.gallery.next}>
          <span className="gx-nav-arrow">→</span>
          <span className="gx-nav-label mono">{t.gallery.next}</span>
        </button>
      </div>

      <div className="gx-brief">
        <div className="gx-brief-no mono">
          W—{work.id}
        </div>
        <h2 className="gx-brief-title">{wInfo.title}</h2>
        <div className="gx-brief-sub">{wInfo.sub}</div>
        <div className="gx-brief-line mono">
          <span>{work.year}</span>
          <span className="sep">·</span>
          <span>{medium}</span>
          {size && size !== "—" &&
          <>
              <span className="sep">·</span>
              <span>{size}</span>
            </>
          }
          {seriesName &&
          <>
              <span className="sep">·</span>
              <span>{seriesName}</span>
            </>
          }
        </div>
        {work.zh.caption &&
        <p className="gx-brief-caption">
            {lang === "zh" ? work.zh.caption : work.en.caption}
          </p>
        }
      </div>

      <div className="gx-rail">
        {filtered.map((w, i) =>
        <button
          key={w.id}
          className={`gx-rail-thumb ${i === safeIdx ? "active" : ""}`}
          onClick={() => setIndex(i)}
          title={lang === "zh" ? w.zh.title : w.en.title}>
          
            <div className="gx-rail-thumb-img">
              <ArtworkImage work={w} label={false} sizing="cover" />
            </div>
            <span className="mono">{String(i + 1).padStart(2, "0")}</span>
          </button>
        )}
      </div>
    </div>);

}

function Field({ label, value }) {
  return (
    <div className="gx-field">
      <div className="gx-field-l">{label}</div>
      <div className="gx-field-v">{value}</div>
    </div>);

}

function GalleryGrid({ t, lang, onZoom, list }) {
  return (
    <div className="gx-grid">
      {list.map((w, i) =>
      <button
        key={w.id}
        className="gx-cell"
        onClick={() => onZoom(i)}>
        
          <div className="gx-cell-img">
            <ArtworkImage work={w} label={false} sizing="cover" />
          </div>
          <div className="gx-cell-meta">
            <div className="mono gx-cell-no">W—{w.id}</div>
            <div className="gx-cell-title">{lang === "zh" ? w.zh.title : w.en.title}</div>
          </div>
        </button>
      )}
    </div>);

}

function GalleryMasonry({ t, lang, onZoom, list }) {
  return (
    <div className="gx-masonry">
      {list.map((w, i) =>
      <button
        key={w.id}
        className="gx-m-cell"
        onClick={() => onZoom(i)}>
        
          <div className="gx-cell-img" style={{ aspectRatio: window.aspectFor(w) }}>
            <ArtworkImage work={w} label={false} sizing="cover" />
          </div>
          <div className="gx-m-meta">
            <span className="mono">W—{w.id}</span>
            <span>{lang === "zh" ? w.zh.title : w.en.title}</span>
          </div>
        </button>
      )}
    </div>);

}

// Editorial: a hand-tuned 12-col scatter. We tile a 4-piece pattern across
// all works so it feels designed rather than auto-laid-out.
const ED_PATTERN = [
{ col: "1 / 7", row: 1, ar: "wide", tone: "lg" },
{ col: "8 / 11", row: 1, ar: "tall", tone: "md" },
{ col: "11 / 13", row: 1, ar: "tall", tone: "sm" },
{ col: "1 / 4", row: 2, ar: "tall", tone: "sm" },
{ col: "4 / 8", row: 2, ar: "square", tone: "md" },
{ col: "8 / 13", row: 2, ar: "wide", tone: "lg" }];


function GalleryEditorial({ t, lang, onZoom, list }) {
  // group of 6 → 1 strip
  const strips = [];
  for (let i = 0; i < list.length; i += 6) strips.push(list.slice(i, i + 6));
  return (
    <div className="gx-edit">
      {strips.map((strip, sIdx) =>
      <div className="gx-edit-strip" key={sIdx}>
          {strip.map((w, j) => {
          const slot = ED_PATTERN[j] || ED_PATTERN[0];
          const globalIdx = sIdx * 6 + j;
          return (
            <button
              key={w.id}
              className={`gx-edit-cell tone-${slot.tone}`}
              style={{ gridColumn: slot.col, gridRow: slot.row }}
              onClick={() => onZoom(globalIdx)}>
              
                <div className="gx-edit-cell-img" style={{ aspectRatio: window.aspectFor({ aspect: slot.ar }) }}>
                  <ArtworkImage work={w} label={false} sizing="cover" />
                </div>
                <div className="gx-edit-meta">
                  <div className="mono">W—{w.id} ／ {w.year}</div>
                  <div className="gx-edit-title">
                    {lang === "zh" ? w.zh.title : w.en.title}
                  </div>
                  <div className="gx-edit-sub">
                    <em>{lang === "zh" ? w.zh.sub : w.zh.sub /* keep zh as secondary line for texture */}</em>
                  </div>
                </div>
              </button>);

        })}
        </div>
      )}
    </div>);

}

function Gallery({ t, lang, layout, setLayout, index, setIndex, seriesFilter, setSeriesFilter }) {
  const all = window.ARTWORKS;
  const list = seriesFilter === "all" ? all : all.filter((w) => w.series === seriesFilter);
  const activeSeries = seriesFilter === "all" ? null : window.SERIES.find((s) => s.id === seriesFilter);
  // Clamp index to the current filtered list so the header counter stays
  // accurate when the user switches series.
  const safeIdx = Math.max(0, Math.min(index, list.length - 1));
  // Only show series that actually have works assigned to them. Series with
  // zero works (e.g. just-added placeholders for upcoming uploads) stay
  // hidden from the filter UI until the first work is tagged.
  const populatedSeries = window.SERIES.filter((s) =>
  all.some((w) => w.series === s.id)
  );

  // Lightbox: holds the index (into the current filtered `list`) of the work
  // being studied full-screen, or null when closed.
  const [zoom, setZoom] = React.useState(null);

  return (
    <section className="page page-gallery">
      <header className="gx-head">
        <div className="gx-head-l">
          <div className="page-eyebrow mono">{t.gallery.subtitle}</div>
          <h1 className="page-title">{t.gallery.title}</h1>
        </div>
        <div className="gx-head-r">
          <div className="gx-filter">
            <button
              className={`gx-filter-pill ${seriesFilter === "all" ? "active" : ""}`}
              onClick={() => {
                setSeriesFilter("all");
                setIndex(0);
              }}>
              {t.gallery.filter_all}
            </button>
            <button
              className={`gx-filter-pill ${seriesFilter !== "all" ? "active" : ""}`}
              onClick={() => {
                if (seriesFilter === "all" && populatedSeries.length > 0) {
                  setSeriesFilter(populatedSeries[0].id);
                  setIndex(0);
                }
              }}>
              {t.gallery.filter_series}
            </button>
          </div>
          <div className="gx-filter-sub" aria-hidden={seriesFilter === "all"}>
              {seriesFilter !== "all" && populatedSeries.map((s) =>
            <button
              key={s.id}
              className={`gx-filter-sub-pill ${seriesFilter === s.id ? "active" : ""}`}
              onClick={() => {
                setSeriesFilter(s.id);
                setIndex(0);
              }}>
                  <span className="mono">{s.no}</span> {lang === "zh" ? s.zh.name : s.en.name}
                </button>
            )}
            </div>
          <div className="page-meta mono">
            <span>{String(safeIdx + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span>
          </div>
        </div>
      </header>

      {layout === "spotlight" &&
      <GallerySpotlight
        t={t}
        lang={lang}
        index={index}
        setIndex={setIndex}
        activeSeries={seriesFilter}
        onZoom={setZoom} />

      }
      {layout === "grid" &&
      <GalleryGrid t={t} lang={lang} onZoom={setZoom} list={list} />
      }
      {layout === "masonry" &&
      <GalleryMasonry t={t} lang={lang} onZoom={setZoom} list={list} />
      }
      {layout === "editorial" &&
      <GalleryEditorial t={t} lang={lang} onZoom={setZoom} list={list} />
      }

      {zoom !== null &&
      <Lightbox
        list={list}
        index={zoom}
        setIndex={setZoom}
        onClose={() => setZoom(null)}
        lang={lang}
        t={t} />
      }
    </section>);

}

window.Gallery = Gallery;