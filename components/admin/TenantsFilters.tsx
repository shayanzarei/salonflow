"use client";

import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
import { WEBSITE_TEMPLATES } from "@/lib/website-templates";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  q: string;
  plan: string;
  status: string;
  template: string;
  sort: string;
};

export function TenantsFilters({ q, plan, status, template, sort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(q);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const onSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateParam("q", searchValue.trim());
  };

  return (
    <form
      onSubmit={onSearchSubmit}
      className="mb-4 flex flex-col gap-4 rounded-lg border border-ink-200 bg-ink-0 p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[4fr_3fr] lg:items-center">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            id="filter-plan"
            name="plan"
            value={plan}
            onChange={(e) => updateParam("plan", e.target.value)}
          >
            <option value="all">Plan: All</option>
            <option value="solo">Plan: Solo</option>
            <option value="hub">Plan: Hub</option>
            <option value="agency">Plan: Agency</option>
          </Select>

          <Select
            id="filter-status"
            name="status"
            value={status}
            onChange={(e) => updateParam("status", e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="draft">Status: Draft</option>
            <option value="pending_approval">Status: Pending approval</option>
            <option value="published">Status: Published</option>
          </Select>

          <Select
            id="filter-template"
            name="template"
            value={template}
            onChange={(e) => updateParam("template", e.target.value)}
          >
            <option value="all">Template: All</option>
            {WEBSITE_TEMPLATES.map((item) => (
              <option key={item.id} value={item.id}>
                Template: {item.label}
              </option>
            ))}
          </Select>

          <Select
            id="filter-sort"
            name="sort"
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="name_asc">Sort: Name A-Z</option>
            <option value="name_desc">Sort: Name Z-A</option>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              id="filter-q"
              type="text"
              name="q"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search name, slug..."
            />
          </div>
          <Button type="submit" variant="secondary" size="md" className="shrink-0">
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
}
