import React from "react";

import { AnyVenue } from "types/venues";

import { WithId } from "utils/id";

import { AdminPanel } from "components/organisms/AdminVenueView/components/AdminPanel";
import { AdminShowcase } from "components/organisms/AdminVenueView/components/AdminShowcase";
import { AdminSidebar } from "components/organisms/AdminVenueView/components/AdminSidebar";
import { SpaceTimingForm } from "components/organisms/SpaceTimingForm";

import { AdminSidebarSectionTitle } from "../AdminSidebarSectionTitle";
import { EventsView } from "../EventsView";

import "./SpaceTimingPanel.scss";

export interface SpaceTimingPanelProps {
  venue: WithId<AnyVenue>;
}

export const SpaceTimingPanel: React.FC<SpaceTimingPanelProps> = ({
  venue,
}) => (
  <AdminPanel variant="bound" className="SpaceTimingPanel">
    <AdminSidebar>
      <AdminSidebarSectionTitle>Plan your event</AdminSidebarSectionTitle>
      <SpaceTimingForm venue={venue} />
    </AdminSidebar>
    <AdminShowcase>
      <EventsView venueId={venue.id} venue={venue} />
    </AdminShowcase>
  </AdminPanel>
);
