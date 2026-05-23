// Main App — nav, page routing, footer, tweaks panel wiring.

// Pages in linear order for scroll-snap navigation. Scrolling past the bottom
// or top of the page advances/retreats through this list.
const PAGE_ORDER = ["home", "works", "statement", "journal", "about", "contact"];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "zh",
  "landing": "spotlight",
  "layout": "spotlight"
} /*EDITMODE-END*/;

// URL params let you link directly to a specific variation, e.g.
//   index.html?landing=manifesto&layout=grid&lang=en&page=works
function urlOverrides(defaults) {
  try {
    const qs = new URLSearchParams(window.location.search);
    const o = { ...defaults };
    ["lang", "landing", "layout"].forEach((k) => {
      if (qs.get(k)) o[k] = qs.get(k);
    });
    return o;
  } catch (e) {
    return defaults;
  }
}

// Scroll-to-next-page hook.
// Triggers when user keeps scrolling past the bottom (or top) edge of the
// current page. Guards against accidental advance with:
//   - a small accumulator that must be filled past `threshold` in <500ms
//   - a 900ms cooldown after a transition before the next can fire
//   - resets the accumulator if scroll direction reverses
// Returns {direction, progress} so the UI can show a hint near the edges.
function useScrollSnapNav(page, setPage) {
  const [edge, setEdge] = React.useState({ at: null, progress: 0 }); // at: 'bottom'|'top'|null
  const stateRef = React.useRef({
    accum: 0,
    lastTs: 0,
    cooldownUntil: 0,
    lastDir: 0,
  });

  React.useEffect(() => {
    const THRESHOLD = 220;       // px of overscroll needed to advance
    const COOLDOWN = 900;        // ms after a transition
    const DECAY_MS = 500;        // accumulator resets if no wheel for this long

    const navigateBy = (dir) => {
      const idx = PAGE_ORDER.indexOf(page);
      const next = idx + dir;
      if (next < 0 || next >= PAGE_ORDER.length) return false;
      setPage(PAGE_ORDER[next]);
      stateRef.current.cooldownUntil = performance.now() + COOLDOWN;
      stateRef.current.accum = 0;
      setEdge({ at: null, progress: 0 });
      // Scroll position is reset by the page-change effect below.
      return true;
    };

    const onWheel = (e) => {
      const now = performance.now();
      const s = stateRef.current;
      if (now < s.cooldownUntil) return;

      const dy = e.deltaY;
      if (Math.abs(dy) < 1) return;

      const dir = dy > 0 ? 1 : -1;
      // Reset on direction reversal or long pause.
      if (dir !== s.lastDir || now - s.lastTs > DECAY_MS) s.accum = 0;
      s.lastDir = dir;
      s.lastTs = now;

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const viewH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      // Are we pinned at an edge in the direction we want to go?
      const atBottom = scrollY + viewH >= docH - 2;
      const atTop = scrollY <= 1;

      if (dir > 0 && atBottom) {
        s.accum += dy;
        const progress = Math.min(1, s.accum / THRESHOLD);
        setEdge({ at: "bottom", progress });
        if (s.accum >= THRESHOLD) navigateBy(1);
      } else if (dir < 0 && atTop) {
        s.accum += -dy;
        const progress = Math.min(1, s.accum / THRESHOLD);
        setEdge({ at: "top", progress });
        if (s.accum >= THRESHOLD) navigateBy(-1);
      } else {
        s.accum = 0;
        if (edge.at !== null) setEdge({ at: null, progress: 0 });
      }
    };

    // Keyboard parity — PageDown / PageUp / arrow keys near edges trigger nav.
    const onKey = (e) => {
      if (performance.now() < stateRef.current.cooldownUntil) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const viewH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const atBottom = scrollY + viewH >= docH - 2;
      const atTop = scrollY <= 1;
      if ((e.key === "PageDown" || (e.key === "ArrowDown" && atBottom)) && atBottom) {
        if (navigateBy(1)) e.preventDefault();
      } else if ((e.key === "PageUp" || (e.key === "ArrowUp" && atTop)) && atTop) {
        if (navigateBy(-1)) e.preventDefault();
      }
    };

    // Touch — track cumulative finger swipe at edges.
    let touchStartY = null;
    const onTouchStart = (e) => { touchStartY = e.touches[0]?.clientY ?? null; stateRef.current.accum = 0; };
    const onTouchMove = (e) => {
      if (touchStartY == null) return;
      const now = performance.now();
      if (now < stateRef.current.cooldownUntil) return;
      const dy = touchStartY - e.touches[0].clientY; // positive when finger goes up (~scroll down)
      const dir = dy > 0 ? 1 : -1;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const viewH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const atBottom = scrollY + viewH >= docH - 2;
      const atTop = scrollY <= 1;
      if (dir > 0 && atBottom) {
        const progress = Math.min(1, Math.max(0, dy - 20) / THRESHOLD);
        setEdge({ at: "bottom", progress });
        if (dy > THRESHOLD) {
          const idx = PAGE_ORDER.indexOf(page);
          if (idx < PAGE_ORDER.length - 1) {
            setPage(PAGE_ORDER[idx + 1]);
            stateRef.current.cooldownUntil = performance.now() + COOLDOWN;
            setEdge({ at: null, progress: 0 });
            touchStartY = null;
          }
        }
      } else if (dir < 0 && atTop) {
        const progress = Math.min(1, Math.max(0, -dy - 20) / THRESHOLD);
        setEdge({ at: "top", progress });
        if (-dy > THRESHOLD) {
          const idx = PAGE_ORDER.indexOf(page);
          if (idx > 0) {
            setPage(PAGE_ORDER[idx - 1]);
            stateRef.current.cooldownUntil = performance.now() + COOLDOWN;
            setEdge({ at: null, progress: 0 });
            touchStartY = null;
          }
        }
      }
    };
    const onTouchEnd = () => { touchStartY = null; setEdge({ at: null, progress: 0 }); };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [page, setPage]);

  return edge;
}

function App() {
  const [tweaks, setTweak] = useTweaks(urlOverrides(TWEAK_DEFAULTS));
  const [initialPage] = React.useState(() => {
    const qs = new URLSearchParams(window.location.search);
    return qs.get("page") || "home";
  });
  const [page, setPage] = React.useState(initialPage);
  const [artIndex, setArtIndex] = React.useState(0);
  const [seriesFilter, setSeriesFilter] = React.useState("all");

  const edge = useScrollSnapNav(page, setPage);

  // On every page change, jump scroll to top so the user starts at the page
  // header. Without this the new page would inherit the previous scroll pos.
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  const lang = tweaks.lang;
  const t = window.COPY[lang];

  const goWorks = (idx = 0) => {
    setArtIndex(idx);
    setPage("works");
  };

  // Render selected landing
  const Landing = (() => {
    if (tweaks.landing === "manifesto") return window.LandingManifesto;
    if (tweaks.landing === "index") return window.LandingIndex;
    return window.LandingSpotlight;
  })();

  return (
    <div className="root">
      <TopNav t={t} lang={lang} page={page} setPage={setPage} setTweak={setTweak} />
      <main className="main">
        {page === "home" &&
        <Landing t={t} lang={lang} onEnter={() => goWorks(0)} onOpen={goWorks} />
        }
        {page === "works" &&
        <Gallery
          t={t}
          lang={lang}
          layout={tweaks.layout}
          setLayout={(v) => setTweak("layout", v)}
          index={artIndex}
          setIndex={setArtIndex}
          seriesFilter={seriesFilter}
          setSeriesFilter={setSeriesFilter} />

        }
        {page === "series" &&
        <Gallery
          t={t}
          lang={lang}
          layout={tweaks.layout}
          setLayout={(v) => setTweak("layout", v)}
          index={artIndex}
          setIndex={setArtIndex}
          seriesFilter={seriesFilter}
          setSeriesFilter={setSeriesFilter} />

        }
        {page === "statement" && <StatementPage t={t} lang={lang} />}
        {page === "journal" && <JournalPage t={t} lang={lang} />}
        {page === "about" && <AboutPage t={t} lang={lang} />}
        {page === "contact" && <ContactPage t={t} lang={lang} />}
      </main>
      <SiteFooter t={t} lang={lang} setPage={setPage} />
      <ScrollSnapHint edge={edge} page={page} t={t} />
      <Tweaks tweaks={tweaks} setTweak={setTweak} t={t} />
    </div>);

}

// Floating hint that appears as the user scrolls past the bottom/top edge.
// Shows the name of the next/previous page, with a progress arc that fills
// as the accumulated overscroll approaches the THRESHOLD inside the hook.
function ScrollSnapHint({ edge, page, t }) {
  if (!edge.at) return null;
  const idx = PAGE_ORDER.indexOf(page);
  const nextKey = edge.at === "bottom" ? PAGE_ORDER[idx + 1] : PAGE_ORDER[idx - 1];
  if (!nextKey) return null;
  const label = t.nav[nextKey] || nextKey;
  const arrow = edge.at === "bottom" ? "↓" : "↑";
  const pct = Math.round(edge.progress * 100);
  return (
    <div className={`scroll-hint scroll-hint--${edge.at}`}>
      <div className="scroll-hint-ring">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="18" className="ring-bg" />
          <circle
            cx="20"
            cy="20"
            r="18"
            className="ring-fg"
            strokeDasharray={2 * Math.PI * 18}
            strokeDashoffset={2 * Math.PI * 18 * (1 - edge.progress)}
          />
        </svg>
        <span className="scroll-hint-arrow">{arrow}</span>
      </div>
      <div className="scroll-hint-label">
        <span className="mono dim">{edge.at === "bottom" ? "next" : "prev"}</span>
        <span className="scroll-hint-page">{label}</span>
      </div>
    </div>
  );
}

function TopNav({ t, lang, page, setPage, setTweak }) {
  const items = [
  ["home", t.nav.home],
  ["works", t.nav.works],
  ["statement", t.nav.statement],
  ["journal", t.nav.journal],
  ["about", t.nav.about],
  ["contact", t.nav.contact]];

  return (
    <header className="topnav">
      <button className="brand" onClick={() => setPage("home")}>
        <span className="brand-avatar">
          <img src="assets/avatar-nav.png" alt="Dragom" />
        </span>
        <span className="brand-zh">{window.COPY.zh.artist}</span>
        <span className="brand-sep"></span>
        <span className="brand-en">Dragom</span>
      </button>
      <nav className="navlinks">
        {items.map(([k, label]) =>
        <button
          key={k}
          className={`navlink ${page === k ? "active" : ""}`}
          onClick={() => setPage(k)}>
          
            {label}
          </button>
        )}
      </nav>
      <div className="topnav-r">
        <button
          className="lang-toggle"
          onClick={() => setTweak("lang", lang === "zh" ? "en" : "zh")}
          title="Switch language">
          
          <span className={lang === "zh" ? "lt-on" : "lt-off"}>中</span>
          <span className="lt-sep">／</span>
          <span className={lang === "en" ? "lt-on" : "lt-off"}>EN</span>
        </button>
      </div>
    </header>);

}

function SiteFooter({ t, lang, setPage }) {
  return (
    <footer className="site-footer mono">
      <div className="ft-l">
        <div className="ft-name">© 2024 {t.artist} ／ Dragom</div>
        <div className="ft-note">{t.contact.footer_note}</div>
      </div>
      <div className="ft-r">
        <a href={window.CONTACT.ig_url} target="_blank" rel="noreferrer">
          IG ↗
        </a>
        <a href={`mailto:${window.CONTACT.email}`}>EMAIL ↗</a>
      </div>
    </footer>);

}

function Tweaks({ tweaks, setTweak, t }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Language ／ 語言">
        <TweakRadio
          label="Language"
          value={tweaks.lang}
          options={[
          { label: "繁中", value: "zh" },
          { label: "EN", value: "en" }]
          }
          onChange={(v) => setTweak("lang", v)} />
        
      </TweakSection>

      <TweakSection label="Landing ／ 首頁">
        <TweakSelect
          label="Variation"
          value={tweaks.landing}
          options={[
          { label: "A · Spotlight · 聚光燈", value: "spotlight" },
          { label: "B · Manifesto · 宣言", value: "manifesto" },
          { label: "C · Index · 索引", value: "index" }]
          }
          onChange={(v) => setTweak("landing", v)} />
        
      </TweakSection>

      <TweakSection label="Gallery layout ／ 作品陳列">
        <TweakSelect
          label="Layout"
          value={tweaks.layout}
          options={[
          { label: "Spotlight · 聚光燈", value: "spotlight" },
          { label: "Grid · 網格", value: "grid" },
          { label: "Masonry · 瀑布流", value: "masonry" },
          { label: "Editorial · 編輯", value: "editorial" }]
          }
          onChange={(v) => setTweak("layout", v)} />
        
      </TweakSection>
    </TweaksPanel>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);