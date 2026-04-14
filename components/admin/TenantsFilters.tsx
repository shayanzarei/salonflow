"use client";

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
      className="mb-4 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[4fr_3fr] lg:items-center">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            name="plan"
            value={plan}
            onChange={(e) => updateParam("plan", e.target.value)}
            className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="all">Plan: All</option>
            <option value="starter">Plan: Starter</option>
            <option value="pro">Plan: Pro</option>
            <option value="enterprise">Plan: Enterprise</option>
          </select>

          <select
            name="status"
            value={status}
            onChange={(e) => updateParam("status", e.target.value)}
            className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="all">Status: All</option>
            <option value="draft">Status: Draft</option>
            <option value="pending_approval">Status: Pending approval</option>
            <option value="published">Status: Published</option>
          </select>

          <select
            name="template"
            value={template}
            onChange={(e) => updateParam("template", e.target.value)}
            className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="all">Template: All</option>
            {WEBSITE_TEMPLATES.map((item) => (
              <option key={item.id} value={item.id}>
                Template: {item.label}
              </option>
            ))}
          </select>

          <select
            name="sort"
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="name_asc">Sort: Name A-Z</option>
            <option value="name_desc">Sort: Name Z-A</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search name, slug..."
            className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            className="min-h-11 shrink-0 rounded-[10px] border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Apply
          </button>
        </div>
      </div>
    </form>
  );
}
