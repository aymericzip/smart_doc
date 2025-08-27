import type { FC, HTMLAttributes, JSX, MouseEvent } from "react";
import { cn } from "@utils/cn";

const styledHeading = `relative scroll-mb-8 scroll-mt-[30vh] scroll-p-8`;
const styledAfter = `after:content-['#'] after:scale-75 after:px-6 after:text-neutral after:absolute after:top-0 after:h-full after:-left-12 after:hover:cursor-pointer after:absolute after:to-neutral after:md:opacity-0 after:transition-opacity hover:after:opacity-80 after:duration-200 after:delay-100`;

const StyledH1: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => <h1 className={cn("mt-5 text-2xl font-bold", className)} {...props} />;

const StyledH2: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2
    className={cn("mt-16 mb-2 text-2xl font-bold", styledHeading, className)}
    {...props}
  />
);

const StyledH3: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={cn("mt-5 mb-2 text-xl font-bold", styledHeading, className)}
    {...props}
  />
);

const StyledH4: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h4
    className={cn("mt-3 text-lg font-bold", styledHeading, className)}
    {...props}
  />
);

const StyledH5: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h5
    className={cn("mt-3 text-base font-bold", styledHeading, className)}
    {...props}
  />
);

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  isClickable?: boolean;
};
type HeadingGlobalProps = HeadingProps & {
  H: FC<HTMLAttributes<HTMLHeadingElement>>;
};
type HeadingType = (props: HeadingGlobalProps) => JSX.Element;

const getId = (children: string) =>
  String(children)
    // replace accents
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // replace spaces
    .replace(/\s+/g, "-")
    .toLowerCase();

const scrollToHash = (id: string) => {
  const element = document.getElementById(id);
  const offset = 150;
  const y =
    (element?.getBoundingClientRect()?.top ?? 0) + window.scrollY - offset;

  window.scrollTo({ top: y, behavior: "smooth" });
};

const afterClick = (parentElem: Element, e: MouseEvent<HTMLHeadingElement>) => {
  const parentLeft = parentElem.getBoundingClientRect().left,
    parentTop = parentElem.getBoundingClientRect().top;

  const after = window.getComputedStyle(parentElem, ":after");

  const afterStart = parentLeft + parseInt(after.getPropertyValue("left"), 10),
    afterEnd = afterStart + parseInt(after.width, 10);

  const afterYStart = parentTop + parseInt(after.getPropertyValue("top"), 10),
    afterYEnd = afterYStart + parseInt(after.height, 10);

  const mouseX = e.clientX,
    mouseY = e.clientY;

  const isAfterClicked: boolean =
    mouseX >= afterStart &&
    mouseX <= afterEnd &&
    mouseY >= afterYStart &&
    mouseY <= afterYEnd;

  return isAfterClicked;
};

const HeadingWrapper: HeadingType = ({
  H,
  children,
  className,
  isClickable,
  ...props
}) => {
  const id = typeof children === "string" ? getId(children) : undefined;

  const onClick = (e: MouseEvent<HTMLHeadingElement>) => {
    const { id } = e.currentTarget;

    const isAfterClicker = afterClick(e.currentTarget, e);

    if (isAfterClicker && typeof id === "string") {
      const urlWithoutHash = window.location.href.split("#")[0];
      const url = `${urlWithoutHash}#${id}`;

      // copy the url to the clipboard
      navigator.clipboard.writeText(url);

      scrollToHash(id);
    }
  };

  return (
    <H
      id={id}
      onClick={isClickable ? onClick : undefined}
      aria-label={
        isClickable
          ? `Click to scroll to section ${id} and copy the link to the clipboard`
          : undefined
      }
      className={cn(isClickable && styledAfter, className)}
      {...props}
    >
      {children}
    </H>
  );
};

export const H1: FC<HeadingProps> = ({ isClickable: _, ...props }) => (
  <StyledH1 {...props} />
);

export const H2: FC<HeadingProps> = ({ isClickable = false, ...props }) => (
  <HeadingWrapper H={StyledH2} isClickable={isClickable} {...props} />
);
export const H3: FC<HeadingProps> = ({ isClickable = false, ...props }) => (
  <HeadingWrapper H={StyledH3} isClickable={isClickable} {...props} />
);
export const H4: FC<HeadingProps> = ({ isClickable = false, ...props }) => (
  <HeadingWrapper H={StyledH4} isClickable={isClickable} {...props} />
);
export const H5: FC<HeadingProps> = ({ isClickable = false, ...props }) => (
  <HeadingWrapper H={StyledH5} isClickable={isClickable} {...props} />
);
