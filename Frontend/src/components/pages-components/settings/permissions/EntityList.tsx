import React from "react";
import Checkbox from "@/components/reuseable/forms/Checkbox";
import SearchField from "@/components/reuseable/Shared/SearchField";

interface EntityListProps {
  entities: any[];
  tab: string;
  search: string;
  setSearch: (v: string) => void;
  selected: number[];
  setSelected: (ids: number[]) => void;
  handleSelect: (id: number) => void;
}

const EntityList: React.FC<EntityListProps> = ({
  entities,
  tab,
  search,
  setSearch,
  selected,
  setSelected,
  handleSelect,
}) => (
  <div className="w-64 rounded-lg p-3 border h-max">
    <div className="flex items-center justify-between mb-2">
      <span
        className="text-xs text-primary cursor-pointer hover:underline"
        onClick={() => setSelected(entities.map((e: any) => e.id))}
      >
        Select All
      </span>
      <span
        className="text-xs text-gray-500 cursor-pointer hover:underline ml-2"
        onClick={() => setSelected([])}
      >
        Clear
      </span>
    </div>
    <SearchField
      placeholder={`Search ${tab}s...`}
      value={search}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setSearch(e.target.value)
      }
      className="mb-2 max-w-[246px]"
      inputClassName=""
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
    />
    <ul className="space-y-1 h-[580px] overflow-auto cursor-pointer px-1">
      {entities
        .filter((e: any) => {
          if (tab === "user") {
            const q = search.toLowerCase();
            return (
              (e.username && e.username.toLowerCase().includes(q)) ||
              (e.email && e.email.toLowerCase().includes(q)) ||
              (e.firstName && e.firstName.toLowerCase().includes(q)) ||
              (e.lastName && e.lastName.toLowerCase().includes(q))
            );
          }
          return e.name?.toLowerCase().includes(search.toLowerCase());
        })
        .map((e: any) => (
          <li key={e.id}>
            <Checkbox
              label={
                tab === "user"
                  ? e.firstName || e.lastName
                    ? `${e.firstName || ""} ${e.lastName || ""}`.trim()
                    : e.username || e.email || `User #${e.id}`
                  : e.name
              }
              isChecked={selected.includes(e.id)}
              onToggle={() => handleSelect(e.id)}
              labelClassName="text-sm truncate max-w-[180px] text-black"
            />
          </li>
        ))}
    </ul>
  </div>
);

export default EntityList;
