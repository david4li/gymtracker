import { Field, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { WeightUnit } from "@/lib/db/schema";
import { format } from "date-fns";

export function BodyStatForm({
  action,
  unit,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  unit: WeightUnit;
  submitLabel: string;
  defaultValues?: {
    date: Date;
    weight?: number;
    waist?: number;
    chest?: number;
    arms?: number;
    hips?: number;
    thighs?: number;
    photoUrl?: string | null;
    notes?: string | null;
  };
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Field label="Date" htmlFor="date">
        <Input id="date" name="date" type="date" required defaultValue={format(defaultValues?.date ?? new Date(), "yyyy-MM-dd")} />
      </Field>
      <Field label={`Weight (${unit})`} htmlFor="weight">
        <Input id="weight" name="weight" type="number" step="0.1" min="0" defaultValue={defaultValues?.weight} />
      </Field>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Waist (cm)" htmlFor="waist">
          <Input id="waist" name="waist" type="number" step="0.1" min="0" defaultValue={defaultValues?.waist} />
        </Field>
        <Field label="Chest (cm)" htmlFor="chest">
          <Input id="chest" name="chest" type="number" step="0.1" min="0" defaultValue={defaultValues?.chest} />
        </Field>
        <Field label="Arms (cm)" htmlFor="arms">
          <Input id="arms" name="arms" type="number" step="0.1" min="0" defaultValue={defaultValues?.arms} />
        </Field>
        <Field label="Hips (cm)" htmlFor="hips">
          <Input id="hips" name="hips" type="number" step="0.1" min="0" defaultValue={defaultValues?.hips} />
        </Field>
        <Field label="Thighs (cm)" htmlFor="thighs">
          <Input id="thighs" name="thighs" type="number" step="0.1" min="0" defaultValue={defaultValues?.thighs} />
        </Field>
      </div>

      <Field label="Photo URL" htmlFor="photoUrl" hint="Optional link to a progress photo you host elsewhere.">
        <Input id="photoUrl" name="photoUrl" type="url" defaultValue={defaultValues?.photoUrl ?? ""} placeholder="https://..." />
      </Field>

      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes ?? ""} />
      </Field>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}
