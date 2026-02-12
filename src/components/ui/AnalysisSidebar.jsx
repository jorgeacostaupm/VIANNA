import React from "react";
import { Popover } from "antd";
import { HomeOutlined, PartitionOutlined } from "@ant-design/icons";

import LinkButton from "./ButtonLink";
import styles from "@/styles/App.module.css";

export default function AnalysisSidebar({ description = null, children }) {
  const logoSrc = "./app_name.svg";
  const logo = (
    <img
      src={logoSrc}
      alt="VIANNA"
      className={`${styles.appBarLogo} ${styles.analysisSidebarLogo}`}
    />
  );

  return (
    <aside className={styles.analysisSidebar}>
      <div className={styles.analysisSidebarHeader}>
        {description ? (
          <Popover
            content={
              <div className={styles.appBarPopoverContent}>{description}</div>
            }
            trigger="hover"
            placement="rightTop"
          >
            {logo}
          </Popover>
        ) : (
          logo
        )}

        <div className={styles.analysisSidebarQuickLinks}>
          <LinkButton to="overview" icon={<HomeOutlined />} />
          <LinkButton to="metadata" icon={<PartitionOutlined />} />
        </div>
      </div>

      <div className={styles.analysisSidebarContent}>{children}</div>
    </aside>
  );
}
