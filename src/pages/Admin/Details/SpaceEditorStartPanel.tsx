import React from "react";

import { AdminPanel } from "components/organisms/AdminVenueView/components/AdminPanel";
import { AdminShowcase } from "components/organisms/AdminVenueView/components/AdminShowcase";
import { AdminSidebar } from "components/organisms/AdminVenueView/components/AdminSidebar";

import { DetailsProps } from "./Details.types";
import DetailsForm from "./Form";
import DetailsPreview from "./Preview";

import "./SpaceEditorStartPanel.scss";

export const SpaceEditorStartPanel: React.FC<DetailsProps> = ({ venue }) => (
  <AdminPanel className="SpaceEditorStartPanel">
    <AdminSidebar>
      <DetailsForm venue={venue} />
    </AdminSidebar>

    <AdminShowcase>
      <DetailsPreview
        name={venue?.name}
        subtitle={venue?.config?.landingPageConfig.subtitle}
        description={venue?.config?.landingPageConfig.description}
        bannerImageUrl={venue?.config?.landingPageConfig.coverImageUrl}
        logoImageUrl={venue?.host?.icon}
      />
    </AdminShowcase>
  </AdminPanel>
);
