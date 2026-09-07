import { listRoutinesForSelect } from "@/lib/api";
import { PeriodizationCalculator } from "@/components/programming/PeriodizationCalculator";

export default async function PeriodizationPage() {
  const routines = await listRoutinesForSelect();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Periodization Calculator</h1>
      {routines.length === 0 ? (
        <p className="text-sm text-zinc-500">Create a routine first to generate a plan for it.</p>
      ) : (
        <PeriodizationCalculator routines={routines} />
      )}
    </div>
  );
}
