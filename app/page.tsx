"use client";
import { useState, useRef, useEffect } from "react";
import SearchButton from "../components/search-button";
import { Input } from "../components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { cn } from "@/lib/utils";

import type { ResponseData as SearchApiResponseData } from "@/pages/api/search";

import type { ResponseData as CrawlApiResponseData } from "@/pages/api/crawl";

import { stringify as csvStringify } from "csv-stringify/sync";

export default function Home() {
  const [query, setQuery] = useState("");
  const [multiline, setMultiline] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchApiResponseData>();
  const [crawlResponse, setCrawlResponse] = useState<CrawlApiResponseData>();
  const [top10Index, setTop10Index] = useState(0);
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  const [bom, setBom] = useState(true);

  const queryInputRef = useRef<HTMLInputElement>(null);
  const queryTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (multiline) {
      if (queryTextareaRef.current != null) {
        queryTextareaRef.current.focus();
        const selectionIndex = cursorIndex || 0;
        queryTextareaRef.current.selectionStart = selectionIndex;
        queryTextareaRef.current.selectionEnd = selectionIndex;
      }
    } else {
      if (queryInputRef.current) {
        queryInputRef.current?.focus();
        const selectionIndex = cursorIndex || 0;
        queryInputRef.current.selectionStart = selectionIndex;
        queryInputRef.current.selectionEnd = selectionIndex;
      }
    }
  });

  return (
    <div className="p-16">
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <div className="flex w-full items-center space-x-2 my-4">
          <div className="grow">
            {multiline ? (
              <Textarea
                ref={queryTextareaRef}
                value={query}
                className="overflow-hidden min-h-9 h-9 w-full"
                onInput={(e) => {
                  setQuery(e.currentTarget.value);
                  setCursorIndex(e.currentTarget.selectionStart);
                  setMultiline(e.currentTarget.value.includes("\n"));

                  // autosize
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "0px";
                  target.style.height = target.scrollHeight + "px";
                }}
                onFocus={(e) => {
                  // autosize
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "0px";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
            ) : (
              <Input
                ref={queryInputRef}
                value={query}
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const currentCursorIndex =
                      e.currentTarget.selectionStart ?? undefined;
                    if (Number.isInteger(currentCursorIndex)) {
                      const value = e.currentTarget.value;

                      // add new-line(\n)
                      setQuery(
                        value.slice(0, currentCursorIndex) +
                          "\n" +
                          value.slice(currentCursorIndex),
                      );

                      // add new-line(\n) code length: 1
                      const cursorIndex =
                        (e.currentTarget.selectionStart ?? 0) + 1;
                      e.currentTarget.selectionStart = cursorIndex;
                      setCursorIndex(cursorIndex);
                    }

                    setMultiline(true);
                  }
                }}
                onChange={(e) => {
                  setCursorIndex(e.currentTarget.selectionStart);
                  setQuery(e.currentTarget.value);
                  setMultiline(e.currentTarget.value.includes("\n"));
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const value = e.currentTarget.value;
                  const leftText = value.slice(
                    0,
                    e.currentTarget.selectionStart ?? 0,
                  );
                  const rightText = value.slice(
                    e.currentTarget.selectionEnd ?? 0,
                  );
                  const pasteData = e.clipboardData.getData("text/plain");
                  const pasteText = pasteData.replace(/\r\n|\r/g, "\n");
                  const text = leftText + pasteText + rightText;
                  setCursorIndex((leftText + pasteText).length);
                  setQuery(text);
                  setMultiline(text.includes("\n"));
                }}
                placeholder="検索キーワードを入力..."
              />
            )}
          </div>
          <div>
            <SearchButton
              query={query}
              onSearchStart={() => {
                setSearchResponse(undefined);
                setCrawlResponse(undefined);
              }}
              onSearchEnd={(response) => {
                setSearchResponse(response);
              }}
              onCrawlEnd={(response) => {
                setCrawlResponse(response);
              }}
            />
          </div>
        </div>

        <div className="flex flex-row gap-4">
          <div className="basis-1/2">
            {searchResponse?.result.data.items?.map((v, i) => {
              return (
                <div
                  className="mb-4 p-4 border border-gray-200 rounded-lg"
                  key={i}
                >
                  <a
                    href={v.link + ""}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div
                      className="text-xl mb-2"
                      dangerouslySetInnerHTML={{ __html: v.htmlTitle + "" }}
                    ></div>
                    <div
                      className="text-gray-800"
                      dangerouslySetInnerHTML={{ __html: v.htmlSnippet + "" }}
                    ></div>
                  </a>
                </div>
              );
            })}
          </div>
          <div className="basis-1/2">
            {crawlResponse && (
              <>
                <div className="mb-2 flex">
                  <div>
                    <Select
                      value={top10Index + ""}
                      defaultValue={top10Index + ""}
                      onValueChange={(v) => {
                        const i = parseInt(v, 10);
                        setTop10Index(i);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {crawlResponse.result.map((v, i) => {
                          return (
                            <SelectItem key={i} value={i + ""}>
                              検索結果 {i + 1} 位
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grow"></div>
                  <div className="flex">
                    <div className="flex items-center space-x-2 mr-4">
                      <Checkbox
                        id="bom"
                        checked={bom}
                        onCheckedChange={() => {
                          setBom(!bom);
                        }}
                      />
                      <label
                        htmlFor="bom"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        BOM
                      </label>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (searchResponse?.result.data?.items?.length) {
                            const data = [] as string[][];
                            searchResponse?.result.data.items?.forEach(
                              (v, i) => {
                                data.push([
                                  i + 1 + "",
                                  v.title ?? "",
                                  v.snippet ?? "",
                                  v.link ?? "",
                                ]);
                              },
                            );
                            const header = [
                              "順位",
                              "タイトル",
                              "スニペット",
                              "リンク",
                            ];
                            const csv = csvStringify([header, ...data]);
                            const blob = new Blob(
                              [bom ? "\uFEFF" + csv : csv],
                              {
                                type: "text/csv;charset=utf-8;",
                              },
                            );
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.setAttribute("href", url);
                            link.setAttribute("download", "search_result.csv");
                            link.click();
                            URL.revokeObjectURL(url);
                          } else {
                            console.error(searchResponse);
                          }
                          if (crawlResponse.result) {
                            const data = [] as string[][];
                            crawlResponse.result.forEach((v, i) => {
                              const headingsString = [] as string[];
                              v.headings.forEach((v) => {
                                headingsString.push(
                                  `<${v.level}>${v.text}</${v.level}>`,
                                );
                              });

                              data.push([
                                i + 1 + "",
                                v.title,
                                v.url,
                                headingsString.join("\n"),
                              ]);
                            });
                            const header = [
                              "順位",
                              "タイトル",
                              "URL",
                              "見出し構造",
                            ];
                            const csv = csvStringify([header, ...data]);
                            const blob = new Blob(
                              [bom ? "\uFEFF" + csv : csv],
                              {
                                type: "text/csv;charset=utf-8;",
                              },
                            );
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.setAttribute("href", url);
                            link.setAttribute("download", "crawl_result.csv");
                            link.click();
                            URL.revokeObjectURL(url);
                          } else {
                            console.error(searchResponse);
                          }
                        }}
                      >
                        <Download />
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div>
                  <a
                    href={crawlResponse.result[top10Index]?.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="break-all">
                      {crawlResponse?.result[top10Index]?.url}
                    </span>
                  </a>
                </div>
                <Separator className="my-4" />
                {crawlResponse.result[top10Index]?.headings.map((v, i) => {
                  return (
                    <div
                      key={i}
                      className={cn(
                        "my-2",
                        "flex",
                        v.level === "h2" && "ml-4",
                        v.level === "h3" && "ml-8",
                      )}
                    >
                      <div className="mr-2">
                        <Badge variant="outline">{v.level}</Badge>
                      </div>
                      <div>{v.text}</div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
