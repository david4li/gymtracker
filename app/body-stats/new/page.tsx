import { getSettings } from "@/lib/queries/settings";
import { createBodyStat } from "@/lib/actions/bodyStats";
import { BodyStatForm } from "@/components/body-stats/BodyStatForm";

export default async function NewBodyStatPage() {
  const settings = await getSettings();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Log Body Stats</h1>
      <BodyStatForm action={createBodyStat.bind(null, settings.weightUnit)} unit={settings.weightUnit} submitLabel="Save entry" />
    </div>
  );
}
