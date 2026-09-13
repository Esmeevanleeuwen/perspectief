import type { ReactNode } from "react";
import "./workspace.css";

/** Only layout slots: data, editor behaviour and navigation stay in their components. */
export default function WorkspaceLayout({
  mode,
  navigation,
  toolbar,
  tabs,
  list,
  document,
  reference,
  footer,
}: {
  mode: string;
  navigation: ReactNode;
  toolbar: ReactNode;
  tabs: ReactNode;
  list: ReactNode;
  document: ReactNode;
  reference?: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="writing-workspace" data-mode={mode}>
      {toolbar}
      <div className="writing-body">
        <aside
          className="writing-navigation"
          aria-label="Collecties en sessies"
        >
          {navigation}
        </aside>
        <div className="writing-stage">
          {tabs}
          <div className="writing-panes">
            <section className="writing-list" aria-label="Verzamelde stukken">
              {list}
            </section>
            <section className="writing-document" aria-label="Schrijfvlak">
              {document}
            </section>
            {reference && (
              <aside className="writing-reference" aria-label="Stuk ernaast">
                {reference}
              </aside>
            )}
          </div>
        </div>
      </div>
      <footer className="writing-footer">{footer}</footer>
    </div>
  );
}
