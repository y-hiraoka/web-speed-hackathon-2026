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
    }, "since: の日付形式が不正です"),
    v.check((raw) => {
      const { untilDate } = parseSearchQuery(raw);
      return !untilDate || isValidDate(untilDate);
    }, "until: の日付形式が不正です"),
    v.check((raw) => {
      const { sinceDate, untilDate } = parseSearchQuery(raw);
      return !(sinceDate && untilDate && new Date(sinceDate) > new Date(untilDate));
    }, "since: は until: より前の日付を指定してください"),
  ),
});

export type SearchFormData = v.InferOutput<typeof SearchFormSchema>;
