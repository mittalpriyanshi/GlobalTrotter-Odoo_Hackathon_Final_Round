import { useEffect, useState } from "react";
import { Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const SUGGESTIONS_COUNT = 9;

// Extract human-friendly tags from Wikipedia category titles
function extractTagsFromCategories(categories) {
  if (!Array.isArray(categories)) return [];
  const banned = [/articles/i, /pages using/i, /wikidata/i, /short description/i, /all stubs/i, /use dmy/i, /cs1/i, /webarchive/i, /coordinates/i, /infobox/i, /commons/i, /wikipedia/i, /lacking/i];
  const cleaned = categories
    .map((c) => (typeof c === "string" ? c : c.title || ""))
    .map((t) => t.replace(/^Category:/, ""))
    .filter((t) => t && !banned.some((re) => re.test(t)))
    .map((t) => t.replace(/\s*\(.*?\)\s*/g, ""))
    .map((t) => t.replace(/ in .*$/, ""))
    .map((t) => t.replace(/ of .*$/, ""));
  const unique = Array.from(new Set(cleaned));
  return unique.slice(0, 6);
}

async function enrichWikiTags(items) {
  const needIds = items.filter((i) => !i.kinds && i.wikiPageId);
  const needTitles = items.filter((i) => !i.kinds && !i.wikiPageId && i.name);

  // Enrich by pageids
  let byIdMap = {};
  if (needIds.length) {
    const ids = needIds.map((i) => i.wikiPageId).slice(0, 50).join("|");
    try {
      const resp = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${ids}&prop=categories&cllimit=50&origin=*`
      );
      const data = await resp.json();
      const pages = data?.query?.pages || {};
      Object.keys(pages).forEach((pid) => {
        byIdMap[pid] = extractTagsFromCategories(pages[pid].categories || []);
      });
    } catch (_) {}
  }

  // Enrich by titles
  let byTitleMap = {};
  if (needTitles.length) {
    const titlesParam = needTitles
      .map((i) => i.name)
      .slice(0, 20)
      .map(encodeURIComponent)
      .join("|");
    try {
      const resp = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${titlesParam}&prop=categories&cllimit=50&origin=*`
      );
      const data = await resp.json();
      const pages = data?.query?.pages || {};
      Object.values(pages).forEach((p) => {
        const tags = extractTagsFromCategories(p.categories || []);
        byTitleMap[p.title] = tags;
      });
    } catch (_) {}
  }

  return items.map((i) => {
    if (!i.kinds && i.wikiPageId && byIdMap[i.wikiPageId]?.length) {
      return { ...i, kinds: byIdMap[i.wikiPageId].join(", ") };
    }
    if (!i.kinds && !i.wikiPageId && byTitleMap[i.name]?.length) {
      return { ...i, kinds: byTitleMap[i.name].join(", ") };
    }
    return i;
  });
}

async function fetchPlaces(query) {
  if (!query) return [];
  const headers = { "User-Agent": "GlobeTrotter/1.0 (https://example.com)" };
  // Use OpenTripMap for POIs (requires API key). Fallback to Wikipedia search images if missing key.
  const OTM_KEY = import.meta.env.VITE_OPENTRIPMAP_KEY;
  try {
    // Helper to run a Wikipedia query
    const fetchWiki = async (q) => {
      // First attempt: generator=search with thumbnails
      try {
        const wikiRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
            q
          )}&gsrlimit=${SUGGESTIONS_COUNT}&prop=pageimages|description&piprop=thumbnail&pithumbsize=600&origin=*`
        );
        const wiki = await wikiRes.json();
        const pages = wiki?.query?.pages ? Object.values(wiki.query.pages) : [];
        if (pages.length) {
          return pages.map((p) => ({
            id: p.pageid,
            wikiPageId: p.pageid,
            name: p.title,
            kinds: p.description || "",
            image:
              p.thumbnail?.source ||
              `https://source.unsplash.com/600x400/?${encodeURIComponent(q)},landmark`,
          }));
        }
      } catch (_) {}

      // Fallback: opensearch API, then fill images from Unsplash source
      try {
        const openRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURIComponent(
            q
          )}&limit=${SUGGESTIONS_COUNT}&origin=*`
        );
        const open = await openRes.json();
        const titles = open?.[1] || [];
        const descs = open?.[2] || [];
        return titles.map((t, i) => ({
          id: `${t}-${i}`,
          name: t,
          kinds: descs[i] || "",
          image: `https://source.unsplash.com/600x400/?${encodeURIComponent(t)},landmark`,
        }));
      } catch (_) {
        return [];
      }
    };

    // If we don't have an OTM key, skip geocoding and go straight to Wikipedia results
    if (!OTM_KEY) {
      const a = await fetchWiki(`${query} tourism`);
      const b = await fetchWiki(`things to do in ${query}`);
      // merge unique by id/title
      const map = new Map();
      ;[...a, ...b].forEach((x) => map.set(`${x.id}-${x.name}`, x));
      const merged = Array.from(map.values());
      return await attachRemoteImages(merged, query);
    }

    // With OTM key: geocode city, fetch POIs; if empty, fallback to Wikipedia
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers }
    );
    const geo = await geoRes.json();
    if (!geo[0]) {
      return [];
    }
    const { lat, lon } = geo[0];

    if (OTM_KEY) {
      const listRes = await fetch(
        `https://api.opentripmap.com/0.1/en/places/radius?radius=10000&lon=${lon}&lat=${lat}&rate=2&limit=${SUGGESTIONS_COUNT}&apikey=${OTM_KEY}`
      );
      const list = await listRes.json();
      const detailed = await Promise.all(
        (list?.features || []).map(async (f) => {
          const xid = f?.properties?.xid;
          if (!xid) return null;
          const detRes = await fetch(
            `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${OTM_KEY}`
          );
          const det = await detRes.json();
          // Choose the first image if present
          const image = det?.preview?.source || det?.image || null;
          return {
            id: xid,
            name: det?.name || f?.properties?.name || "Attraction",
            kinds: det?.kinds || "",
            image,
          };
        })
      );
      const pois = detailed
        .filter(Boolean)
        .map((d) => ({
          ...d,
          image: d.image || `https://source.unsplash.com/600x400/?${encodeURIComponent(d.name)},landmark`,
        }));
      if (pois.length) return await attachRemoteImages(pois, query);
    }

    // Fallback to Wikipedia even if OTM returns nothing
    const merged = await fetchWiki(`${query} tourism`);
    return await attachRemoteImages(merged, query);
  } catch (_) {
    return [];
  }
}

// ---------------- Image Providers (Pexels → Pixabay → Unsplash fallback) ----------------
async function fetchImageFromPexels(term) {
  const key = import.meta.env.VITE_PEXELS_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(term)}&per_page=1`, {
      headers: { Authorization: key },
    });
    const data = await res.json();
    return data?.photos?.[0]?.src?.large || data?.photos?.[0]?.src?.medium || null;
  } catch (_) {
    return null;
  }
}

async function fetchImageFromPixabay(term) {
  const key = import.meta.env.VITE_PIXABAY_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(term)}&image_type=photo&per_page=3`);
    const data = await res.json();
    return data?.hits?.[0]?.largeImageURL || data?.hits?.[0]?.webformatURL || null;
  } catch (_) {
    return null;
  }
}

async function fetchRemoteImage(term, fallbackQuery) {
  const pexels = await fetchImageFromPexels(term);
  if (pexels) return pexels;
  const pixabay = await fetchImageFromPixabay(term);
  if (pixabay) return pixabay;
  const q = term || fallbackQuery || "travel";
  return `https://source.unsplash.com/600x400/?${encodeURIComponent(q)},landmark`;
}

async function attachRemoteImages(items, fallbackQuery) {
  const withImgs = await Promise.all(
    items.map(async (i) => ({
      ...i,
      image: i.image || (await fetchRemoteImage(i.name, fallbackQuery)),
    }))
  );
  return withImgs;
}

const PlanPage = () => {
  const { authUser } = useAuthUser();
  const fullName = authUser?.fullName || "Traveler";
  const avatar = authUser?.profilePic || "/icon1.png";
  const [form, setForm] = useState({ tripName: "", startDate: "", place: "", endDate: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");

  const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setDateError("");
      return true;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    
    if (start > end) {
      setDateError("End date must be after start date");
      return false;
    }
    
    if (start < today) {
      setDateError("Start date cannot be in the past");
      return false;
    }
    
    setDateError("");
    return true;
  };

  const handleDateChange = (field, value) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    validateDates(newForm.startDate, newForm.endDate);
  };

  const handleImgError = (e) => {
    const name = e.currentTarget.getAttribute("data-name") || form.place || "travel";
    const step = Number(e.currentTarget.getAttribute("data-fallback-step") || 0);
    if (step === 0) {
      e.currentTarget.setAttribute("data-fallback-step", "1");
      e.currentTarget.src = `https://source.unsplash.com/600x400/?${encodeURIComponent(name)},landmark`;
    } else {
      e.currentTarget.onerror = null;
      e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(name)}/600/400`;
    }
  };

  const handleFetch = async () => {
    setError("");
    setLoading(true);
    let data = await fetchPlaces(form.place);
    // Enrich with tags from categories when available
    data = await enrichWikiTags(data);
    setSuggestions(data);
    if (!data.length) setError("No suggestions found. Try another place or be more specific (e.g., 'New Delhi').");
    setLoading(false);
  };

  const handleSave = () => {
    if (!form.tripName || !form.place) {
      toast.error("Please enter a trip name and place before saving.");
      return;
    }
    const existing = JSON.parse(localStorage.getItem("gt_trips") || "[]");
    const newTrip = {
      id: Date.now(),
      ...form,
      suggestions,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("gt_trips", JSON.stringify([newTrip, ...existing]));
    toast.success("Trip saved!");
  };

  useEffect(() => {
    // auto-fetch when place changes and not empty
    const t = setTimeout(() => {
      if (form.place?.trim()) handleFetch();
    }, 400);
    return () => clearTimeout(t);
  }, [form.place]);

  return (
    <div className="min-h-screen" data-theme="retro">
      <Navbar />
      <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Plan your trip</h1>

        <div className="card bg-base-100 border border-primary/20">
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control md:col-span-2">
              <label className="label">Trip Name</label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Family Trip, Solo Retreat"
                value={form.tripName}
                onChange={(e) => setForm({ ...form, tripName: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">Start Date</label>
              <input 
                type="date" 
                className={`input input-bordered ${dateError ? 'input-error' : ''}`}
                value={form.startDate} 
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
              />
            </div>
            <div className="form-control">
              <label className="label">End Date</label>
              <input 
                type="date" 
                className={`input input-bordered ${dateError ? 'input-error' : ''}`}
                value={form.endDate} 
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                min={form.startDate || new Date().toISOString().split('T')[0]} // Ensure end date is after start date
              />
            </div>
            <div className="form-control">
              <label className="label">Select a Place</label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Rishikesh"
                value={form.place}
                onChange={(e)=>setForm({...form, place:e.target.value})}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); handleFetch(); } }}
              />
            </div>
            
            <div className="form-control">
              <label className="label">Actions</label>
              <div className="flex flex-col gap-2">
                <button className="btn btn-primary" onClick={handleFetch} disabled={loading}>
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : "Fetch suggestions"}
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={handleSave} 
                  disabled={!form.tripName || !form.place || dateError}
                >
                  Save trip
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Error Display */}
        {dateError && (
          <div className="alert alert-error text-sm">
            <span>⚠️ {dateError}</span>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Suggestions for Places to Visit / Activities to perform</h2>
          {error && <div className="alert alert-warning text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="skeleton h-48 w-full"></div>
            ))}
            {!loading && suggestions.map((s) => (
              <div key={s.id} className="card bg-base-100 border border-primary/20 overflow-hidden">
                <img src={s.image} alt={s.name} data-name={s.name} className="h-32 w-full object-cover" onError={handleImgError} />
                <div className="card-body p-4">
                  <h3 className="font-semibold line-clamp-1">{s.name}</h3>
                  {s.kinds && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {s.kinds.split(",").slice(0, 6).map((k) => (
                        <span key={`${s.id}-${k}`} className="badge badge-outline">
                          {k.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!loading && !suggestions.length && !error && (
              <div className="text-sm opacity-70">Enter a place above to see suggestions.</div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PlanPage;


