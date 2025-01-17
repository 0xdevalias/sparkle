import React, { useEffect, useMemo, useState } from "react";
import { useFirebase } from "react-redux-firebase";

import { ALWAYS_EMPTY_ARRAY } from "settings";

import { Room } from "types/rooms";
import { AnimateMapVenue, AnyVenue } from "types/venues";

import { isEventLive } from "utils/event";
import { WithId } from "utils/id";
import { getFirebaseStorageResizedImage } from "utils/image";
import { WithVenue } from "utils/venue";

import { useSpaceEvents } from "hooks/events";
import { useUser } from "hooks/useUser";

import { useFirebarrels } from "../hooks/useFirebarrels";
import { useRecentLocationsUsers } from "../hooks/useRecentLocationsUsers";
import { UseRelatedPartymapRoomsData } from "../hooks/useRelatedPartymapRooms";

import { CloudDataProvider } from "./DataProvider/CloudDataProvider";

// @debt Removed users out as a part of massive refactor of users. Beavers should implement the new architecture in this template a part of AnimateMap refactor
const EMPTY_WORLD_USERS = {
  recentWorldUsers: ALWAYS_EMPTY_ARRAY,
  isRecentWorldUsersLoaded: true,
};

export interface CloudDataProviderWrapperProps {
  venue: WithId<AnimateMapVenue>;
  newDataProviderCreate: (dataProvider: CloudDataProvider) => void;
  relatedRooms: UseRelatedPartymapRoomsData;
  reInitOnError?: boolean;
}

export type RoomWithFullData = (WithVenue<Room> | Room) & {
  id: number;
  isLive?: boolean;
  countUsers?: number;
};

const emptyRelatedVenues: WithId<AnyVenue>[] = [];

export const CloudDataProviderWrapper: React.FC<CloudDataProviderWrapperProps> = ({
  venue,
  newDataProviderCreate,
  relatedRooms,
  reInitOnError,
}) => {
  const [dataProvider, setDataProvider] = useState<CloudDataProvider | null>(
    null
  );
  const firebase = useFirebase();
  const user = useUser();

  const venues: WithId<AnyVenue>[] = useMemo(
    () =>
      relatedRooms
        ? relatedRooms
            .filter((room) => "venue" in room && "id" in venue)
            .map((room) => (room as WithVenue<Room>)?.venue as WithId<AnyVenue>)
        : emptyRelatedVenues,
    [relatedRooms, venue]
  );

  const spaceIds = useMemo(() => venues.map((venue) => venue.id), [venues]);

  const { events } = useSpaceEvents({ worldId: venue.worldId, spaceIds });

  const locationUsers = useRecentLocationsUsers(venues);

  const liveEvents = useMemo(
    () =>
      events
        .filter((event) => isEventLive(event))
        .map((event) => {
          return {
            spaceId: event.spaceId,
            name: event.name,
          };
        }),
    [events]
  );

  const roomsWithFullData: RoomWithFullData[] | undefined = relatedRooms?.map(
    (room, index) => {
      if ("venue" in room) {
        const roomWithVenue = room as WithVenue<Room>;
        const venue = roomWithVenue.venue as WithId<AnyVenue>;
        const location = locationUsers.find(
          (location) => location.id === venue.id
        );

        if (location) {
          return {
            ...roomWithVenue,
            id: index,
            countUsers: location ? location.users.length : 0,
            isLive: !!liveEvents.find(
              (event) => event.spaceId === location?.id
            ),
          };
        }
      }

      return {
        ...room,
        ...{ id: index, isLive: false, countUsers: 0 },
      };
    }
  );

  const firebarrels = useFirebarrels({ animateMapId: venue.id });

  const firebarrelsWithUsers = firebarrels?.firebarrels.map((firebarrel) => {
    return firebarrel;
  });

  useEffect(() => {
    if (dataProvider) {
      dataProvider.updateRooms(roomsWithFullData);
      dataProvider.updateFirebarrels(firebarrelsWithUsers);
    }
  }, [roomsWithFullData, firebarrelsWithUsers, dataProvider]);

  useEffect(() => {
    if (dataProvider) dataProvider.updateUsersAsync(EMPTY_WORLD_USERS);
  }, [dataProvider]);

  useEffect(
    () => {
      if (typeof user.userId === "string" && !dataProvider && firebase) {
        const dataProvider = new CloudDataProvider({
          playerId: user.userId,
          userAvatarUrl: getFirebaseStorageResizedImage(
            user.profile?.pictureUrl ?? "",
            {
              width: 64,
              height: 64,
              fit: "crop",
            }
          ),
          firebase: firebase,
          playerioGameId: venue.playerioGameId,
          playerioMaxPlayerPerRoom: venue.playerioMaxPlayerPerRoom ?? 80,
          playerioFrequencyUpdate: venue.playerioFrequencyUpdate ?? 0.5,
          // playerioAdvancedMode: venue.playerioAdvancedMode,
          reInitOnError,
        });
        dataProvider.updateRooms(roomsWithFullData);
        dataProvider.updateFirebarrels(firebarrelsWithUsers);
        dataProvider.updateUsers(EMPTY_WORLD_USERS);

        setDataProvider(dataProvider);
        newDataProviderCreate(dataProvider);
      }
    },
    // note: we really doesn't need rerender this for others dependencies
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [user, dataProvider, firebase, reInitOnError]
  );

  return null;
};
