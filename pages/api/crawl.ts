import type { NextApiRequest, NextApiResponse } from "next";
import { CheerioCrawler, Configuration } from "crawlee";
import filenamify from "filenamify";

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
  query: string;
  result: HeadingStructure[];
  filename: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const { urls, query } = req.query as { urls: string[]; query: string };
  const result = <HeadingStructure[]>[];
  const config = new Configuration({
    purgeOnStart: true,
  });

  const crawler = new CheerioCrawler(
    {
      requestHandlerTimeoutSecs: 3,
      retryOnBlocked: false,
      maxRequestRetries: 1,

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

  const filename = filenamify(`awt_${query}_crawl_result.csv`);

  res.status(200).json({
    query,
    result,
    filename,
  });
}
