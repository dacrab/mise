import { ClockIcon, UserGroupIcon, FireIcon } from "@heroicons/react/24/outline";

interface MetaStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function MetaStat({ icon, label, value }: MetaStatProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 bg-cream-dark rounded-xl text-center">
      <div className="text-stone">{icon}</div>
      <span className="text-xs text-stone uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-charcoal">{value}</span>
    </div>
  );
}

interface RecipeMetaProps {
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  difficulty?: string | null;
}

export function RecipeMeta({ prepTime, cookTime, servings, difficulty }: RecipeMetaProps) {
  if (!prepTime && !cookTime && !servings && !difficulty) return null;
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {prepTime && <MetaStat icon={<ClockIcon className="w-4 h-4" />} label="Prep" value={`${prepTime} min`} />}
      {cookTime && <MetaStat icon={<FireIcon className="w-4 h-4" />} label="Cook" value={`${cookTime} min`} />}
      {prepTime && cookTime && <MetaStat icon={<ClockIcon className="w-4 h-4" />} label="Total" value={`${prepTime + cookTime} min`} />}
      {servings && <MetaStat icon={<UserGroupIcon className="w-4 h-4" />} label="Servings" value={String(servings)} />}
      {difficulty && <MetaStat icon={<FireIcon className="w-4 h-4" />} label="Difficulty" value={difficulty} />}
    </div>
  );
}
