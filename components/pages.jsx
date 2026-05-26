// Statement, About, Series, Contact pages.

function StatementPage({ t, lang }) {
  return (
    <section className="page page-statement">
      <header className="page-head stmt-head">
        <div className="page-eyebrow mono">{t.statement_subtitle}</div>
        <h1 className="page-title">{t.statement_title}</h1>
      </header>
      <div className="stmt-frame">
        <div className="stmt-body">
          {t.statement_body.map((p, i) =>
          <p key={i} className={`stmt-p stmt-p-${i}`}>
              <span className="stmt-mark mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="stmt-text">{p}</span>
            </p>
          )}
        </div>
        <div className="stmt-sign mono">
          {t.artist} ／ {t.artist_en} · 2024
        </div>
      </div>
    </section>);

}

// Hand-drawn-ish vine: a curving stem with three teardrop leaves. Positioned
// at opposing corners around the about-page portrait. Kept geometrically simple
// — three ellipse-leaves on a quadratic stem — so it reads as a sketch rather
// than as decorative clip-art.
function VineCluster({ className }) {
  return (
    <svg
      className={`vine ${className || ""}`}
      viewBox="0 0 120 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2">
        <path d="M 4 70 Q 30 20, 60 38 T 116 14" />
        <path d="M 22 50 Q 16 44, 16 36" opacity="0.7" />
        <path d="M 48 32 Q 54 26, 60 22" opacity="0.7" />
        <path d="M 80 22 Q 86 18, 94 16" opacity="0.7" />
      </g>
      <g fill="currentColor" opacity="0.85">
        <path d="M 12 36 Q 22 28, 26 32 Q 22 40, 12 36 Z" />
        <path d="M 50 18 Q 60 12, 66 18 Q 60 26, 50 18 Z" />
        <path d="M 92 10 Q 102 4, 108 12 Q 102 18, 92 10 Z" />
      </g>
    </svg>
  );
}

function AboutPage({ t, lang }) {
  return (
    <section className="page page-about">
      <header className="about-head">
        <div className="page-eyebrow mono">{t.about.subtitle}</div>
        <h1 className="page-title">{t.about.title}</h1>
        <div className="about-head-name mono">
          <span>{t.artist} {t.artist_en}</span>
          <span className="sub">{t.role}</span>
        </div>
      </header>

      <div className="about-grid">
        <div className="about-col about-bio">
          <div className="about-eyebrow mono">{t.about.bio_eyebrow}</div>
          {t.about.bio.map((p, i) =>
          <p key={i} className="about-p">{p}</p>
          )}
        </div>

        <div className="about-col about-facts">
          <div className="about-eyebrow mono">{t.about.facts_eyebrow}</div>
          <dl>
            {t.about.facts.map(([k, v]) =>
            <div key={k} className="about-fact">
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="about-col about-cv">
          <div className="about-eyebrow mono">{t.about.cv_eyebrow}</div>
          <ul>
            {t.about.cv.map(([year, line]) =>
            <li key={year} className="about-cv-row">
                <span className="mono about-cv-year">{year}</span>
                <span className="about-cv-line">{line}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>);

}

function SeriesPage({ t, lang, onOpen }) {
  return (
    <section className="page page-series">
      <header className="page-head">
        <div className="page-eyebrow mono">{t.series_page.subtitle}</div>
        <h1 className="page-title">{t.series_page.title}</h1>
        <p className="page-lede">{t.series_page.lede}</p>
      </header>

      <div className="series-list">
        {window.SERIES.map((s) => {
          const works = window.ARTWORKS.filter((w) => w.series === s.id);
          return (
            <article key={s.id} className="series-row">
              <div className="series-row-l">
                <div className="series-no mono">SERIES {s.no}</div>
                <h2 className="series-name">
                  <span className="series-name-zh">{s.zh.name}</span>
                  <span className="series-name-en">{s.en.name}</span>
                </h2>
                <div className="series-note">
                  {lang === "zh" ? s.zh.note : s.en.note}
                </div>
                <div className="series-count mono">
                  {works.length} {t.series_page.pieces}
                </div>
              </div>
              <div className="series-row-r">
                {works.slice(0, 5).map((w, i) => {
                  const globalIdx = window.ARTWORKS.findIndex((x) => x.id === w.id);
                  return (
                    <button
                      key={w.id}
                      className="series-thumb"
                      style={{ aspectRatio: window.aspectFor(w) }}
                      onClick={() => onOpen(globalIdx)}>
                      
                      <ArtworkImage work={w} label={false} sizing="cover" />
                      <div className="series-thumb-cap mono">W—{w.id}</div>
                    </button>);

                })}
              </div>
            </article>);

        })}
      </div>
    </section>);

}

function ContactPage({ t, lang }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(window.CONTACT.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section className="page page-contact">
      <header className="page-head">
        <div className="page-eyebrow mono">{t.contact.subtitle}</div>
        <h1 className="page-title">{t.contact.title}</h1>
        <p className="page-lede">{t.contact.lede}</p>
      </header>

      <div className="contact-card">
        <div className="contact-row">
          <div className="contact-row-l">
            <div className="contact-label mono">{t.contact.email_label}</div>
            <div className="contact-value">{window.CONTACT.email}</div>
          </div>
          <div className="contact-row-r">
            <button className="contact-btn" onClick={copy}>
              {copied ? t.contact.copied : t.contact.copy}
            </button>
          </div>
        </div>
        <div className="contact-row">
          <div className="contact-row-l">
            <div className="contact-label mono">{t.contact.ig_label}</div>
            <div className="contact-value">@{window.CONTACT.ig}</div>
          </div>
          <div className="contact-row-r">
            <a className="contact-btn" href={window.CONTACT.ig_url} target="_blank" rel="noreferrer">
              {t.contact.open} ↗
            </a>
          </div>
        </div>
      </div>

      <div className="contact-foot mono">{t.contact.footer_note}</div>
    </section>);

}

window.StatementPage = StatementPage;
window.AboutPage = AboutPage;
window.SeriesPage = SeriesPage;
window.ContactPage = ContactPage;