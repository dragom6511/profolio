// Lightbox — full-screen study view for a single artwork.
// Opened from any gallery layout. Shows the piece as large as the viewport
// allows (object-fit: contain), with a catalog plaque, prev/next navigation,
// a position counter, and keyboard control (← → Esc). Closing returns the
// user to the exact layout they were browsing.
//
// Magnify mode: click the image to zoom in (≈2.6×) centred on the click point,
// then move the cursor (or drag on touch) to pan around and inspect detail.
// Click again — or press Esc — to zoom back out. While magnified the plaque
// and nav arrows fade away so nothing competes with the surface.

const LB_ZOOM = 2.6;

function Lightbox({ list, index, setIndex, onClose, lang, t }) {
  const safeIdx = Math.max(0, Math.min(index, list.length - 1));
  const work = list[safeIdx];
  const series = work.series ? window.SERIES.find((s) => s.id === work.series) : null;

  // Track travel direction so the incoming image slides in from the right
  // (next) or left (prev), echoing the spotlight filmstrip motion.
  const [dir, setDir] = React.useState("next");

  // Magnify state. `origin` is the focal point as a percentage of the image's
  // own (unscaled) box; `rectRef` caches that box so panning maps the pointer
  // correctly even after the visual transform is applied.
  const [zoomed, setZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: 50, y: 50 });
  const rectRef = React.useRef(null);

  const prev = React.useCallback(() => {
    setDir("prev");
    setZoomed(false);
    setIndex((safeIdx - 1 + list.length) % list.length);
  }, [safeIdx, list.length, setIndex]);
  const next = React.useCallback(() => {
    setDir("next");
    setZoomed(false);
    setIndex((safeIdx + 1) % list.length);
  }, [safeIdx, list.length, setIndex]);

  // Reset magnification whenever the displayed work changes.
  React.useEffect(() => { setZoomed(false); }, [work.id]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { if (zoomed) setZoomed(false); else onClose(); }
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
  }, [onClose, prev, next, zoomed]);

  const setOriginFromPoint = (clientX, clientY) => {
    const r = rectRef.current;
    if (!r || r.width === 0 || r.height === 0) return;
    const x = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
    setOrigin({ x, y });
  };

  const onFigureClick = (e) => {
    e.stopPropagation();
    if (!work.src) return;
    if (zoomed) { setZoomed(false); return; }
    // Capture the image's unscaled box NOW (still at scale 1) so pointer→origin
    // mapping stays accurate while the transform is active.
    rectRef.current = e.currentTarget.getBoundingClientRect();
    setOriginFromPoint(e.clientX, e.clientY);
    setZoomed(true);
  };

  const onFigureMove = (e) => {
    if (!zoomed) return;
    setOriginFromPoint(e.clientX, e.clientY);
  };

  const wInfo = lang === "zh" ? work.zh : work.en;
  const medium = work.medium ? (lang === "zh" ? work.medium.zh : work.medium.en) : "";
  const size = work.size ? (lang === "zh" ? work.size.zh : work.size.en) : "";
  const seriesName = series ? (lang === "zh" ? series.zh.name : series.en.name) : null;

  const figureStyle = work.src
    ? {
        cursor: zoomed ? "zoom-out" : "zoom-in",
        ...(zoomed
          ? { transform: `scale(${LB_ZOOM})`, transformOrigin: `${origin.x}% ${origin.y}%` }
          : null),
      }
    : undefined;

  return (
    <div className={`lb ${zoomed ? "lb--zoomed" : ""}`} role="dialog" aria-modal="true" onClick={onClose}>
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
          className={`lb-figure ${zoomed ? "is-zoomed" : `lb-figure--${dir}`}`}
          key={work.id}
          src={work.src}
          alt={wInfo.title}
          draggable={false}
          style={figureStyle}
          onClick={onFigureClick}
          onPointerMove={onFigureMove} /> :

        <div
          className={`lb-figure lb-figure--placeholder lb-figure--${dir}`}
          key={work.id}
          style={{ aspectRatio: window.aspectFor(work) }}>
          <ArtworkImage work={work} label sizing="contain" />
        </div>
        }

        {work.src &&
        <div className="lb-zoomhint mono" aria-hidden="true">
          {zoomed
            ? (lang === "zh" ? "移動游標檢視局部 · 點擊縮小" : "Move to inspect · click to zoom out")
            : (lang === "zh" ? "點擊放大" : "Click to magnify")}
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
