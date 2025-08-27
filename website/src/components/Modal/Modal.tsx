"use client";

import { cva } from "class-variance-authority";
import { motion as m } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, type FC } from "react";
import { createPortal } from "react-dom";
import { useGetElementOrWindow, useScrollBlockage } from "../../hooks/index";
import { cn } from "../../utils/cn";
import { Button, ButtonColor, ButtonSize, ButtonVariant } from "../Button";
import { Container, type ContainerProps } from "../Container";
import { H3 } from "../Headers";

export enum ModalSize {
  SM = "sm",
  MD = "md",
  LG = "lg",
  XL = "xl",
  UNSET = "unset",
}

type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  container?: HTMLElement;
  disableScroll?: boolean;
  hasCloseButton?: boolean;
  title?: string;
  size?: ModalSize | `${ModalSize}`;
} & Pick<
  ContainerProps,
  | "className"
  | "transparency"
  | "border"
  | "background"
  | "roundedSize"
  | "borderColor"
  | "padding"
  | "separator"
  | "gap"
>;

const modalVariants = cva(
  "cursor-default overflow-auto py-3 shadow-sm justify-center",
  {
    variants: {
      size: {
        sm: "h-auto max-h-[30vh] w-[95vw] max-w-xl",
        md: "h-auto max-h-[50vh] w-[95vw] max-w-xl",
        lg: "h-auto max-h-[70vh] w-[95vw] max-w-2xl",
        xl: "h-auto max-h-[95vh] w-[95vw] max-w-6xl",
        unset: "h-auto max-h-[95vh] w-[95vw]",
      },
    },
    defaultVariants: {
      size: "unset",
    },
  }
);

const MotionModal = m.create(Container);

// Get a valid DOM element for the portal
const getValidContainer = (
  container?: HTMLElement | null,
  containerElement?: HTMLElement | null
) => {
  // If a specific container is provided and it's a valid DOM element, use it
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    return container;
  }

  // If the hook returned a valid DOM element, use it
  if (containerElement && containerElement.nodeType === Node.ELEMENT_NODE) {
    return containerElement;
  }

  // Fallback to document.body if available
  if (typeof window !== "undefined" && document?.body) {
    return document.body;
  }

  return null;
};

/**
 * Usage example:
 * ```jsx
 * <Modal isOpen={isOpen} onClose={onClose}>
 *   Modal content
 * </Modal>
 * ```
 */
export const Modal: FC<ModalProps> = ({
  children,
  isOpen,
  container,
  disableScroll = true,
  onClose,
  hasCloseButton = false,
  title,
  size = ModalSize.MD,
  className,
  ...props
}) => {
  const containerElement = useGetElementOrWindow(container);

  useScrollBlockage({ key: "modal", disableScroll: isOpen && disableScroll });

  const validContainer = getValidContainer(container, containerElement);

  if (!validContainer) return <></>;

  const hasTitle = typeof title === "string";

  return createPortal(
    <m.div
      className="bg-background/40 /40 invisible fixed left-0 top-0 z-50 flex size-full cursor-pointer items-center justify-center overflow-auto backdrop-blur"
      animate={isOpen ? "visible" : "invisible"}
      variants={{
        visible: {
          opacity: 1,
          visibility: "visible",
          transition: { duration: 0.1, when: "beforeChildren" },
        },
        invisible: {
          opacity: 0,
          visibility: "hidden",
          transition: { duration: 0.1, when: "afterChildren" },
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose?.();
      }}
      aria-hidden={!isOpen}
    >
      <div className="flex justify-center p-4">
        <MotionModal
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: isOpen ? 0.5 : 1 }}
          animate={{ scale: isOpen ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
          className={modalVariants({
            size,
            className,
          })}
          role="dialog"
          aria-modal
          roundedSize="2xl"
          {...props}
        >
          <div
            className={cn(
              "cursor-default px-4",
              (hasCloseButton || hasTitle) && "flex items-center",
              hasCloseButton && hasTitle && "justify-center",
              hasCloseButton && !hasTitle && "justify-end",
              !hasCloseButton && !hasTitle && "hidden"
            )}
          >
            {hasTitle && (
              <H3 className="ml-4 flex justify-center text-lg font-bold">
                {title}
              </H3>
            )}
            {hasCloseButton && (
              <Button
                variant={ButtonVariant.HOVERABLE}
                color={ButtonColor.TEXT}
                label="Close modal"
                className="ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.();
                }}
                Icon={X}
                size={ButtonSize.ICON_MD}
              />
            )}
          </div>
          <div className="flex flex-1 flex-col items-center overflow-auto">
            {children}
          </div>
        </MotionModal>
      </div>
    </m.div>,
    validContainer
  );
};
