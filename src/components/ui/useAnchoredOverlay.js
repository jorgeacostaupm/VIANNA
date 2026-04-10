import { useCallback, useEffect, useRef, useState } from "react";
import { getViewOverlayPosition } from "./popupPosition";

export default function useAnchoredOverlay({ disabled = false } = {}) {
  const [open, setOpen] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState(undefined);
  const [isFixedOverlay, setIsFixedOverlay] = useState(false);
  const triggerRef = useRef(null);

  const updateOverlayPosition = useCallback(() => {
    const position = getViewOverlayPosition(triggerRef.current);
    setOverlayStyle(position || undefined);
    setIsFixedOverlay(Boolean(position));
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen) => {
      if (nextOpen) {
        updateOverlayPosition();
      }
      setOpen(nextOpen);
    },
    [updateOverlayPosition],
  );

  useEffect(() => {
    if (!open || !isFixedOverlay) return undefined;

    const onUpdate = () => updateOverlayPosition();
    window.addEventListener("resize", onUpdate);
    window.addEventListener("scroll", onUpdate, true);

    return () => {
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("scroll", onUpdate, true);
    };
  }, [open, isFixedOverlay, updateOverlayPosition]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  return {
    open,
    setOpen,
    overlayStyle,
    isFixedOverlay,
    triggerRef,
    updateOverlayPosition,
    handleOpenChange,
  };
}
