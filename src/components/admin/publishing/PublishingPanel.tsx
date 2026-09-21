"use client";

import type { ComponentProps } from "react";
import AdvancedPublishingPanel from "./AdvancedPublishingPanel";
import QuickPublish from "./QuickPublish";

/** Keep the full editorial workspace; everyday publishing has its own direct entry. */
export default function PublishingPanel(props: ComponentProps<typeof AdvancedPublishingPanel> & { refreshRevisionOnOpen?: boolean }) {
  return <>
    <AdvancedPublishingPanel {...props} />
    <QuickPublish key={props.id} id={props.id} revision={props.revision} dirty={props.dirty} refreshRevisionOnOpen={props.refreshRevisionOnOpen} onReload={props.onReload} />
  </>;
}
