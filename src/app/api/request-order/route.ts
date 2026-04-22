import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CartItem {
  name: string;
  variantLabel: string;
  quantity: number;
  price: number;
  flavour?: string;
  note?: string;
}

export async function POST(req: NextRequest) {
  const { items, totalPrice } = await req.json();

  const itemRows = (items as CartItem[])
    .map((item) => {
      let row = `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;">${item.name}<br/><span style="color:#999;font-size:12px;">${item.variantLabel}</span></td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe4;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`;
      if (item.flavour) {
        row += `<tr><td colspan="3" style="padding:0 12px 8px;font-size:12px;color:#777;border-bottom:1px solid #f0ebe4;">Flavour: ${item.flavour}</td></tr>`;
      }
      if (item.note) {
        row += `<tr><td colspan="3" style="padding:0 12px 8px;font-size:12px;color:#777;border-bottom:1px solid #f0ebe4;">Details: ${item.note}</td></tr>`;
      }
      return row;
    })
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2a1a14;">
      <div style="background:#c05;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">New Order Request</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">Dip &amp; Sprinkle</p>
      </div>
      <div style="padding:32px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#faf9f7;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#999;">Item</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#999;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#999;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:14px 12px;font-weight:700;">Total</td>
              <td style="padding:14px 12px;text-align:right;font-weight:700;font-size:18px;color:#c05;">$${Number(totalPrice).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <p style="margin:0;font-size:13px;color:#999;border-top:1px solid #f0ebe4;padding-top:16px;">
          Reply to this email or send an Instagram DM to <strong>@dipsprinkle</strong> to confirm this order.
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "Dip & Sprinkle Orders <onboarding@resend.dev>",
      to: "supportdipsprinkle@gmail.com",
      subject: `New Order Request — $${Number(totalPrice).toFixed(2)}`,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
