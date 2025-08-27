"use client";

import { type FC } from "react";
import { useIntlayer } from "next-intlayer";
import { CopyButton } from "../CopyButton";
import { Popover, PopoverXAlign } from "../Popover";

type CopyCodeProps = {
  code: string;
};

export const CopyCode: FC<CopyCodeProps> = ({ code }) => {
  const { title, description } = useIntlayer("code");

  return (
    <Popover identifier="copy">
      <CopyButton content={code} />

      <Popover.Detail
        identifier="copy"
        className="flex flex-col gap-3 p-3 min-w-64 text-sm"
        xAlign={PopoverXAlign.END}
      >
        <strong>{title}</strong>
        <p className="text-neutral">{description}</p>
      </Popover.Detail>
    </Popover>
  );
};
