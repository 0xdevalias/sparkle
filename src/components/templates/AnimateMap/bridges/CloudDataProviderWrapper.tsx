import React, { useEffect, useState } from "react";
import { useFirebase } from "react-redux-firebase";

import { AnimateMapVenue } from "types/venues";

import { WithId } from "utils/id";

import { useUser } from "hooks/useUser";

import { useWorldUsers } from "../../../../hooks/users";
import { useRelatedPartymapRooms } from "../hooks/useRelatedPartymapRooms";

import { CloudDataProvider } from "./DataProvider/CloudDataProvider";

export interface CloudDataProviderWrapperProps {
  venue: WithId<AnimateMapVenue>;
  newDataProviderCreate: (dataProvider: CloudDataProvider) => void;
}

export const CloudDataProviderWrapper: React.FC<CloudDataProviderWrapperProps> = ({
  venue,
  newDataProviderCreate,
}) => {
  const [dataProvider, setDataProvider] = useState<CloudDataProvider | null>(
    null
  );
  const firebase = useFirebase();
  const user = useUser();
  const worldUsers = useWorldUsers();

  const rooms = useRelatedPartymapRooms({ venue });

  useEffect(() => {
    if (dataProvider) dataProvider.updateRooms(rooms);
  }, [rooms, dataProvider]);

  useEffect(() => {
    if (dataProvider) dataProvider.updateUsersAsync(worldUsers);
  }, [worldUsers, dataProvider]);

  useEffect(
    () => {
      if (typeof user.userId === "string" && !dataProvider && firebase) {
        const dataProvider = new CloudDataProvider(
          user.userId,
          user.profile?.pictureUrl,
          firebase,
          venue.playerioGameId ?? "sparkleburn-k1eqbxs6vusie0yujooma"
        );
        dataProvider.updateRooms(rooms);
        dataProvider.updateUsers(worldUsers);
        setDataProvider(dataProvider);
        newDataProviderCreate(dataProvider);
      }
    },
    // note: we really doesn't need rerender this for others dependencies
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [user, dataProvider, firebase]
  );

  return null;
};