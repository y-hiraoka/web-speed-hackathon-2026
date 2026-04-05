import * as v from "valibot";

import { isValidDate, parseSearchQuery } from "@web-speed-hackathon-2026/client/src/search/services";

export const SearchFormSchema = v.object({
  searchText: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("検索キーワードを入力してください"),
    v.check((raw) => {
      const { keywords, sinceDate, untilDate } = parseSearchQuery(raw);
      return !!(keywords || sinceDate || untilDate);
    }, "検索キーワードまたは日付範囲を指定してください"),
    v.check((raw) => {
      const { sinceDate } = parseSearchQuery(raw);
      return !sinceDate || isValidDate(sinceDate);
    }, (issue) => {
      const { sinceDate } = parseSearchQuery(issue.input);
      return `since: の日付形式が不正です: ${sinceDate}`;
    }),
    v.check((raw) => {
      const { untilDate } = parseSearchQuery(raw);
      return !untilDate || isValidDate(untilDate);
    }, (issue) => {
      const { untilDate } = parseSearchQuery(issue.input);
      return `until: の日付形式が不正です: ${untilDate}`;
    }),
    v.check((raw) => {
      const { sinceDate, untilDate } = parseSearchQuery(raw);
      return !(sinceDate && untilDate && new Date(sinceDate) > new Date(untilDate));
    }, "since: は until: より前の日付を指定してください"),
  ),
});

export type SearchFormData = v.InferOutput<typeof SearchFormSchema>;
