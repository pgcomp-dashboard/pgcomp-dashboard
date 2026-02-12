import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FilterItem {
  field: string;
  value: string | number | boolean;
  operator?: "=" | "!=" | "like" | "not like" | "in" | "not in";
}

/**
 * Transforms an array of filter items into the indexed syntax required by the backend.
 * Example: [{ field: 'name', value: 'foo' }] -> { 'filters[0][field]': 'name', 'filters[0][value]': 'foo', 'filters[0][operator]': '=' }
 */
export function transformFilters(filters: FilterItem[]): Record<string, string | number> {
  const result: Record<string, string | number> = {};

  filters.forEach((filter, index) => {
    if (filter.value === undefined || filter.value === null || filter.value === "") return;

    result[`filters[${index}][field]`] = filter.field;
    result[`filters[${index}][value]`] = filter.value.toString();
    result[`filters[${index}][operator]`] = filter.operator || "=";
  });

  return result;
}
