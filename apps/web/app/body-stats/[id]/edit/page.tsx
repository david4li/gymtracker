import { notFound } from "next/navigation";
import { getBodyStatById, getSettings } from "@/lib/api";
import { updateBodyStat, deleteBodyStat } from "@/lib/actions/bodyStats";
import { BodyStatForm } from "@/components/body-stats/BodyStatForm";
import { displayBodyWeight } from "@gymtracker/shared/calculations/units";
import { Button } from "@/components/ui/Button";

export default async function EditBodyStatPage({ params }: PageProps<"/body-stats/[id]/edit">) {
  const { id } = await params;
  const statId = Number(id);
  const [stat, settings] = await Promise.all([getBodyStatById(statId), getSettings()]);
  if (!stat) notFound();

  const measurements = stat.measurements ?? {};

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Body Stat Entry</h1>
      <BodyStatForm
        action={updateBodyStat.bind(null, statId, settings.weightUnit)}
        unit={settings.weightUnit}
        submitLabel="Save changes"
        defaultValues={{
          date: stat.date,
          weight: stat.weightKg ? Math.round(displayBodyWeight(stat.weightKg, settings.weightUnit) * 10) / 10 : undefined,
          waist: measurements.waist,
          chest: measurements.chest,
          arms: measurements.arms,
          hips: measurements.hips,
          thighs: measurements.thighs,
          photoUrl: stat.photoUrl,
          notes: stat.notes,
        }}
      />
      <form action={deleteBodyStat.bind(null, statId)} className="max-w-xl border-t border-black/10 pt-4 dark:border-white/10">
        <Button type="submit" variant="danger">
          Delete entry
        </Button>
      </form>
    </div>
  );
}
