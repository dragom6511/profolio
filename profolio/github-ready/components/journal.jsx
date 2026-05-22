// Journal — process / behind-the-scenes / occasional event photos.
// Entries are timeline blocks; each photo is an <image-slot> the user fills
// in by drag-and-drop (persisted across reload).

window.JOURNAL = [
  {
    id: "j-2024-03",
    date: { zh: "二〇二四 · 春", en: "2024 · Spring" },
    tag: { zh: "工作室", en: "Studio" },
    title: { zh: "《邊境的天際線》成形之前", en: "Before \"Skyline at the Border\"" },
    body: {
      zh: "把一張藍灰色的紙釘在牆上，連續坐了三個下午。先是天空，再是塔尖那道不在常識裡的光。粉彩會把指紋一起留下來。",
      en: "Pinned a sheet of blue-grey paper to the wall and sat with it three afternoons in a row. First the sky, then the spire's light that doesn't exist in common sense. Soft pastel records your fingerprints along the way.",
    },
    slots: [
      { id: "j1-a", w: 560, h: 380, label: { zh: "工作牆 ／ studio wall", en: "studio wall" } },
      { id: "j1-b", w: 260, h: 380, label: { zh: "顏料盤 ／ pastels", en: "pastel tray" } },
    ],
  },
  {
    id: "j-2024-01",
    date: { zh: "二〇二四 · 一月", en: "2024 · Jan" },
    tag: { zh: "工具 ／ 媒材", en: "Tools ／ Media" },
    title: { zh: "整理一年的粉彩", en: "Tidying a year of pastels" },
    body: {
      zh: "把磨短的粉條按色相重新編組。發現夜空和瘀青用得最多。",
      en: "Re-grouping the short stubs by hue. The darkest blues and bruise-purples are the ones gone most.",
    },
    slots: [
      { id: "j2-a", w: 380, h: 380, label: { zh: "重編色相", en: "regrouped by hue" } },
    ],
  },
  {
    id: "j-2023-11",
    date: { zh: "二〇二三 · 秋", en: "2023 · Autumn" },
    tag: { zh: "筆記", en: "Notes" },
    title: { zh: "《框架》系列的最初幾頁", en: "First pages of the Frameworks series" },
    body: {
      zh: "草稿、字、便利貼，一張接一張貼在書桌上方。「框架」二字寫了一遍又一遍，看著它愈像鐵欄杆。",
      en: "Drafts, scribbled phrases, sticky notes — climbing up the wall above the desk. I wrote 框架 again and again, until the two characters started to look like iron railings.",
    },
    slots: [
      { id: "j3-a", w: 360, h: 280, label: { zh: "速寫 01", en: "sketch 01" } },
      { id: "j3-b", w: 360, h: 280, label: { zh: "速寫 02", en: "sketch 02" } },
    ],
  },
  {
    id: "j-2023-07",
    date: { zh: "二〇二三 · 夏", en: "2023 · Summer" },
    tag: { zh: "練習", en: "Practice" },
    title: { zh: "每日的素描日課", en: "Daily drawing exercise" },
    body: {
      zh: "用八開的紙、十分鐘，畫一個從睡眠裡帶出來的形狀。多半畫得很差，那就是它的意義。",
      en: "Ten minutes on an A3 sheet, drawing a shape brought back from sleep. Most of them are bad — that is the point.",
    },
    slots: [
      { id: "j4-a", w: 820, h: 360, label: { zh: "速寫本一頁 ／ sketchbook spread", en: "sketchbook spread" } },
    ],
  },
  {
    id: "j-2022-12",
    date: { zh: "二〇二二 · 冬", en: "2022 · Winter" },
    tag: { zh: "活動", en: "Event" },
    title: { zh: "（保留位置 ／ 待補活動照片）", en: "(Reserved ／ event photos to come)" },
    body: {
      zh: "把這格留給未來的展覽、駐村、講座或徵件入選的照片 — 直接拖一張圖進左邊的格子，會自動記住。",
      en: "Holding this row open for future exhibitions, residencies, talks or selected open calls — drag an image into the slot on the left and it will stick.",
    },
    slots: [
      { id: "j5-a", w: 560, h: 360, label: { zh: "活動現場", en: "event photo" } },
    ],
  },
];

function JournalPage({ t, lang }) {
  return (
    <section className="page page-journal">
      <header className="page-head">
        <div className="page-eyebrow mono">{t.journal.subtitle}</div>
        <h1 className="page-title">{t.journal.title}</h1>
        <p className="page-lede">{t.journal.lede}</p>
      </header>

      <div className="jx-list">
        {window.JOURNAL.map((entry, idx) => {
          const date = lang === "zh" ? entry.date.zh : entry.date.en;
          const tag = lang === "zh" ? entry.tag.zh : entry.tag.en;
          const title = lang === "zh" ? entry.title.zh : entry.title.en;
          const body = lang === "zh" ? entry.body.zh : entry.body.en;
          return (
            <article className="jx-entry" key={entry.id}>
              <aside className="jx-meta">
                <div className="jx-date mono">{date}</div>
                <div className="jx-tag mono">{tag}</div>
                <div className="jx-no mono">№ {String(idx + 1).padStart(2, "0")}</div>
              </aside>
              <div className="jx-body">
                <h2 className="jx-title">{title}</h2>
                <p className="jx-text">{body}</p>
                <div className="jx-slots">
                  {entry.slots.map((s) => {
                    const label = lang === "zh" ? s.label.zh : s.label.en;
                    return (
                      <figure className="jx-slot-wrap" key={s.id} style={{ flex: `${s.w} 1 ${Math.min(s.w, 320)}px` }}>
                        <image-slot
                          id={s.id}
                          shape="rect"
                          fit="cover"
                          placeholder={label}
                          style={{ width: "100%", height: "auto", aspectRatio: `${s.w} / ${s.h}`, display: "block" }}
                        />
                        <figcaption className="jx-slot-cap mono">{label}</figcaption>
                      </figure>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="jx-foot mono">
        <span>{t.journal.foot_hint}</span>
      </div>
    </section>
  );
}

window.JournalPage = JournalPage;
