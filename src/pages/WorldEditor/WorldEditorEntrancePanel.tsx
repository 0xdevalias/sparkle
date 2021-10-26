import React from "react";

import { useWorldEdit } from "hooks/useWorldEdit";

import { AdminPanel } from "components/organisms/AdminVenueView/components/AdminPanel";
import { AdminShowcase } from "components/organisms/AdminVenueView/components/AdminShowcase";
import { AdminSidebar } from "components/organisms/AdminVenueView/components/AdminSidebar";
import { AdminSidebarFooter } from "components/organisms/AdminVenueView/components/AdminSidebarFooter";
import { AdminSidebarTitle } from "components/organisms/AdminVenueView/components/AdminSidebarTitle";
import { WorldEntranceForm } from "components/organisms/WorldEntranceForm";

import { Loading } from "components/molecules/Loading";

export interface WorldEditorEntrancePanelProps {
  worldId?: string;
  onClickHome: () => void;
}

export const WorldEditorEntrancePanel: React.FC<WorldEditorEntrancePanelProps> = ({
  onClickHome,
  worldId,
}) => {
  const { isLoaded, world } = useWorldEdit(worldId);
  return (
    <AdminPanel>
      <AdminSidebar>
        <AdminSidebarTitle>Entrance Experience</AdminSidebarTitle>
        <AdminSidebarFooter onClickHome={onClickHome} />
        {isLoaded ? (
          world ? (
            <WorldEntranceForm world={world} onClickCancel={onClickHome} />
          ) : (
            // TODO: Display not found component
            "World Not Found"
          )
        ) : (
          <Loading />
        )}
      </AdminSidebar>
      <AdminShowcase></AdminShowcase>
    </AdminPanel>
  );
};