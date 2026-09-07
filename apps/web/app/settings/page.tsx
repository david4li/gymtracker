import { getSettings } from "@/lib/api";
import { updateSettings, resetAllData } from "@/lib/actions/settings";
import { signOut } from "@/lib/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WEIGHT_UNITS } from "@gymtracker/shared";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const [settings, { data: auth }] = await Promise.all([
    getSettings(),
    supabase.auth.getUser(),
  ]);
  const email = auth.user?.email ?? "your account";

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
        <CardHeader title="Account" />
        <p className="mb-3 text-sm text-zinc-500">
          Signed in as <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>.
          Your data syncs to your account and is visible only to you.
        </p>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Data" />
        <form
          action={async () => {
            "use server";
            await resetAllData();
          }}
        >
          <p className="mb-2 text-sm text-zinc-500">
            Permanently deletes your logged workouts, routines, and body stats. The shared
            exercise library is not affected, and no other account is touched.
          </p>
          <Button type="submit" variant="danger">
            Reset logged data
          </Button>
        </form>
      </Card>
    </div>
  );
}
