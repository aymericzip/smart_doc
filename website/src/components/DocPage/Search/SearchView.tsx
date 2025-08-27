"use client";

import { Breadcrumb, type BreadcrumbLink } from "@components/Breadcrumb";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { Loader } from "@components/Loader";
// import { useSearchDoc } from "@hooks/useSearchDoc";
import type { DocMetadata } from "@smart-doc/docs";
import Fuse, { type IFuseOptions } from "fuse.js";
import { getIntlayer } from "intlayer";
import { ArrowRight, Search } from "lucide-react";
import { useIntlayer, useLocale } from "next-intlayer";
import { useRouter, useSearchParams } from "next/navigation";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

// Convert the documentation into an array of objects for Fuse.js
// Fuse.js options
const fuseOptions: IFuseOptions<DocMetadata> = {
  keys: [
    { name: "title", weight: 0.8 },
    { name: "description", weight: 0.1 },
    { name: "keywords", weight: 0.1 },
  ],
  threshold: 0.02, // Defines how fuzzy the matching should be (lower is more strict)
};

// Debounce function
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number,
  onAbort: () => void
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      onAbort();
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

type SearchDocMetadata = DocMetadata & {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
};

const SearchResultItem: FC<{
  doc: SearchDocMetadata;
  onClickLink: () => void;
}> = ({ doc, onClickLink }) => {
  const router = useRouter();
  const { searchResultItemButton } = useIntlayer("doc-search-view");

  const breadcrumbLinks: BreadcrumbLink[] = (doc.slugs ?? []).map(
    (path: string) => {
      return { text: path };
    }
  );

  return (
    <Button
      label={searchResultItemButton.label.value}
      variant="hoverable"
      color="text"
      id={doc.relativeUrl}
      onClick={() => {
        router.push(doc.relativeUrl);
        onClickLink();
      }}
      className="w-full max-w-full"
    >
      <div className="flex items-center justify-between gap-2 text-wrap p-3">
        <div className="flex flex-1 flex-col gap-2 text-left">
          <strong className="text-base">{doc.title}</strong>
          <p className="text-neutral text-sm">{doc.description}</p>
          <Breadcrumb links={breadcrumbLinks} className="text-xs opacity-30" />
        </div>
        <ArrowRight size={24} />
      </div>
    </Button>
  );
};

export const SearchView: FC<{
  onClickLink?: () => void;
  isOpen?: boolean;
}> = ({ onClickLink = () => {}, isOpen = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchQuery = useSearchParams().get("search");

  const [results, setResults] = useState<SearchDocMetadata[]>([]);

  // Build a quick lookup map from docKey to metadata
  const { locale } = useLocale();
  const docMetadata = getIntlayer(
    "doc-metadata",
    locale
  ) as SearchDocMetadata[];
  const docByKey = useMemo(() => {
    const map = new Map<string, SearchDocMetadata>();
    for (const doc of docMetadata) {
      map.set(doc.docKey, doc);
    }
    return map;
  }, [docMetadata]);

  // React Query mutation to call backend search
  const abortControllerRef = useRef<AbortController | null>(null);
  const { mutateAsync: searchDoc, isPending: isLoading } = useMutation({
    mutationFn: async (input: string) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Search request failed");
      const data = (await res.json()) as string[];
      return data;
    },
  });
  const abortSearch = () => abortControllerRef.current?.abort();

  const { noContentText, searchInput } = useIntlayer("doc-search-view");

  // Create a new Fuse instance with the options and documentation data
  const fuse = new Fuse(docMetadata, fuseOptions);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery) {
      let backendResults: SearchDocMetadata[] = [];
      // Prioritize backend search for longer queries, but always include Fuse results
      if (searchQuery.length > 2) {
        // Adjusted threshold for calling backend search
        const backendDocKeys = await searchDoc(searchQuery);
        backendResults = backendDocKeys
          .map((docKey: string) => docByKey.get(docKey))
          .filter((doc): doc is SearchDocMetadata => Boolean(doc));
      }

      // Perform client-side Fuse search
      const fuseSearchResults = fuse
        .search(searchQuery)
        .map((result) => result.item);

      // Merge results: backend results first, then Fuse results, avoiding duplicates
      const combinedResults = [...backendResults];
      const backendResultUrls = new Set(
        backendResults.map((doc) => doc.docKey)
      );

      fuseSearchResults.forEach((fuseDoc) => {
        if (!backendResultUrls.has(fuseDoc.docKey)) {
          combinedResults.push(fuseDoc);
        }
      });

      setResults(combinedResults);
    } else {
      setResults([]);
    }
  };

  const debouncedSearch = debounce(handleSearch, 200, abortSearch);

  useEffect(() => {
    if (!searchQuery) return;
    // Call the original handleSearch directly for the initial search query from URL
    handleSearch(searchQuery);
  }, [searchQuery]); // Removed handleSearch from dependencies as it's stable now

  useEffect(() => {
    if (isOpen) {
      timeoutRef.current = setTimeout(() => inputRef.current?.focus(), 10);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  const isNoResult =
    !isLoading &&
    results.length === 0 &&
    inputRef.current &&
    inputRef.current?.value !== "";

  return (
    <div className="relative w-full p-4">
      <div className="flex items-center gap-1">
        <Search />
        <Input
          type="search"
          placeholder={searchInput.placeholder.value}
          aria-label={searchInput.label.value}
          onChange={(e) => debouncedSearch(e.target.value)}
          defaultValue={searchQuery ?? ""}
          className="m-3"
          ref={inputRef}
        />
      </div>
      <div className="mt-4">
        {isNoResult && (
          <p className="text-center text-neutral text-sm">{noContentText}</p>
        )}

        {results.length > 0 && (
          <ul className="flex flex-col gap-10">
            {results.map((result) => (
              <li key={result.relativeUrl}>
                <SearchResultItem doc={result} onClickLink={onClickLink} />
              </li>
            ))}
          </ul>
        )}
        <Loader isLoading={isLoading} />
      </div>
    </div>
  );
};
