import { useFirestore, useFirestoreCollectionData } from "reactfire";

import { COLLECTION_WORLD_EVENTS } from "settings";

import { WorldEvent } from "types/venues";

import { withIdConverter } from "utils/converters";

export interface VenueEventsProps {
  worldId?: string;
  spaceIds: string[];
}

export interface VenueEventsData {
  isLoaded: boolean;
  events: WorldEvent[];
}

export const useWorldEvents = (worldId?: string): VenueEventsData => {
  const firestore = useFirestore();

  const eventsRef = firestore
    .collection(COLLECTION_WORLD_EVENTS)
    .where("worldId", "==", worldId || "")
    .withConverter(withIdConverter<WorldEvent>());

  const { data: events, status } = useFirestoreCollectionData<WorldEvent>(
    eventsRef
  );

  if (!worldId) {
    return {
      isLoaded: true,
      events: [],
    };
  }

  return {
    isLoaded: status !== "loading",
    events: events,
  };
};

export const useSpaceEvents = ({
  worldId,
  spaceIds,
}: VenueEventsProps): VenueEventsData => {
  const { isLoaded, events } = useWorldEvents(worldId);

  if (!spaceIds) {
    return {
      isLoaded: true,
      events: [],
    };
  }

  // Filter in code as firebase only supports a maximum of 10 items in an array
  // query.
  const spaceEvents = (events || []).filter((event) =>
    spaceIds.includes(event.spaceId)
  );
  spaceEvents.sort((a, b) => a.startUtcSeconds - b.startUtcSeconds);

  return {
    isLoaded,
    events: spaceEvents,
  };
};
