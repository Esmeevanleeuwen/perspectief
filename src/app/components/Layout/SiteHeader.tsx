import { Suspense } from "react";
import AccountNavLink from "./AccountNavLink";
import SiteHeaderNav from "./SiteHeaderNav";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.shell}>
      <SiteHeaderNav
        account={
          <Suspense
            fallback={
              <span className={styles.accountLoading} role="status">
                Account laden…
              </span>
            }
          >
            <AccountNavLink />
          </Suspense>
        }
        mobileAccount={
          <Suspense
            fallback={
              <span className={styles.accountLoading} role="status">
                Account laden…
              </span>
            }
          >
            <AccountNavLink variant="mobile" />
          </Suspense>
        }
      />
    </header>
  );
}
