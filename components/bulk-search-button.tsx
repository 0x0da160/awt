"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ResponseData as SearchApiResponseData } from "@/pages/api/search";
import type { ResponseData as CrawlApiResponseData } from "@/pages/api/crawl";

export default function BulkSearchButton(props: {
  query: string;
  onSearchStart: (count: number) => void;
  onSearchEnd: (
    response: SearchApiResponseData,
    progress: number,
    index: number,
    count: number,
  ) => void;
  onCrawlEnd: (
    response: CrawlApiResponseData,
    progress: number,
    index: number,
    count: number,
  ) => void;
  onProcessEnd: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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

          setOpen(true);
        }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search />}
        一括検索
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>一括検索を実行しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            各キーワードごとに検索結果とスクレイピング結果を自動的にダウンロードします。
            Custom Search JSON API の使用制限が適用される可能性があります。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setOpen(false);

              setLoading(true);

              const queries = props.query
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line !== "");

              props.onSearchStart(queries.length);

              for (const [index, query] of queries.entries()) {
                const searchApiUrl = new URL(
                  "/api/search",
                  window.location.origin,
                );
                searchApiUrl.searchParams.append("query", query);
                const searchApiResponse = await fetch(searchApiUrl.toString());
                const searchApiResponseData =
                  (await searchApiResponse.json()) as SearchApiResponseData;
                props.onSearchEnd(
                  searchApiResponseData,
                  ((index + 0.5) / queries.length) * 100,
                  index,
                  queries.length,
                );

                const crawlApiUrl = new URL(
                  "/api/crawl",
                  window.location.origin,
                );
                crawlApiUrl.searchParams.append("query", query);
                searchApiResponseData.result.data.items?.map((v) => {
                  crawlApiUrl.searchParams.append("urls", v.link + "");
                });
                const crawlApiResponse = await fetch(crawlApiUrl.toString(), {
                  cache: "no-store",
                });
                const crawlApiResponseData =
                  (await crawlApiResponse.json()) as CrawlApiResponseData;
                props.onCrawlEnd(
                  crawlApiResponseData,
                  ((index + 1) / queries.length) * 100,
                  index,
                  queries.length,
                );
              }

              setLoading(false);
            }}
          >
            実行
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
