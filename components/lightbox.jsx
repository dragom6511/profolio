// Lightbox — full-screen study view for a single artwork.
// Opened from any gallery layout. Shows the piece as large as the viewport
// allows (object-fit: contain), with a catalog plaque, prev/next navigation,
// a position counter, and keyboard control (← → Esc). Closing returns the
// user to the exact layout they were browsing.

function Lightbox({ list, index, setIndex, onClose, lang, t }) {
  const safeIdx = Math.max(0, Math.min(index, list.length - 1));
  const work = list[safeIdx];
  const series = work.series ? window.SERIES.find((s) => s.id === work.series) : null;

  // Track travel direction so the incoming image slides in from the right
  // (next) or left (prev), echoing the spotlight filmstrip motion.
  const [dir, setDir] = React.useState("next");
  const prev = React.useCallback(() => {
    setDir("prev");
    setIndex((safeIdx - 1 + list.length) % list.length);
  }, [safeIdx, list.length, setIndex]);
  const next = React.useCallback(() => {
    setDir("next");
    setIndex((safeIdx + 1) % list.length);
  }, [safeIdx, list.length, setIndex]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    // Lock background scroll while open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  const wInfo = lang === "zh" ? work.zh : work.en;
  const medium = work.medium ? (lang === "zh" ? work.medium.zh : work.medium.en) : "";
  const size = work.size ? (lang === "zh" ? work.size.zh : work.size.en) : "";
  const seriesName = series ? (lang === "zh" ? series.zh.name : series.en.name) : null;

  return (
    <div className="lb" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="lb-topbar" onClick={(e) => e.stopPropagation()}>
        <span className="lb-cat mono">W—{work.id}</span>
        <span className="lb-count mono">
          {String(safeIdx + 1).padStart(2, "0")} <span className="dim">／ {String(list.length).padStart(2, "0")}</span>
        </span>
        <button className="lb-close mono" onClick={onClose} aria-label="Close">
          <span>{lang === "zh" ? "關閉" : "Close"}</span>
          <span className="lb-close-x">✕</span>
        </button>
      </div>

      <button
        className="lb-nav lb-nav-l"
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label={t.gallery.prev}>
        ←
      </button>

      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        {work.src ?
        <img
          className={`lb-figure lb-figure--${dir}`}
          key={work.id}
          src={work.src}
          alt={wInfo.title} /> :

        <div
          className={`lb-figure lb-figure--placeholder lb-figure--${dir}`}
          key={work.id}
          style={{ aspectRatio: window.aspectFor(work) }}>
          <ArtworkImage work={work} label sizing="contain" />
        </div>
        }
      </div>

      <button
        className="lb-nav lb-nav-r"
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label={t.gallery.next}>
        →
      </button>

      <div className="lb-plaque" onClick={(e) => e.stopPropagation()}>
        <h2 className="lb-title">{wInfo.title}</h2>
        {wInfo.sub && <div className="lb-sub">{wInfo.sub}</div>}
        <div className="lb-meta mono">
          <span>{work.year}</span>
          {medium && <><span className="sep">·</span><span>{medium}</span></>}
          {size && <><span className="sep">·</span><span>{size}</span></>}
          {seriesName && <><span className="sep">·</span><span>{seriesName}</span></>}
        </div>
        {wInfo.caption && <p className="lb-caption">{wInfo.caption}</p>}
      </div>
    </div>
  );
}

window.Lightbox = Lightbox;
