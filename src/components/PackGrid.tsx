import { PackCard } from "./PackCard";
import type { Pack } from "../types";

export function PackGrid({ packs }: { packs: Pack[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 px-2 py-2">
      {packs.map((pack) => (
        <PackCard key={pack.name} pack={pack} />
      ))}
    </div>
  );
}
