import { getSettings } from "@/lib/queries/settings";
import { updateSettings, resetAllData } from "@/lib/actions/settings";
import { WEIGHT_UNITS } from "@/lib/db/schema";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader title="Preferences" />
        <form action={updateSettings} className="flex max-w-sm flex-col gap-4">
          <Field label="Weight unit" htmlFor="weightUnit">
            <Select id="weightUnit" name="weightUnit" defaultValue={settings.weightUnit}>
              {WEIGHT_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Default rest timer (seconds)" htmlFor="defaultRestSeconds">
            <Input id="defaultRestSeconds" name="defaultRestSeconds" type="number" min={0} step={15} defaultValue={settings.defaultRestSeconds} />
          </Field>
          <Button type="submit" className="self-start">
            Save
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Data" />
        <p className="mb-3 text-sm text-zinc-500">
          This app runs entirely on a local SQLite file (<code className="rounded bg-black/10 px-1 dark:bg-white/10">sqlite.db</code>) - single user, no account, no cloud sync.
          Back it up by copying that file.
        </p>
        <form
          action={async () => {
            "use server";
            await resetAllData();
          }}
        >
          <p className="mb-2 text-sm text-zinc-500">
            Dev convenience: wipe logged workouts, routines, and body stats (keeps the built-in exercise library). Run <code className="rounded bg-black/10 px-1 dark:bg-white/10">npm run db:seed</code> afterward to restore sample data.
          </p>
          <Button type="submit" variant="danger">
            Reset logged data
          </Button>
        </form>
      </Card>
    </div>
  );
}
