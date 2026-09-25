import { prisma } from "@/lib/prisma";
import { addMonthsToMonthKey, dateKeyFromDbDate, monthKeyOf, toDbDate, todayKey } from "@/lib/businessDate";
import AvailabilityCalendarClient from "./AvailabilityCalendarClient";

export default async function AvailabilityCalendar() {
  const thisMonth = monthKeyOf(todayKey());
  const records = await prisma.availabilityDate.findMany({
    where: {
      date: {
        gte: toDbDate(`${thisMonth}-01`),
        lt: toDbDate(`${addMonthsToMonthKey(thisMonth, 12)}-01`),
      },
    },
    orderBy: { date: "asc" },
  });

  return (
    <AvailabilityCalendarClient
      records={records.map((record) => ({
        date: dateKeyFromDbDate(record.date),
        status: record.status,
        note: record.note,
      }))}
    />
  );
}
