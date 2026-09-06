import type { exercises } from "@/lib/db/schema";

type NewExercise = typeof exercises.$inferInsert;

/**
 * Starter exercise library spanning every muscle group. Seeded once on `npm run db:seed`;
 * users can add their own custom exercises afterward from /exercises/new.
 */
export const exerciseSeedData: NewExercise[] = [
  // ---------- Chest ----------
  { name: "Barbell Bench Press", primaryMuscleGroup: "chest", secondaryMuscleGroups: ["triceps", "shoulders"], equipment: "barbell", notes: "Classic horizontal press. Keep shoulder blades retracted." },
  { name: "Incline Dumbbell Press", primaryMuscleGroup: "chest", secondaryMuscleGroups: ["shoulders", "triceps"], equipment: "dumbbell", notes: "30-45 degree incline targets upper chest." },
  { name: "Push-Up", primaryMuscleGroup: "chest", secondaryMuscleGroups: ["triceps", "abs"], equipment: "bodyweight", notes: "Bodyweight staple; elevate feet to increase difficulty." },
  { name: "Cable Chest Fly", primaryMuscleGroup: "chest", secondaryMuscleGroups: [], equipment: "cable", notes: "Constant tension through the full range of motion." },
  { name: "Flat Dumbbell Fly", primaryMuscleGroup: "chest", secondaryMuscleGroups: ["shoulders"], equipment: "dumbbell", notes: "Keep a slight bend in the elbows throughout." },
  { name: "Machine Chest Press", primaryMuscleGroup: "chest", secondaryMuscleGroups: ["triceps"], equipment: "machine", notes: "Good option for controlled, joint-friendly volume." },
  { name: "Dips (Chest Lean)", primaryMuscleGroup: "chest", secondaryMuscleGroups: ["triceps", "shoulders"], equipment: "bodyweight", notes: "Lean forward to bias the chest over the triceps." },

  // ---------- Back ----------
  { name: "Deadlift", primaryMuscleGroup: "back", secondaryMuscleGroups: ["hamstrings", "glutes", "forearms"], equipment: "barbell", notes: "Full posterior-chain compound lift. Keep the bar close to the shins." },
  { name: "Pull-Up", primaryMuscleGroup: "back", secondaryMuscleGroups: ["biceps", "forearms"], equipment: "bodyweight", notes: "Overhand grip, shoulder-width or slightly wider." },
  { name: "Lat Pulldown", primaryMuscleGroup: "back", secondaryMuscleGroups: ["biceps"], equipment: "cable", notes: "Pull to the upper chest, avoid leaning back excessively." },
  { name: "Barbell Row", primaryMuscleGroup: "back", secondaryMuscleGroups: ["biceps", "forearms"], equipment: "barbell", notes: "Hinge at the hips, pull to the lower ribcage." },
  { name: "Seated Cable Row", primaryMuscleGroup: "back", secondaryMuscleGroups: ["biceps"], equipment: "cable", notes: "Squeeze shoulder blades together at the finish." },
  { name: "T-Bar Row", primaryMuscleGroup: "back", secondaryMuscleGroups: ["biceps"], equipment: "barbell", notes: "Chest-supported variation reduces lower-back strain." },
  { name: "One-Arm Dumbbell Row", primaryMuscleGroup: "back", secondaryMuscleGroups: ["biceps"], equipment: "dumbbell", notes: "Brace on a bench, avoid rotating the torso." },

  // ---------- Shoulders ----------
  { name: "Overhead Press", primaryMuscleGroup: "shoulders", secondaryMuscleGroups: ["triceps", "abs"], equipment: "barbell", notes: "Standing strict press; brace the core hard." },
  { name: "Dumbbell Shoulder Press", primaryMuscleGroup: "shoulders", secondaryMuscleGroups: ["triceps"], equipment: "dumbbell", notes: "Seated or standing; allows a more natural path." },
  { name: "Lateral Raise", primaryMuscleGroup: "shoulders", secondaryMuscleGroups: [], equipment: "dumbbell", notes: "Lead with the elbows, raise to shoulder height." },
  { name: "Front Raise", primaryMuscleGroup: "shoulders", secondaryMuscleGroups: [], equipment: "dumbbell", notes: "Targets the anterior deltoid; keep reps controlled." },
  { name: "Rear Delt Fly", primaryMuscleGroup: "shoulders", secondaryMuscleGroups: ["back"], equipment: "dumbbell", notes: "Hinge forward, raise with a slight elbow bend." },
  { name: "Face Pull", primaryMuscleGroup: "shoulders", secondaryMuscleGroups: ["back"], equipment: "cable", notes: "Great for rear delts and rotator cuff health." },
  { name: "Arnold Press", primaryMuscleGroup: "shoulders", secondaryMuscleGroups: ["triceps"], equipment: "dumbbell", notes: "Rotating press that hits all three deltoid heads." },

  // ---------- Biceps ----------
  { name: "Barbell Curl", primaryMuscleGroup: "biceps", secondaryMuscleGroups: ["forearms"], equipment: "barbell", notes: "Keep elbows pinned to your sides." },
  { name: "Dumbbell Curl", primaryMuscleGroup: "biceps", secondaryMuscleGroups: ["forearms"], equipment: "dumbbell", notes: "Alternate or simultaneous; supinate the wrist as you curl." },
  { name: "Hammer Curl", primaryMuscleGroup: "biceps", secondaryMuscleGroups: ["forearms"], equipment: "dumbbell", notes: "Neutral grip biases the brachialis and forearm." },
  { name: "Preacher Curl", primaryMuscleGroup: "biceps", secondaryMuscleGroups: [], equipment: "barbell", notes: "Removes momentum, isolates the biceps well." },
  { name: "Cable Curl", primaryMuscleGroup: "biceps", secondaryMuscleGroups: ["forearms"], equipment: "cable", notes: "Constant tension throughout the curl." },

  // ---------- Triceps ----------
  { name: "Tricep Pushdown", primaryMuscleGroup: "triceps", secondaryMuscleGroups: [], equipment: "cable", notes: "Keep elbows tucked, extend fully at the bottom." },
  { name: "Skull Crusher", primaryMuscleGroup: "triceps", secondaryMuscleGroups: [], equipment: "barbell", notes: "Lower the bar to the forehead/behind the head under control." },
  { name: "Overhead Tricep Extension", primaryMuscleGroup: "triceps", secondaryMuscleGroups: [], equipment: "dumbbell", notes: "Stretches the long head of the triceps." },
  { name: "Close-Grip Bench Press", primaryMuscleGroup: "triceps", secondaryMuscleGroups: ["chest", "shoulders"], equipment: "barbell", notes: "Hands just inside shoulder width." },
  { name: "Dips", primaryMuscleGroup: "triceps", secondaryMuscleGroups: ["chest", "shoulders"], equipment: "bodyweight", notes: "Stay upright to keep the emphasis on triceps." },

  // ---------- Forearms ----------
  { name: "Wrist Curl", primaryMuscleGroup: "forearms", secondaryMuscleGroups: [], equipment: "barbell", notes: "Forearms on thighs or a bench, curl at the wrist only." },
  { name: "Reverse Wrist Curl", primaryMuscleGroup: "forearms", secondaryMuscleGroups: [], equipment: "barbell", notes: "Targets the extensors on the back of the forearm." },
  { name: "Farmer's Carry", primaryMuscleGroup: "forearms", secondaryMuscleGroups: ["full_body"], equipment: "dumbbell", notes: "Walk for distance or time with a heavy, stable grip." },

  // ---------- Quads ----------
  { name: "Back Squat", primaryMuscleGroup: "quads", secondaryMuscleGroups: ["glutes", "hamstrings"], equipment: "barbell", notes: "The foundational lower-body compound movement." },
  { name: "Front Squat", primaryMuscleGroup: "quads", secondaryMuscleGroups: ["abs", "glutes"], equipment: "barbell", notes: "More upright torso, greater quad emphasis." },
  { name: "Leg Press", primaryMuscleGroup: "quads", secondaryMuscleGroups: ["glutes", "hamstrings"], equipment: "machine", notes: "Adjust foot placement to shift the emphasis." },
  { name: "Leg Extension", primaryMuscleGroup: "quads", secondaryMuscleGroups: [], equipment: "machine", notes: "Isolation finisher for the quads." },
  { name: "Walking Lunge", primaryMuscleGroup: "quads", secondaryMuscleGroups: ["glutes", "hamstrings"], equipment: "dumbbell", notes: "Great for unilateral strength and balance." },
  { name: "Bulgarian Split Squat", primaryMuscleGroup: "quads", secondaryMuscleGroups: ["glutes"], equipment: "dumbbell", notes: "Rear foot elevated; humbling but very effective." },

  // ---------- Hamstrings ----------
  { name: "Romanian Deadlift", primaryMuscleGroup: "hamstrings", secondaryMuscleGroups: ["glutes", "back"], equipment: "barbell", notes: "Hip hinge with a slight knee bend, feel the hamstring stretch." },
  { name: "Lying Leg Curl", primaryMuscleGroup: "hamstrings", secondaryMuscleGroups: [], equipment: "machine", notes: "Isolation movement for the hamstrings." },
  { name: "Good Morning", primaryMuscleGroup: "hamstrings", secondaryMuscleGroups: ["back", "glutes"], equipment: "barbell", notes: "Bar on back, hinge forward keeping a flat spine." },
  { name: "Glute Ham Raise", primaryMuscleGroup: "hamstrings", secondaryMuscleGroups: ["glutes"], equipment: "machine", notes: "Advanced posterior-chain bodyweight movement." },

  // ---------- Glutes ----------
  { name: "Hip Thrust", primaryMuscleGroup: "glutes", secondaryMuscleGroups: ["hamstrings"], equipment: "barbell", notes: "Drive through the heels, squeeze glutes hard at the top." },
  { name: "Glute Bridge", primaryMuscleGroup: "glutes", secondaryMuscleGroups: ["hamstrings"], equipment: "bodyweight", notes: "A great bodyweight-only alternative to the hip thrust." },
  { name: "Cable Kickback", primaryMuscleGroup: "glutes", secondaryMuscleGroups: [], equipment: "cable", notes: "Isolation movement; avoid overarching the lower back." },
  { name: "Sumo Deadlift", primaryMuscleGroup: "glutes", secondaryMuscleGroups: ["hamstrings", "back"], equipment: "barbell", notes: "Wide stance shifts more load to the glutes and adductors." },

  // ---------- Calves ----------
  { name: "Standing Calf Raise", primaryMuscleGroup: "calves", secondaryMuscleGroups: [], equipment: "machine", notes: "Full stretch at the bottom, pause at the top." },
  { name: "Seated Calf Raise", primaryMuscleGroup: "calves", secondaryMuscleGroups: [], equipment: "machine", notes: "Bent-knee position emphasizes the soleus." },
  { name: "Donkey Calf Raise", primaryMuscleGroup: "calves", secondaryMuscleGroups: [], equipment: "machine", notes: "Hip-flexed position increases the stretch on the gastrocnemius." },

  // ---------- Abs ----------
  { name: "Plank", primaryMuscleGroup: "abs", secondaryMuscleGroups: [], equipment: "bodyweight", notes: "Hold a straight line from head to heels." },
  { name: "Hanging Leg Raise", primaryMuscleGroup: "abs", secondaryMuscleGroups: ["forearms"], equipment: "bodyweight", notes: "Avoid swinging; control the descent." },
  { name: "Cable Crunch", primaryMuscleGroup: "abs", secondaryMuscleGroups: [], equipment: "cable", notes: "Kneel and crunch down, flexing through the spine." },
  { name: "Ab Wheel Rollout", primaryMuscleGroup: "abs", secondaryMuscleGroups: ["back"], equipment: "other", notes: "Roll out only as far as you can keep your back flat." },
  { name: "Russian Twist", primaryMuscleGroup: "abs", secondaryMuscleGroups: [], equipment: "bodyweight", notes: "Rotate through the torso, feet elevated for more challenge." },

  // ---------- Full body / conditioning ----------
  { name: "Kettlebell Swing", primaryMuscleGroup: "full_body", secondaryMuscleGroups: ["glutes", "hamstrings"], equipment: "kettlebell", notes: "Hip-hinge power movement, not a squat." },
  { name: "Thruster", primaryMuscleGroup: "full_body", secondaryMuscleGroups: ["quads", "shoulders"], equipment: "barbell", notes: "Front squat directly into an overhead press." },
  { name: "Burpee", primaryMuscleGroup: "full_body", secondaryMuscleGroups: ["chest", "quads"], equipment: "bodyweight", notes: "Conditioning staple combining a squat, plank, and jump." },
  { name: "Clean and Jerk", primaryMuscleGroup: "full_body", secondaryMuscleGroups: ["quads", "shoulders", "back"], equipment: "barbell", notes: "Olympic lift; technical, best learned with coaching." },

  // ---------- Cardio ----------
  { name: "Treadmill Run", primaryMuscleGroup: "cardio", secondaryMuscleGroups: ["quads", "hamstrings"], equipment: "other", notes: "Log duration/distance in the notes field for now." },
  { name: "Rowing Machine", primaryMuscleGroup: "cardio", secondaryMuscleGroups: ["back", "quads"], equipment: "other", notes: "Full-body cardio with a strong posterior-chain component." },
  { name: "Stationary Bike", primaryMuscleGroup: "cardio", secondaryMuscleGroups: ["quads"], equipment: "other", notes: "Low-impact steady-state or interval cardio." },
  { name: "Jump Rope", primaryMuscleGroup: "cardio", secondaryMuscleGroups: ["calves"], equipment: "other", notes: "Great warm-up or finisher for conditioning." },
];
