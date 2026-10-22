"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { PHOTO_ACCEPT, readPickedPhotos } from "@/lib/photoInput";
import V2Header from "../components/V2Header";
import V2Footer from "../components/V2Footer";

const BASE_PRICE = 50;
const VARIANT_LABEL = '1 Dozen (3.5" cookies)';
const designLevels = [
  { id: "classic", label: "Classic", detail: "Clean shapes, coordinated colors, and simple details" },
  { id: "signature", label: "Signature", detail: "Layered details, lettering, and a more custom finish" },
  { id: "intricate", label: "Intricate", detail: "Characters, logos, metallics, or highly detailed artwork" },
];

export default function CookieBuilderPage() {
  const { addItem } = useCart();
  const [dozens, setDozens] = useState(1);
  const [designLevel, setDesignLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [photos, setPhotos] = useState<Array<{ name: string; type: string; size: number; dataUrl: string }>>([]);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const photoInput = useRef<HTMLInputElement | null>(null);
  const startingTotal = BASE_PRICE * dozens;

  async function handlePhotos(files: FileList | null) {
    if (!files) return;
    const result = await readPickedPhotos(files);
    setPhotos(result.photos);
    setPhotoMessage(result.message);
  }

  function addToCart() {
    if (!designLevel || !eventDate) return;
    const design = designLevels.find((option) => option.id === designLevel)!;
    const noteParts = [
      `Quantity: ${dozens} dozen (${dozens * 12} cookies)`,
      `Design level: ${design.label}`,
      `Event date: ${eventDate}`,
      `Fulfillment preference: ${fulfillment === "pickup" ? "Pickup" : "Delivery request"}`,
    ];
    if (notes.trim()) noteParts.push(`Design notes: ${notes.trim()}`);
    if (photos.length) noteParts.push(`Inspiration photos: ${photos.map((photo) => photo.name).join(", ")}`);

    addItem(
      {
        productSlug: "icing-sugar-cookies",
        variantLabel: VARIANT_LABEL,
        name: "Custom Icing Sugar Cookies",
        price: BASE_PRICE,
        image: "/images/placeholders/under-construction.svg",
        note: noteParts.join(" | "),
        selection: { kind: "product", addons: [] },
        inspirationImages: photos.length ? photos : undefined,
      },
      dozens,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  const ready = Boolean(designLevel && eventDate);

  return (
    <>
      <V2Header current="shop" />
      <main className="cookie-builder">
        <section className="cookie-hero">
          <div className="cookie-crumb"><Link href="/">Home</Link><span>/</span>Custom Cookies</div>
          <span className="cookie-kicker">Made for your moment</span>
          <h1>Build your custom<br /><em>cookie dozen.</em></h1>
          <p>3.5-inch icing sugar cookies, baked and decorated to match your celebration.</p>
          <div className="starting-price"><strong>Starting at $50</strong><span>per dozen</span></div>
          <div className="cookie-art" aria-hidden="true"><span>✦</span><b>D&amp;S</b><span>✦</span></div>
        </section>

        <section className="builder-shell">
          <div className="builder-intro">
            <span>Custom cookie studio</span>
            <h2>Tell us what you&apos;re celebrating.</h2>
            <p>Your starting total updates as you build. Detailed designs may require a custom quote after we review your request.</p>
          </div>

          <div className="step">
            <div className="step-number">01</div>
            <div className="step-copy"><h3>Choose your quantity</h3><p>Each dozen includes 12 standard 3.5-inch cookies.</p></div>
            <div className="quantity-control" aria-label="Quantity by dozen">
              <button type="button" onClick={() => setDozens((value) => Math.max(1, value - 1))} disabled={dozens === 1} aria-label="Remove one dozen">−</button>
              <div><strong>{dozens}</strong><span>{dozens === 1 ? "dozen" : "dozens"}</span></div>
              <button type="button" onClick={() => setDozens((value) => Math.min(20, value + 1))} disabled={dozens === 20} aria-label="Add one dozen">+</button>
            </div>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <div className="step-copy"><h3>Pick a design direction</h3><p>This helps us understand the level of detail. Final pricing is confirmed after design review.</p></div>
            <div className="design-grid">
              {designLevels.map((option) => (
                <button key={option.id} type="button" className={designLevel === option.id ? "selected" : ""} onClick={() => setDesignLevel(option.id)}>
                  <span className="radio" /><strong>{option.label}</strong><small>{option.detail}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <div className="step-copy"><h3>Share your vision</h3><p>Tell us your theme, colors, wording, and any must-have details.</p></div>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="Example: A soft pink first birthday theme with bows, the name Mia, and a mix of number 1 and cake designs…" />
            <input ref={photoInput} type="file" accept={PHOTO_ACCEPT} multiple hidden onChange={(event) => void handlePhotos(event.target.files)} />
            <button className="photo-button" type="button" onClick={() => photoInput.current?.click()}>＋ Add inspiration photos</button>
            {photos.length > 0 && <p className="photo-status">Selected: {photos.map((photo) => photo.name).join(", ")}</p>}
            {photoMessage && <p className="photo-error">{photoMessage}</p>}
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <div className="step-copy"><h3>When do you need them?</h3><p>Select your event date and preferred way to receive your order.</p></div>
            <label className="field-label">Event date<input type="date" value={eventDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setEventDate(event.target.value)} /></label>
            <div className="fulfillment-grid">
              <button type="button" className={fulfillment === "pickup" ? "selected" : ""} onClick={() => setFulfillment("pickup")}><span>⌂</span><strong>Pickup</strong><small>San Jose area</small></button>
              <button type="button" className={fulfillment === "delivery" ? "selected" : ""} onClick={() => setFulfillment("delivery")}><span>◇</span><strong>Request delivery</strong><small>Availability and fee vary by distance</small></button>
            </div>
          </div>
        </section>

        <aside className="order-bar">
          <div><span>Starting total</span><strong>${startingTotal.toFixed(2)}</strong><small>$50 × {dozens} {dozens === 1 ? "dozen" : "dozens"}</small></div>
          <button type="button" onClick={addToCart} disabled={!ready}>{added ? "Added to cart ✓" : ready ? "Add to Cart" : "Choose design & date"}</button>
          <p>Final price is confirmed after design review. Delivery fees, if applicable, are not included.</p>
        </aside>
      </main>
      <V2Footer />

      <style jsx>{`
        .cookie-builder { --ink:#30251f; --cream:#fffaf5; --rose:#f7d9dc; --berry:#a94358; color:var(--ink); background:var(--cream); }
        .cookie-hero { position:relative; overflow:hidden; padding:1.25rem 1.25rem 3.2rem; background:linear-gradient(145deg,#f8e1df 0%,#fff7ed 72%); }
        .cookie-hero:after { content:""; position:absolute; width:190px; height:190px; border:1px solid rgba(169,67,88,.16); border-radius:50%; right:-70px; top:85px; }
        .cookie-crumb { display:flex; gap:.55rem; font-size:.72rem; text-transform:uppercase; letter-spacing:.1em; opacity:.58; margin-bottom:2.5rem; }
        .cookie-crumb a { color:inherit; }
        .cookie-kicker,.builder-intro>span { color:var(--berry); text-transform:uppercase; letter-spacing:.16em; font-size:.68rem; font-weight:800; }
        h1 { font-family:var(--font-display,Georgia,serif); font-size:clamp(2.6rem,12vw,4.7rem); line-height:.94; letter-spacing:-.04em; margin:.75rem 0 1.1rem; max-width:680px; }
        h1 em { color:var(--berry); font-weight:400; }
        .cookie-hero>p { max-width:470px; line-height:1.65; font-size:.96rem; }
        .starting-price { display:inline-flex; flex-direction:column; border-left:3px solid var(--berry); padding-left:.8rem; margin-top:1rem; }
        .starting-price strong { font-family:var(--font-display,Georgia,serif); font-size:1.35rem; }.starting-price span { font-size:.7rem; text-transform:uppercase; letter-spacing:.1em; }
        .cookie-art { position:absolute; right:1.2rem; bottom:1.1rem; width:82px; height:82px; border-radius:50%; background:#fff4dc; border:4px solid #fff; box-shadow:0 8px 25px rgba(70,35,22,.12); display:grid; place-items:center; transform:rotate(8deg); font-family:Georgia,serif; color:var(--berry); }
        .cookie-art span { position:absolute; font-size:.55rem; }.cookie-art span:first-child{top:12px}.cookie-art span:last-child{bottom:12px}.cookie-art b{font-size:1rem}
        .builder-shell { padding:2.3rem 1.25rem 1rem; max-width:760px; margin:auto; }
        .builder-intro { padding-bottom:2rem; }.builder-intro h2 { font-family:var(--font-display,Georgia,serif); font-size:2rem; line-height:1.08; margin:.6rem 0; }.builder-intro p,.step-copy p { color:#756761; line-height:1.55; font-size:.88rem; }
        .step { position:relative; border-top:1px solid #e9ddd5; padding:2rem 0; }.step-number { position:absolute; right:0; top:2rem; color:var(--berry); font-size:.72rem; font-weight:800; letter-spacing:.12em; }.step-copy { padding-right:2.5rem; margin-bottom:1.1rem; }.step-copy h3 { font-family:var(--font-display,Georgia,serif); font-size:1.45rem; margin:0 0 .3rem; }
        .quantity-control { display:grid; grid-template-columns:54px 1fr 54px; border:1px solid #dfd1c8; border-radius:1rem; overflow:hidden; background:white; }.quantity-control button { border:0; background:#fff7f4; font-size:1.65rem; color:var(--berry); }.quantity-control button:disabled{opacity:.3}.quantity-control div{display:flex; flex-direction:column; align-items:center; padding:.65rem}.quantity-control strong{font-size:1.25rem}.quantity-control span{font-size:.65rem;text-transform:uppercase;letter-spacing:.1em}
        .design-grid { display:grid; gap:.65rem; }.design-grid button,.fulfillment-grid button { text-align:left; display:grid; grid-template-columns:22px 1fr; gap:.15rem .55rem; border:1px solid #dfd1c8; background:#fff; border-radius:.85rem; padding:1rem; color:inherit; }.design-grid button.selected,.fulfillment-grid button.selected{border:2px solid var(--berry);background:#fff7f7;padding:calc(1rem - 1px)}.design-grid small,.fulfillment-grid small{grid-column:2;color:#766963;line-height:1.4}.radio{width:17px;height:17px;border:2px solid #ccbdb5;border-radius:50%;margin-top:1px}.selected .radio{border:5px solid var(--berry)}
        textarea,.field-label input { width:100%; box-sizing:border-box; border:1px solid #dfd1c8; border-radius:.8rem; background:#fff; padding:.9rem; font:inherit; color:inherit; }.photo-button { width:100%; margin-top:.7rem; border:1px dashed var(--berry); border-radius:.8rem; padding:.85rem; color:var(--berry); background:#fff9f8; font-weight:700; }.photo-status,.photo-error { font-size:.75rem; overflow-wrap:anywhere; }.photo-error{color:#a33}
        .field-label { display:grid; gap:.45rem; font-size:.75rem; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }.field-label input { text-transform:none; letter-spacing:0; font-size:1rem; font-weight:400; }.fulfillment-grid { display:grid; grid-template-columns:1fr 1fr; gap:.65rem; margin-top:.8rem; }.fulfillment-grid button{grid-template-columns:1fr}.fulfillment-grid button span{font-size:1.2rem;color:var(--berry)}.fulfillment-grid button small{grid-column:1}
        .order-bar { position:sticky; bottom:0; z-index:5; background:rgba(255,255,255,.96); backdrop-filter:blur(12px); border-top:1px solid #e5d8d0; padding:.8rem 1.25rem max(.8rem,env(safe-area-inset-bottom)); display:grid; grid-template-columns:1fr auto; gap:.55rem 1rem; box-shadow:0 -8px 25px rgba(60,35,25,.08); }.order-bar div{display:grid;grid-template-columns:auto auto;gap:0 .5rem}.order-bar div>span{font-size:.7rem;text-transform:uppercase;letter-spacing:.08em}.order-bar div>strong{grid-row:1 / span 2;grid-column:2;font-size:1.35rem}.order-bar div>small{font-size:.68rem;color:#786a63}.order-bar button{border:0;border-radius:999px;background:var(--berry);color:#fff;padding:.8rem 1.15rem;font-weight:800}.order-bar button:disabled{background:#bdb3ad}.order-bar>p{grid-column:1/-1;margin:0;font-size:.62rem;color:#786a63;text-align:center}
        @media (min-width:700px){.cookie-hero{padding:2rem max(2rem,calc((100vw - 1080px)/2)) 4rem}.cookie-art{width:130px;height:130px;right:max(3rem,calc((100vw - 960px)/2));bottom:2.2rem}.design-grid{grid-template-columns:repeat(3,1fr)}.design-grid button{grid-template-columns:1fr}.design-grid small{grid-column:1}.radio{margin-bottom:.35rem}.order-bar{max-width:760px;margin:0 auto 2rem;border:1px solid #e5d8d0;border-radius:1rem;bottom:1rem}.cookie-builder{padding-bottom:1px}}
      `}</style>
    </>
  );
}
