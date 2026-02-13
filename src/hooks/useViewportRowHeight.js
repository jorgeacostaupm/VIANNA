import { useEffect, useState } from "react";

export default function useViewportRowHeight(containerPadding = 10) {
  const [rowHeight, setRowHeight] = useState(() =>
    typeof window === "undefined"
      ? 900
      : window.innerHeight - 2 * containerPadding,
  );

  useEffect(() => {
    const updateRowHeight = () => {
      setRowHeight(window.innerHeight - 2 * containerPadding);
    };

    updateRowHeight();
    window.addEventListener("resize", updateRowHeight);
    return () => window.removeEventListener("resize", updateRowHeight);
  }, [containerPadding]);

  return rowHeight;
}
