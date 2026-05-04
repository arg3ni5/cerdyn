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
}

export const Header = ({ stateConfig, title, eyebrow }: HeaderProps) => {
  return (
    <ContentHeader>
      {(eyebrow || title) && (
        <div className="page-heading">
          {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
          {title && <h1 className="page-title">{title}</h1>}
        </div>
      )}
      <DataUser stateConfig={stateConfig} />
    </ContentHeader>
  );
}
