import Link from "next/link";
import { getActiveWorkout, getRecentFinishedWorkouts, getWorkoutHistory, listRoutinesForSelect, getPRList, getSettings } from "@/lib/api";
import { weeklyWorkoutStreak } from "@gymtracker/shared/calculations/streak";
import { formatWeight } from "@gymtracker/shared/calculations/units";
import { startWorkout } from "@/lib/actions/workouts";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FlameIcon, PlayIcon, TrophyIcon, DumbbellIcon, ClipboardIcon, ChartIcon, ScaleIcon, CalendarIcon } from "@/components/ui/icons";
import { format } from "date-fns";

export default async function DashboardPage() {
  const [active, recent, history, prs, routines, settings] = await Promise.all([
    getActiveWorkout(),
    getRecentFinishedWorkouts(30),
    getWorkoutHistory(1),
    getPRList(3),
    listRoutinesForSelect(),
    getSettings(),
  ]);

  const streak = weeklyWorkoutStreak(recent.map((w) => w.date));
  const lastWorkout = history[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>

      {active ? (
        <Card className="border-orange-300 bg-orange-50 dark:border-orange-500/40 dark:bg-orange-500/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Workout in progress</p>
              <p className="text-xs text-zinc-500">Started {format(active.startedAt, "h:mm a")}</p>
            </div>
            <Link href={`/workouts/${active.id}`}>
              <Button>
                <PlayIcon width={18} height={18} /> Continue
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Start a workout" />
          <div className="flex flex-wrap gap-2">
            <form action={startWorkout.bind(null, undefined)}>
              <Button type="submit" variant="secondary">
                Start blank workout
              </Button>
            </form>
            {routines.map((r) => (
              <form key={r.id} action={startWorkout.bind(null, r.id)}>
                <Button type="submit">{r.name}</Button>
              </form>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="flex flex-col items-center justify-center gap-1 py-5 text-center">
          <FlameIcon className="text-orange-600" />
          <span className="text-2xl font-bold">{streak}</span>
          <span className="text-xs text-zinc-500">week streak</span>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-1 py-5 text-center">
          <DumbbellIcon className="text-orange-600" />
          <span className="text-2xl font-bold">{recent.length}</span>
          <span className="text-xs text-zinc-500">workouts (30d)</span>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-1 py-5 text-center">
          <TrophyIcon className="text-orange-600" />
          <span className="text-2xl font-bold">{prs.length}</span>
          <span className="text-xs text-zinc-500">recent PRs</span>
        </Card>
      </div>

      {lastWorkout ? (
        <Card>
          <CardHeader
            title="Last workout"
            action={
              <Link href="/workouts/history" className="text-sm font-medium text-orange-600 hover:underline">
                View history
              </Link>
            }
          />
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{lastWorkout.routineName ?? "Freestyle workout"}</p>
              <p className="text-zinc-500">{format(lastWorkout.date, "MMM d, yyyy")}</p>
            </div>
            <div className="text-right text-zinc-500">
              <p>{lastWorkout.setCount} sets / {lastWorkout.exerciseCount} exercises</p>
              <p>{Math.round(lastWorkout.volume).toLocaleString()} {settings.weightUnit} volume</p>
            </div>
          </div>
        </Card>
      ) : null}

      {prs.length > 0 ? (
        <Card>
          <CardHeader title="Recent PRs" />
          <ul className="flex flex-col gap-2">
            {prs.map((pr) => (
              <li key={pr.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{pr.exerciseName}</span>
                <span className="flex items-center gap-2 text-zinc-500">
                  {formatWeight(pr.weight, settings.weightUnit)} x {pr.reps}
                  <Badge tone="orange">PR</Badge>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Quick links" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <QuickLink href="/exercises" label="Exercises" icon={DumbbellIcon} />
          <QuickLink href="/routines" label="Routines" icon={ClipboardIcon} />
          <QuickLink href="/analytics" label="Analytics" icon={ChartIcon} />
          <QuickLink href="/body-stats" label="Body Stats" icon={ScaleIcon} />
          <QuickLink href="/programming" label="Programming" icon={CalendarIcon} />
        </div>
      </Card>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof DumbbellIcon;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-black/10 py-4 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
    >
      <Icon className="text-orange-600" />
      {label}
    </Link>
  );
}
