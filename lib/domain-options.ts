import { formatDate } from "@/lib/date";

export type DomainOption = {
  id: number;
  name: string;
  oneDayAgo?: boolean;
  oneWeekAgo?: boolean;
  oneMonthAgo?: boolean;
  compareDates?: boolean;
  value?: { startDate: string; endDate: string };
  domain?: string;
};

export function getDomainOptions(): DomainOption[] {
  const today = formatDate(new Date());
  return [
    { id: 0, name: "One day analysis.", oneDayAgo: true },
    { id: 1, name: "One week analysis.", oneWeekAgo: true },
    { id: 2, name: "One month analysis.", oneMonthAgo: true },
    { id: 3, name: "Compare dates.", value: { startDate: today, endDate: today }, compareDates: true },
  ];
}
