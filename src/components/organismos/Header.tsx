import { ContentHeader, DataUser } from "../../index";

// Definir el tipo de props para Header
interface StateConfig {
  state: boolean;
  setState: () => void;
}

interface HeaderProps {
  stateConfig: StateConfig;
}

export const Header = ({ stateConfig }: HeaderProps) => {
  return (
    <ContentHeader>
      <DataUser stateConfig={stateConfig} />
    </ContentHeader>
  );
}
