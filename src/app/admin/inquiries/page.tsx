import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "No date";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="kicker mb-2">Custom orders</div>
          <h1 className="text-4xl italic font-light leading-none">
            Contact <span className="font-medium">inquiries</span>
          </h1>
        </div>
        <div className="admin-card px-4 py-3 text-sm text-ink-soft">
          <span className="text-2xl font-medium text-ink mr-1" style={{ fontFamily: "var(--font-fraunces)" }}>
            {inquiries.length}
          </span>
          recent inquir{inquiries.length === 1 ? "y" : "ies"}
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="admin-card-soft p-6 text-sm text-ink-soft">No inquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="admin-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="kicker mb-1">{formatDateTime(inquiry.createdAt)}</div>
                  <h2 className="text-[17px] font-semibold text-ink truncate">{inquiry.name}</h2>
                  <a className="text-sm text-cherry hover:underline break-all" href={`mailto:${inquiry.email}`}>
                    {inquiry.email}
                  </a>
                </div>
                <span className="pill bg-blush-soft text-rose-deep shrink-0">{inquiry.source.replaceAll("_", " ")}</span>
              </div>

              <dl className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <dt className="kicker mb-1">Event date</dt>
                  <dd className="text-ink">{formatDate(inquiry.eventDate)}</dd>
                </div>
                <div>
                  <dt className="kicker mb-1">Guest count</dt>
                  <dd className="text-ink">{inquiry.guestCount || "Not provided"}</dd>
                </div>
              </dl>

              <div className="border-t border-[var(--rule)] pt-3 text-sm text-ink-soft whitespace-pre-wrap">
                {inquiry.message || "No message provided."}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
