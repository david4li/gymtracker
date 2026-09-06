import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CalendarIcon, ChartIcon } from "@/components/ui/icons";

export default function ProgrammingPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Programming Tools</h1>
      <p className="text-sm text-zinc-500">
        Lightweight first-pass tools for planning training over time. These are simple calculators/organizers, not a full auto-progression engine.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/programming/periodization">
          <Card className="flex flex-col gap-2 hover:bg-black/5 dark:hover:bg-white/5">
            <ChartIcon className="text-orange-600" />
            <p className="font-semibold">Periodization Calculator</p>
            <p className="text-sm text-zinc-500">Generate a week-by-week set/rep/intensity plan for a routine using a linear, undulating, or block scheme.</p>
          </Card>
        </Link>
        <Link href="/programming/split-builder">
          <Card className="flex flex-col gap-2 hover:bg-black/5 dark:hover:bg-white/5">
            <CalendarIcon className="text-orange-600" />
            <p className="font-semibold">Weekly Split Builder</p>
            <p className="text-sm text-zinc-500">Assign a routine (or rest) to each day of the week.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
