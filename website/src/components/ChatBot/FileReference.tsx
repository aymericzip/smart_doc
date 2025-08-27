import { Link } from "@components/Link/Link";
import { Tag } from "@components/Tag";
import { File } from "lucide-react";
import { IntlayerNode, useIntlayer } from "next-intlayer";
import type { FC } from "react";

const FileReferenceTag: FC<{
  fileTitle: IntlayerNode | string;
  fileUrl: string;
}> = ({ fileTitle, fileUrl }) => (
  <Tag size="sm">
    <Link
      label="See the documentation"
      className="flex flex-row flex-nowrap items-center gap-2 text-nowrap"
      href={fileUrl}
      color="text"
      target="_blank"
    >
      <File className="size-3" />
      {fileTitle}
    </Link>
  </Tag>
);

export const FileReference: FC<{
  relatedFiles: string[];
}> = ({ relatedFiles }) => {
  const { relatedFilesLabel } = useIntlayer("chat-form-related-files");
  const docData = useIntlayer("doc-metadata");

  const uniqFiles = [...new Set(relatedFiles)];

  if (relatedFiles.length === 0) return <></>;

  return (
    <div className="pl-4">
      <span className="text-neutral text-sm">{relatedFilesLabel}</span>
      <div className="flex min-w-full flex-row gap-2 overflow-x-auto pb-1">
        {uniqFiles.map((fileKey) => {
          const fileData = docData?.find(
            (docEl) => docEl.docKey.value === fileKey
          );

          if (!fileData) return <></>;

          return (
            <FileReferenceTag
              key={fileKey}
              fileTitle={fileData.title}
              fileUrl={fileData.url.value}
            />
          );
        })}
      </div>
    </div>
  );
};
