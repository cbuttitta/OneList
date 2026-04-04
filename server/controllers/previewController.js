function getMeta(html, prop) {
  const re1 = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"'<>]+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+property=["']${prop}["']`, "i");
  const re3 = new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"'<>]+)["']`, "i");
  const re4 = new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+name=["']${prop}["']`, "i");
  const m = html.match(re1) || html.match(re2) || html.match(re3) || html.match(re4);
  return m ? decode(m[1]) : null;
}

function getTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? decode(m[1].trim()) : null;
}

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$", AUD: "A$", JPY: "¥" };

function formatPrice(amount, currency) {
  if (!amount) return null;
  const sym = currency ? (CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency + "\u00a0") : "";
  return `${sym}${amount}`;
}

function getPrice(html) {
  const amount = getMeta(html, "product:price:amount") || getMeta(html, "og:price:amount");
  const currency = getMeta(html, "product:price:currency") || getMeta(html, "og:price:currency");
  if (amount) return formatPrice(amount, currency);

  // JSON-LD structured data
  const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRe.exec(html)) !== null) {
    try {
      const nodes = [].concat(JSON.parse(m[1]));
      for (const node of nodes) {
        const graph = node["@graph"] ? [].concat(node["@graph"]) : [node];
        for (const n of graph) {
          const offers = n.offers ? [].concat(n.offers) : [];
          for (const offer of offers) {
            if (offer.price != null) {
              return formatPrice(String(offer.price), offer.priceCurrency);
            }
          }
        }
      }
    } catch { /* malformed JSON-LD — skip */ }
  }
  return null;
}

function decode(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'");
}

export async function fetchPreview(req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "URL required" });

  try { new URL(url); } catch {
    return res.status(400).json({ message: "Invalid URL" });
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: ac.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return res.status(422).json({ message: `Could not fetch page (HTTP ${response.status})` });
    }

    const html = await response.text();

    const title = getMeta(html, "og:title") || getTitle(html) || null;
    const description = getMeta(html, "og:description") || getMeta(html, "description") || null;
    let image_url = getMeta(html, "og:image") || null;
    const price = getPrice(html);

    if (image_url && !image_url.startsWith("http")) {
      image_url = new URL(image_url, new URL(url).origin).href;
    }

    res.json({ title, description, image_url, price });
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ message: "Request timed out — the site took too long to respond" });
    }
    res.status(502).json({ message: "Failed to fetch page" });
  } finally {
    clearTimeout(timer);
  }
}
