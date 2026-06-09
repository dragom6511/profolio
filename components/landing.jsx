// Three landing styles. Each is a self-contained hero that fills the viewport.
// All three share the same nav and footer (rendered by app.jsx) so only the
// hero body differs.

function LandingSpotlight({ t, lang, onEnter, onOpen }) {
  // Curate which works hang on the wall. Skip W-02 panorama and anything
  // wider than ~1.7:1 so the row stays balanced. Cap at 5 frames.
  const wallWorks = window.ARTWORKS.
  filter((w) => w.src && w.id !== "02" && (typeof w.aspect !== "number" || w.aspect <= 1.7)).
  slice(0, 5);

  // Per-piece display size driven by the work's REAL physical dimensions.
  // We parse the centimetre size (e.g. "41.0 × 58.0 公分") and set the frame
  // height to realHeightCm × K pixels. Because the frame's width comes from its
  // aspect ratio (realW/realH), BOTH dimensions end up proportional to the true
  // painting — so a 58 cm piece hangs visibly larger than a 21 cm one, exactly
  // like a real museum wall. The whole row auto-scales to fit the viewport
  // (see the transform below), preserving these relative proportions on any
  // screen. Works missing a size fall back to a mid value so they still hang.
  const PX_PER_CM = 5;        // display scale
  const FALLBACK_CM = 36;     // height used when a work has no recorded size
  const realHeightCm = (w) => {
    const raw = (w.size && (w.size.zh || w.size.en)) || "";
    const nums = raw.match(/[\d.]+/g); // "W × H" → height is the second number
    if (nums && nums.length >= 2) {
      const h = parseFloat(nums[1]);
      if (isFinite(h) && h > 0) return h;
    }
    return FALLBACK_CM;
  };
  const pieceHeight = (w) => {
    const px = realHeightCm(w) * PX_PER_CM;
    // Generous guard rails so an outlier can't blow up or vanish; the current
    // collection (≈21–58 cm) sits inside and stays fully proportional.
    return `clamp(64px, ${px.toFixed(0)}px, 340px)`;
  };

  // Arrange the wall as a "mountain": the largest piece anchors the centre,
  // and pieces step DOWN in size toward both outer edges. This reads as a
  // balanced, symmetric hang whose silhouette peaks in the middle — far calmer
  // than the raw data order. Built from display height so it self-maintains as
  // sizes/works change. (Sort by height desc, then fan out from centre,
  // alternating right then left, so the two smallest land on the outer edges.)
  const hangWorks = (() => {
    const sorted = [...wallWorks].sort((a, b) => realHeightCm(b) - realHeightCm(a));
    const n = sorted.length;
    const res = new Array(n);
    const c = Math.floor((n - 1) / 2);
    let left = c - 1, right = c + 1;
    res[c] = sorted[0];
    for (let i = 1; i < n; i++) {
      if (i % 2 === 1) res[right++] = sorted[i];
      else res[left--] = sorted[i];
    }
    return res;
  })();

  // "Museum scaling": instead of reflowing the single hang-row into a grid on
  // narrow screens, keep the EXACT arrangement and scale the whole row down
  // uniformly so it always fits — like stepping back from the wall. We measure
  // the row's natural (unscaled) width and apply a transform:scale to the inner
  // wrapper. offsetWidth is a layout metric unaffected by the transform, so the
  // measurement never feeds back on itself. Capped at 1 so it never grows past
  // its intended desktop size. Only active in "scale" mode; "grid" mode lets the
  // CSS media query reflow into a 2-up grid instead.
  // "Museum scaling": on narrow screens, keep the EXACT single-row arrangement
  // and scale the whole row down uniformly so it always fits — like stepping
  // back from the wall — rather than reflowing into a grid. We measure the row's
  // natural (unscaled) width and apply a transform:scale to the inner wrapper.
  // offsetWidth is a layout metric unaffected by the transform, so the
  // measurement never feeds back on itself. Capped at 1 so it never grows past
  // its intended desktop size.
  const innerRef = React.useRef(null);
  React.useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const outer = inner.parentElement; // .gh-hangrow
    if (!outer) return;
    const recompute = () => {
      const natural = inner.offsetWidth; // unscaled layout width of the full row
      const cs = getComputedStyle(outer);
      const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const avail = outer.clientWidth - pad;
      // Bail when the row hasn't been laid out yet (width ~0) so a transient
      // zero measurement never permanently collapses the wall. The CSS default
      // (var(--gh-scale, 1)) keeps it full-size until a real measurement lands.
      if (avail <= 0 || natural <= 0) return;
      const s = Math.max(0.1, Math.min(1, avail / natural));
      inner.style.setProperty("--gh-scale", s.toFixed(4));
    };
    // Measure after the browser has actually laid out + painted the flex row.
    // A single rAF can still fire before the first layout on a cold load, so
    // double-rAF and a short timeout act as belt-and-suspenders.
    let raf1 = 0, raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(recompute);
    });
    const t = setTimeout(recompute, 120);
    const ro = new ResizeObserver(recompute);
    ro.observe(outer);
    window.addEventListener("resize", recompute);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [wallWorks.length, lang]);

  return (
    <section className="landing landing-gallery">
      <div className="gh-ambience" />
      <div className="gh-eyebrow mono">{t.landing.eyebrow}</div>

      <div className="gh-room">
        <div className="gh-wall gh-wall-back" />
        <div className="gh-wall gh-wall-left" />
        <div className="gh-wall gh-wall-right" />

        <div className="gh-hangrow">
          <div className="gh-hangrow-inner" ref={innerRef}>
          {hangWorks.map((w) =>
          <button
            key={w.id}
            className="gh-piece"
            style={{ "--piece-h": pieceHeight(w) }}
            onClick={() => onOpen && onOpen(window.ARTWORKS.indexOf(w))}
            title={lang === "zh" ? w.zh.title : w.en.title}>
            
              <span className="gh-piece-spot" />
              <span
              className="gh-piece-frame"
              style={{ aspectRatio: window.aspectFor(w), "--piece-h": pieceHeight(w) }}>
                <span
                className="gh-piece-art"
                style={{ backgroundImage: `url(${w.src})` }} />
              </span>
              {/* Reflection sits directly under each frame, flipped vertically and
              fading downward. */}
              <span className="gh-piece-reflection" aria-hidden="true">
                <span className="gh-piece-frame gh-piece-frame--ref" style={{ aspectRatio: window.aspectFor(w) }}>
                  <span
                  className="gh-piece-art"
                  style={{ backgroundImage: `url(${w.src})` }} />
                </span>
              </span>
            </button>
          )}
          </div>
        </div>

        <div className="gh-floor" aria-hidden="true" />
      </div>

      <div className="gh-invitation">
        <div className="gh-invitation-rule" />
        <div className="gh-invitation-title">
          <span className="gh-zh">{t.landing.hero_title}</span>
          <span className="gh-en">{t.landing.hero_title_2}</span>
        </div>
        <button className="gh-enter" onClick={onEnter}>
          <span>{t.landing.enter}</span>
          <span className="gh-enter-arrow">→</span>
        </button>
      </div>

      <div className="gh-corner-l mono">
        <div>{t.artist}</div>
        <div className="sub">{t.role}</div>
      </div>
      <div className="gh-corner-r mono">
        <div>{window.ARTWORKS.length} works</div>
        <div className="sub">2021 — 2026</div>
      </div>
    </section>);

}

function LandingManifesto({ t, lang, onEnter }) {
  const featured = window.ARTWORKS[0];
  return (
    <section className="landing landing-manifesto">
      <div className="manifesto-grid">
        <div className="mf-left">
          <div className="mf-eyebrow mono">{t.landing.manifesto_eyebrow}</div>
          <h1 className="mf-headline">
            {t.landing.hero_title}
            <br />
            <em>{t.landing.hero_title_2}</em>
          </h1>
          <div className="mf-body">
            {t.statement_body.slice(0, 2).map((p, i) =>
            <p key={i}>{p}</p>
            )}
          </div>
          <div className="mf-row">
            <button className="mf-cta" onClick={onEnter}>
              {t.landing.enter} →
            </button>
            <div className="mf-meta mono">
              <div>{window.ARTWORKS.length} works ／ 2021–2026</div>
              <div>{t.artist} ／ {t.artist_en}</div>
            </div>
          </div>
        </div>
        <div className="mf-right">
          <div className="mf-figure-wrap">
            <ArtworkFrame work={featured} sizing="cover" showLabel={false} paper={false} />
          </div>
          <div className="mf-caption mono">
            <div>W—{featured.id} ／ {lang === "zh" ? featured.zh.title : featured.en.title}</div>
            <div className="sub">
              {lang === "zh" ? featured.medium.zh : featured.medium.en} ／{" "}
              {lang === "zh" ? featured.size.zh : featured.size.en} ／ {featured.year}
            </div>
          </div>
        </div>
      </div>
      <div className="mf-fold mono">{t.landing.scroll_hint} ↓</div>
    </section>);

}

function LandingIndex({ t, lang, onEnter, onOpen }) {
  const [hover, setHover] = React.useState(0);
  const list = window.ARTWORKS;
  const active = list[hover];
  return (
    <section className="landing landing-index">
      <div className="idx-header">
        <div className="idx-eyebrow mono">{t.landing.index_label}</div>
        <h1 className="idx-name">
          <span className="idx-name-zh">{t.artist}</span>
          <span className="idx-name-en">{t.artist_en}</span>
        </h1>
        <div className="idx-lede">{t.landing.hero_lede}</div>
      </div>
      <div className="idx-stage">
        <div className="idx-preview">
          <div className="idx-preview-frame">
            <ArtworkFrame work={active} sizing="contain" showLabel={false} paper={false} />
          </div>
          <div className="idx-preview-meta mono">
            <div>W—{active.id} · {active.year}</div>
            <div className="sub">
              {lang === "zh" ? active.zh.title : active.en.title}
            </div>
          </div>
        </div>
        <ol className="idx-list">
          {list.map((w, i) =>
          <li
            key={w.id}
            className={`idx-row ${i === hover ? "active" : ""}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onOpen(i)}>
            
              <span className="idx-no mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="idx-title">
                {lang === "zh" ? w.zh.title : w.en.title}
              </span>
              <span className="idx-year mono">{w.year}</span>
              <span className="idx-arrow">↗</span>
            </li>
          )}
        </ol>
      </div>
      <button className="idx-enter" onClick={onEnter}>
        {t.landing.enter} →
      </button>
    </section>);

}

window.LandingSpotlight = LandingSpotlight;
window.LandingManifesto = LandingManifesto;
window.LandingIndex = LandingIndex;