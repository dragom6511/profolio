// ArtworkImage — renders either the real image src or a painterly placeholder
// using the work's palette. Placeholder is a layered radial gradient + soft
// stripe to suggest a sky/cityscape composition, with a monospace label so
// reviewers know what should sit there.

const ASPECT_RATIOS = {
  wide: 16 / 9,
  tall: 4 / 5,
  square: 1,
  panorama: 21 / 9,
};

function aspectFor(work) {
  // Numeric aspect wins; fall back to named category; final fallback square.
  if (typeof work.aspect === "number" && isFinite(work.aspect) && work.aspect > 0) {
    return work.aspect;
  }
  return ASPECT_RATIOS[work.aspect] || 1;
}

function ArtworkImage({ work, label, sizing = "contain", className = "", style = {} }) {
  if (work.src) {
    const borderedCls = work.bordered ? " bordered" : "";
    return (
      <div
        className={`artwork-img has-src${borderedCls} ${className}`}
        style={{
          backgroundImage: `url(${work.src})`,
          backgroundSize: sizing === "cover" ? "cover" : "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          ...style,
        }}
      />
    );
  }
  const p = work.palette || ["#11141c", "#22293a", "#4a5a78", "#9aadc4"];
  // composition seed from id, deterministic
  const seed = parseInt(work.id, 10) || 1;
  const horizon = 0.45 + ((seed * 13) % 25) / 100; // 0.45–0.7
  const sunX = 20 + ((seed * 37) % 70); // 20–90 %
  const tilt = (seed % 5) - 2; // -2..2 deg
  return (
    <div
      className={`artwork-img placeholder ${className}`}
      style={{
        background: `
          radial-gradient(120% 90% at ${sunX}% ${horizon * 60}%, ${p[3]}33 0%, transparent 55%),
          radial-gradient(140% 100% at ${100 - sunX}% ${100 - horizon * 40}%, ${p[2]}55 0%, transparent 65%),
          linear-gradient(180deg, ${p[1]} 0%, ${p[0]} 100%)
        `,
        ...style,
      }}
    >
      <div
        className="artwork-img__strata"
        style={{
          transform: `translateY(${horizon * 100}%) skewY(${tilt}deg)`,
          background: `linear-gradient(180deg, ${p[2]}88 0%, ${p[1]} 40%, ${p[0]} 100%)`,
        }}
      />
      <div
        className="artwork-img__skyline"
        style={{
          top: `${horizon * 100 - 8}%`,
          backgroundImage: `linear-gradient(90deg,
            transparent 0 6%, ${p[1]} 6% 9%,
            transparent 9% 14%, ${p[1]} 14% 19%,
            transparent 19% 22%, ${p[2]} 22% 27%,
            transparent 27% 33%, ${p[1]} 33% 39%,
            transparent 39% 44%, ${p[2]} 44% 47%,
            transparent 47% 54%, ${p[1]} 54% 60%,
            transparent 60% 65%, ${p[2]} 65% 71%,
            transparent 71% 76%, ${p[1]} 76% 82%,
            transparent 82% 88%, ${p[2]} 88% 94%,
            transparent 94% 100%)`,
        }}
      />
      <div className="artwork-img__grain" />
      {label !== false && (
        <div className="artwork-img__label">
          <span>placeholder</span>
          <span className="dot">·</span>
          <span>W-{work.id}</span>
        </div>
      )}
    </div>
  );
}

// Frame wraps an artwork image in a paper-bordered container with the correct
// aspect ratio. Used by gallery layouts that need a single piece.
function ArtworkFrame({ work, sizing = "contain", showLabel = true, paper = true, className = "", style = {} }) {
  const ar = aspectFor(work);
  return (
    <div
      className={`artwork-frame ${paper ? "paper" : ""} ${className}`}
      style={{ aspectRatio: ar, ...style }}
    >
      <ArtworkImage work={work} label={showLabel} sizing={sizing} />
    </div>
  );
}

window.ArtworkImage = ArtworkImage;
window.ArtworkFrame = ArtworkFrame;
window.aspectFor = aspectFor;
