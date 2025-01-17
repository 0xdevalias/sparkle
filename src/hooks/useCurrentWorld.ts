import { useMemo } from "react";
import { useFirestore, useFirestoreDocData } from "reactfire";

import { World } from "api/world";

import { ReactHook } from "types/utility";

import { withIdConverter } from "utils/converters";
import { WithId } from "utils/id";

interface UseCurrentWorldProps {
  worldId?: string;
}

interface UseCurrentWorldReturn {
  isLoaded: boolean;
  world?: WithId<World>;
}

// @debt duplicate of useWorldById
export const useCurrentWorld: ReactHook<
  UseCurrentWorldProps,
  UseCurrentWorldReturn
> = ({ worldId }) => {
  const firestore = useFirestore();
  const worldRef = firestore
    .collection("worlds")
    .doc(worldId)
    .withConverter(withIdConverter<World>());

  const { data: world, status } = useFirestoreDocData<WithId<World>>(worldRef);

  const isWorldLoaded = status !== "loading";

  return useMemo(
    () => ({
      world: world,
      isLoaded: isWorldLoaded,
    }),
    [isWorldLoaded, world]
  );
};
