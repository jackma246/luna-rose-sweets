import { prisma } from "@/lib/prisma";
import AvailabilityCalendarClient from "./AvailabilityCalendarClient";

export default async function AvailabilityCalendar() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  const records = await prisma.availabilityDate.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "asc" },
  });

  return (
    <AvailabilityCalendarClient
      records={records.map((record) => ({
        date: record.date.toISOString().slice(0, 10),
        status: record.status,
        note: record.note,
      }))}
    />
  );
}
