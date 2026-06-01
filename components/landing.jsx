// Three landing styles. Each is a self-contained hero that fills the viewport.
// All three share the same nav and footer (rendered by app.jsx) so only the
// hero body differs.

function LandingSpotlight({ t, lang, onEnter, onOpen }) {
  // Curate which works hang on the wall. Skip W-02 panorama and anything
  // wider than ~1.7:1 so the row stays balanced. Cap at 5 frames.
  const wallWorks = window.ARTWORKS.
  filter((w) => w.src && w.id !== "02" && (typeof w.aspect !== "number" || w.aspect <= 1.7)).
  slice(0, 5);

  // Per-piece display height. Real museum hang scales paintings by their
  // physical size — portraits dominate, landscapes are quieter. We use
  // each work's aspect ratio as a proxy: taller pieces hang larger.
  // Returns a CSS length string that respects viewport via vh.
  const pieceHeight = (w) => {
    const a = typeof w.aspect === "number" ? w.aspect : 1;
    if (a < 0.7) return "clamp(160px, 28vh, 280px)"; // tall portrait
    if (a < 0.95) return "clamp(150px, 25vh, 250px)"; // portrait
    if (a < 1.15) return "clamp(120px, 20vh, 200px)"; // square
    return "clamp(100px, 16vh, 160px)"; // landscape
  };

  return (
    <section className="landing landing-gallery">
      <div className="gh-ambience" />
      <div className="gh-eyebrow mono">{t.landing.eyebrow}</div>

      <div className="gh-room">
        <div className="gh-wall gh-wall-back" />
        <div className="gh-wall gh-wall-left" />
        <div className="gh-wall gh-wall-right" />

        <div className="gh-hangrow">
          {wallWorks.map((w) =>
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