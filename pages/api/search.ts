import { customsearch_v1 } from "@googleapis/customsearch";
import filenamify from "filenamify";

import type { NextApiRequest, NextApiResponse } from "next";
import type { GaxiosResponse } from "gaxios";

export type ResponseData = {
  query: string;
  result: GaxiosResponse<customsearch_v1.Schema$Search>;
  filename: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const { query } = req.query as { query: string };

  const customsearch = new customsearch_v1.Customsearch({
    auth: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
  });
  // INFO: https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list?hl=ja#request
  const result = await customsearch.cse.list({
    c2coff: "1",
    cr: "countryJP",
    cx: process.env.GOOGLE_CUSTOM_SEARCH_API_CX,
    gl: "jp",
    hl: "ja",
    lr: "lang_ja",
    num: 10,
    q: query,
  });

  const filename = filenamify(`awt_${query}_search_result.csv`);

  res.status(200).json({ query, result, filename });
}
