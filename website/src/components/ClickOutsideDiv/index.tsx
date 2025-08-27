'use client';

import {
  type FC,
  type HTMLAttributes,
  type PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

export type ClickOutsideDivProps = PropsWithChildren<{
  onClickOutSide: () => void; // note: changed return type to `void`
}> &
  HTMLAttributes<HTMLDivElement>;

export const ClickOutsideDiv: FC<ClickOutsideDivProps> = ({
  children,
  onClickOutSide,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // If clicking outside of the referenced element, call onClickOutSide
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        onClickOutSide();
      }
    };

    // Attach the event listener
    document.addEventListener('mousedown', handleClick, { passive: true });

    // Clean up on unmount
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClickOutSide]);

  return (
    <div ref={divRef} {...props}>
      {children}
    </div>
  );
};
