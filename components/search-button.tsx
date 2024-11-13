"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ResponseData as SearchApiResponseData } from "@/pages/api/search";
import type { ResponseData as CrawlApiResponseData } from "@/pages/api/crawl";

export default function SearchButton(props: {
  query: string;
  onSearchStart: () => void;
  onSearchEnd: (response: SearchApiResponseData) => void;
  onCrawlEnd: (response: CrawlApiResponseData) => void;
}) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  return (
    <Button
      disabled={loading}
      onClick={async () => {
        if (props.query.trim().length === 0) {
          toast({
            variant: "destructive",
            description: "検索キーワードを入力してください",
          });
          return;
        }

        setLoading(true);

        props.onSearchStart();

        const searchApiUrl = new URL("/api/search", window.location.origin);
        searchApiUrl.searchParams.append("query", props.query);
        const searchApiResponse = await fetch(searchApiUrl.toString());
        const searchApiResponseData =
          (await searchApiResponse.json()) as SearchApiResponseData;
        props.onSearchEnd(searchApiResponseData);

        const crawlApiUrl = new URL("/api/crawl", window.location.origin);
        crawlApiUrl.searchParams.append("query", props.query);
        searchApiResponseData.result.data.items?.map((v) => {
          crawlApiUrl.searchParams.append("urls", v.link + "");
        });
        const crawlApiResponse = await fetch(crawlApiUrl.toString(), {
          cache: "no-store",
        });
        const crawlApiResponseData =
          (await crawlApiResponse.json()) as CrawlApiResponseData;

        props.onCrawlEnd(crawlApiResponseData);

        setLoading(false);
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search />}
      検索
    </Button>
  );
}
