import React from "react";
import AppSidebar from "@/components/ui/AppSidebar";
import { APP_DESC } from "@/utils/Constants";
import AppsButtons from "./AppsButtons";

export default function MainSidebar({
  description = APP_DESC,
  children,
  ...sidebarProps
}) {
  return (
    <AppSidebar description={description} {...sidebarProps}>
      {children || <AppsButtons />}
    </AppSidebar>
  );
}
