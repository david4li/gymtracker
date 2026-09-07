"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Input";

export function ExercisePicker({ exercises, currentId }: { exercises: { id: number; name: string }[]; currentId: number }) {
  const router = useRouter();
  return (
    <Select
      className="max-w-[220px]"
      value={currentId}
      onChange={(e) => router.push(`/analytics/${e.target.value}`)}
    >
      {exercises.map((ex) => (
        <option key={ex.id} value={ex.id}>
          {ex.name}
        </option>
      ))}
    </Select>
  );
}
