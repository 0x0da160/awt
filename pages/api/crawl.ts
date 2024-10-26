import type { NextApiRequest, NextApiResponse } from "next";
import { CheerioCrawler, Configuration } from "crawlee";

type HeadingStructure = {
  title: string;
  url: string;
  headings: Heading[];
};
type Heading = {
  level: string;
  text: string;
};

export type ResponseData = {
  result: HeadingStructure[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const { urls } = req.query as { urls: string[] };
  const result = <HeadingStructure[]>[];
  const config = new Configuration({
    purgeOnStart: true,
  });

  const crawler = new CheerioCrawler(
    {
      requestHandlerTimeoutSecs: 10,

      async requestHandler({ $, request }) {
        const title = $("title").text();

        const htmlHeadings = $("h1, h2, h3");
        const headings = <Heading[]>[];
        htmlHeadings.each((index, element) => {
          const text = $(element).text().trim();
          if (text.length > 0) {
            headings.push({
              level: $(element).prop("tagName").toLowerCase(),
              text: $(element).text().trim(),
            });
          }
        });

        if (htmlHeadings.length > 0) {
          result.push({
            title,
            url: request.url,
            headings,
          });
        }
      },
    },
    config,
  );

  await crawler.run(urls);

  res.status(200).json({ result });
}
