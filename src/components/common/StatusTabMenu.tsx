import React from "react";
import { TabMenu } from "primereact/tabmenu";
import type { MenuItem } from "primereact/menuitem";

export type StatusTabItem = MenuItem & {
  value: string;
};

type Props = {
  items: StatusTabItem[];
  activeIndex: number;
  onChange: (index: number, value: string) => void;
};

const StatusTabMenu: React.FC<Props> = ({
  items,
  activeIndex,
  onChange,
}) => {
  return (
    <div className="card pl-5 pr-5 max-w-8xl mx-auto">
      <TabMenu
        model={items}
        activeIndex={activeIndex}
        onTabChange={(e) => {
          const index = e.index;
          onChange(index, items[index].value);
        }}
      />
    </div>
  );
};

export default StatusTabMenu;