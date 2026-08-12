const hymns = [
  ["A1-01", "Timeless Tribute"],
  ["A1-02", "Spirit Song"],
  ["A1-03", "I Gave My Life for Thee"],
  ["A1-04", "O Lord, You're Beautiful"],
  ["A1-05", "Wondrous Love"],
  ["A1-06", "I Must Tell Jesus"],
  ["A1-07", "I Need Thee Every Hour"],
  ["A1-08", "Be Still, My Soul"],
  ["A1-09", "Precious Lord, Take My Hand"],
  ["A1-10", "Softly and Tenderly"],
  ["A1-11", "Does Jesus Care"],
  ["A1-12", "God Leads Us Along"],
  ["A1-13", "His Eye Is on the Sparrow"],
  ["A1-14", "As the Deer"],
  ["A1-15", "Sweet Hour of Prayer"],
  ["A1-16", "The Lord's Prayer"],
  ["A1-17", "My Hope Is Built on Nothing Less"],
  ["A1-18", "Onward Christian Soldiers"],
  ["A1-19", "Sing Hallelujah"],
  ["A1-20", "A Mighty Fortress Is Our God"],
];

function links(html, base) {
  return [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => {
      const href = new URL(m[1], base).href;
      const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return { href, text };
    })
    .filter((x) => x.text && !x.href.includes("#"));
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 hymn-source-lookup" } });
  const text = await res.text();
  return { status: res.status, url: res.url, text };
}

async function searchSite(site, query) {
  const q = encodeURIComponent(`${query} ${site}`);
  const url = `https://www.bing.com/search?q=${q}&count=10`;
  const { text } = await fetchText(url);
  return links(text, "https://www.bing.com")
    .map((l) => l.href)
    .filter((href) => href.includes(site))
    .filter((href, i, arr) => arr.indexOf(href) === i)
    .slice(0, 3);
}

for (const [id, title] of hymns) {
  const hymnarySearch = `https://hymnary.org/search?qu=${encodeURIComponent(title)}`;
  const found = [];
  for (const site of ["hymnary.org", "hymntime.com", "timelesstruths.org"]) {
    try {
      const hits = await searchSite(site, `"${title}"`);
      found.push(...hits);
    } catch (err) {
      found.push(`ERR:${site}:${err.message}`);
    }
  }
  console.log(JSON.stringify({ id, title, hymnarySearch, found: [...new Set(found)].slice(0, 6) }));
}
