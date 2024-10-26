import { customsearch_v1 } from "@googleapis/customsearch";

import type { NextApiRequest, NextApiResponse } from "next";
import type { GaxiosResponse } from "gaxios";

export type ResponseData = {
  query: string;
  result: GaxiosResponse<customsearch_v1.Schema$Search>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const { q } = req.query as { q: string };

  const customsearch = new customsearch_v1.Customsearch({
    auth: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
  });
  // INFO: https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list?hl=ja#request
  const result = await customsearch.cse.list({
    c2coff: "1",
    cr: "countryJP",
    cx: "85f6e6689264d4377",
    gl: "jp",
    hl: "ja",
    lr: "lang_ja",
    num: 10,
    q,
  });

  res.status(200).json({ query: q, result });
}
