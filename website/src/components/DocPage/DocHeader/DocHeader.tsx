import { Container } from "@components/Container";
import { DocMetadata } from "@smart-doc/docs";
import { Locales } from "intlayer";
import { useIntlayer } from "next-intlayer/server";
import { FC } from "react";
import { ApplicationTemplateMessage } from "../ApplicationTemplateMessage";
import { ContributionMessage } from "../ContributionMessage";
import { CopyMarkdownMessage } from "../CopyMarkdownMessage";
import { SummarizeAI } from "../SummarizeAI/SummarizeAI";
import { TranslatedContentMessage } from "../TranslatedContentMessage";

type DocHeaderProps = DocMetadata & {
  locale: Locales;
  markdownContent: string;
};

export const DocHeader: FC<DocHeaderProps> = ({
  author,
  updatedAt,
  createdAt,
  url,
  relativeUrl,
  markdownContent,
  githubUrl,
  locale,
  youtubeVideo,
  applicationTemplate,
}) => {
  const { authorLabel, creationLabel, lastUpdateLabel } =
    useIntlayer("doc-header");

  return (
    <>
      <header className=" mt-5 z-10 flex flex-col gap-2 px-4 py-2 max-w-[95%] mx-auto text-xs">
        {author && (
          <span className="block">
            {authorLabel}: <span className="text-neutral ml-2">{author}</span>
          </span>
        )}
        <div className="flex flex-row gap-4 justify-between w-full py-2">
          {createdAt && (
            <span className="block">
              {creationLabel}:
              <span className="text-neutral ml-2">{createdAt}</span>
            </span>
          )}
          {updatedAt && (
            <span className="block">
              {lastUpdateLabel}:
              <span className="text-neutral ml-2">{updatedAt}</span>
            </span>
          )}
        </div>
      </header>
      <Container className="sticky top-20 mt-5 z-5 flex flex-col gap-2 px-4 py-2 max-w-[95%] mx-auto">
        <div className="flex flex-row gap-4 w-full justify-between">
          <div className="flex flex-row gap-4 w-full justify-start items-center">
            {applicationTemplate && (
              <ApplicationTemplateMessage
                applicationTemplateUrl={applicationTemplate.replace(
                  "github.com",
                  "github.dev"
                )}
              />
            )}

            <SummarizeAI url={url} />
          </div>
          <div className="flex flex-row gap-4 w-full justify-end items-center">
            <TranslatedContentMessage pageUrl={relativeUrl} />

            <ContributionMessage
              githubUrl={githubUrl.replace("/en/", `/${locale}/`)}
            />

            <CopyMarkdownMessage markdownContent={markdownContent} />
          </div>
        </div>
      </Container>
    </>
  );
};
