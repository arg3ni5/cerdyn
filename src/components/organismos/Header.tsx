import { ReactNode } from "react";
import { ContentHeader, DataUser } from "../../index";

// Definir el tipo de props para Header
interface StateConfig {
  state: boolean;
  setState: () => void;
}

interface HeaderProps {
  stateConfig: StateConfig;
  title?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export const Header = ({ stateConfig, title, eyebrow, actions }: HeaderProps) => {
  return (
    <ContentHeader>
      <div className="header-main">
        {(eyebrow || title) && (
          <div className="page-heading">
            {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
            {title && <h1 className="page-title">{title}</h1>}
          </div>
        )}
        {actions && <div className="header-actions">{actions}</div>}
      </div>
      <DataUser stateConfig={stateConfig} />
    </ContentHeader>
  );
}
