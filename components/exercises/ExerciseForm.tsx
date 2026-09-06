import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@/lib/db/schema";
import type { MuscleGroup, Equipment } from "@/lib/db/schema";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ExerciseForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues?: {
    name: string;
    primaryMuscleGroup: MuscleGroup;
    secondaryMuscleGroups: MuscleGroup[];
    equipment: Equipment;
    notes: string | null;
    videoUrl: string | null;
  };
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={defaultValues?.name} placeholder="e.g. Incline Dumbbell Press" />
      </Field>

      <Field label="Primary muscle group" htmlFor="primaryMuscleGroup">
        <Select id="primaryMuscleGroup" name="primaryMuscleGroup" defaultValue={defaultValues?.primaryMuscleGroup ?? MUSCLE_GROUPS[0]}>
          {MUSCLE_GROUPS.map((mg) => (
            <option key={mg} value={mg}>
              {titleCase(mg)}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">Secondary muscle groups</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {MUSCLE_GROUPS.map((mg) => (
            <label key={mg} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="secondaryMuscleGroups"
                value={mg}
                defaultChecked={defaultValues?.secondaryMuscleGroups.includes(mg)}
                className="h-4 w-4 accent-orange-600"
              />
              {titleCase(mg)}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Equipment" htmlFor="equipment">
        <Select id="equipment" name="equipment" defaultValue={defaultValues?.equipment ?? EQUIPMENT_TYPES[0]}>
          {EQUIPMENT_TYPES.map((eq) => (
            <option key={eq} value={eq}>
              {titleCase(eq)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Notes" htmlFor="notes" hint="Cues, form tips, anything you want to remember.">
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} />
      </Field>

      <Field label="Video URL" htmlFor="videoUrl" hint="Optional link to a demo video.">
        <Input id="videoUrl" name="videoUrl" type="url" defaultValue={defaultValues?.videoUrl ?? ""} placeholder="https://..." />
      </Field>

      <Button type="submit" size="lg" className="mt-2 w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}
