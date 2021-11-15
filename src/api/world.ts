import firebase from "firebase/app";
import { isEmpty, omit, pick } from "lodash";

import { ACCEPTED_IMAGE_TYPES } from "settings";

import { createSlug } from "api/admin";

import { EntranceStepConfig } from "types/EntranceStep";
import { Question } from "types/Question";
import { UsernameVisibility, UserStatus } from "types/User";
import {
  WorldAdvancedFormInput,
  WorldEntranceFormInput,
  WorldStartFormInput,
} from "types/world";

import { generateFirestoreId, WithId, withId } from "utils/id";
import { isDefined } from "utils/types";

// NOTE: world might have many fields, please keep them in alphabetic order
export interface World {
  adultContent?: boolean;
  attendeesTitle?: string;
  chatTitle?: string;
  config: {
    landingPageConfig: {
      coverImageUrl: string;
      description?: string;
      subtitle?: string;
    };
  };
  createdAt: Date;
  entrance?: EntranceStepConfig[];
  host: {
    icon: string;
  };
  name: string;
  owners: string[];
  questions?: {
    code?: Question[];
    profile?: Question[];
  };
  radioStations?: string[];
  requiresDateOfBirth?: boolean;
  showBadges?: boolean;
  showNametags?: UsernameVisibility;
  showRadio?: boolean;
  showSchedule?: boolean;
  showUserStatus?: boolean;
  slug: string;
  updatedAt: Date;
  userStatuses?: UserStatus[];
}

export const createFirestoreWorldCreateInput: (
  input: WorldStartFormInput
) => Promise<Partial<World>> = async (input) => {
  const name = input.name;
  const slug = createSlug(name);

  return { name, slug };
};

export const createFirestoreWorldStartInput: (
  input: WithId<WorldStartFormInput>,
  user: firebase.UserInfo
) => Promise<Partial<World>> = async (input, user) => {
  // NOTE: id is needed before world is created to upload the images
  const id = input?.id ?? generateFirestoreId({ emulated: true });

  const slug = createSlug(input.name);
  const storageRef = firebase.storage().ref();

  const imageInputData: Record<string, string> = {};

  const imageInputs = {
    logoImageUrl: input.logoImageFile,
    bannerImageUrl: input.bannerImageFile,
  };

  // upload the files
  for (const [key, value] of Object.entries(imageInputs)) {
    const file = value?.[0];

    if (!file) continue;

    const type = file.type;
    if (!ACCEPTED_IMAGE_TYPES.includes(type)) continue;

    const extension = type.split("/").pop();
    const uploadFileRef = storageRef.child(
      `users/${user.uid}/worlds/${id}/${key}.${extension}`
    );

    await uploadFileRef.put(file);
    imageInputData[key] = await uploadFileRef.getDownloadURL();
  }

  const worldUpdateData: Partial<WithId<World>> = {
    ...omit(input, Object.keys(imageInputs)),
    ...imageInputData,
    id,
    slug,
  };

  return worldUpdateData;
};

export const createFirestoreWorldEntranceInput: (
  input: WithId<WorldEntranceFormInput>,
  user: firebase.UserInfo
) => Promise<Partial<World>> = async (input, user) => {
  const worldUpdateData: Partial<WithId<World>> = {
    id: input.id,
    adultContent: input?.adultContent,
    requiresDateOfBirth: input?.requiresDateOfBirth,
    questions: {
      code: input?.code ?? [],
      profile: input?.profile ?? [],
    },
    entrance: isEmpty(input.entrance) ? undefined : input.entrance,
  };

  return worldUpdateData;
};

export const createFirestoreWorldAdvancedInput: (
  input: WithId<WorldAdvancedFormInput>,
  user: firebase.UserInfo
) => Promise<Partial<World>> = async (input, user) => {
  // mapping is mostly 1:1, so just filtering out unintended extra fields
  const picked = pick(input, [
    "id",
    "attendeesTitle",
    "chatTitle",
    "showBadges",
    "showNametags",
    "showRadio",
    "showSchedule",
    "showUserStatus",
    "userStatuses",
  ]);

  // Form input is just a single string, but DB structure is string[]
  const radioStations = isDefined(input.radioStation)
    ? [input.radioStation]
    : undefined;

  return { ...picked, radioStations };
};

export const createWorld: (
  world: WorldStartFormInput,
  user: firebase.UserInfo
) => Promise<{
  worldId?: string;
  error?: Error | unknown;
}> = async (world, user) => {
  // a way to share value between try and catch blocks
  let worldId = "";
  try {
    // NOTE: due to interdependence on id and upload files' URLs:

    // 1. first a world stub is created
    const stubInput = await createFirestoreWorldCreateInput(world);

    const newWorld = (
      await firebase.functions().httpsCallable("world-createWorld")(stubInput)
    )?.data;

    worldId = newWorld.id;

    // 2. then world is properly updated, having necessary id
    const fullInput = await createFirestoreWorldStartInput(
      withId(world, worldId),
      user
    );

    await firebase.functions().httpsCallable("world-updateWorld")(fullInput);

    // 3. initial venue is created
    // Temporary disabled due to possible complications and edge cases.
    // What if the inital venue has to be a template of choice
    // What if the venue already exists and it collides with the world name
    // etc..
    // await firebase.functions().httpsCallable("venue-createVenue_v2")({
    //   ...fullInput,
    //   worldId,
    // });

    // worldId might be useful for caller
    return { worldId };
  } catch (error) {
    // in order to prevent new worlds getting created due to subsequent errors
    // if an error is thrown here, but a world stub actually did get created
    // return the id along with the error so that caller can proceed with update instead
    return worldId ? { worldId, error } : { error };
  }
};

export const updateWorldStartSettings = async (
  world: WithId<WorldStartFormInput>,
  user: firebase.UserInfo
) => {
  return await firebase.functions().httpsCallable("world-updateWorld")(
    await createFirestoreWorldStartInput(world, user)
  );
};

export const updateWorldEntranceSettings = async (
  world: WithId<WorldEntranceFormInput>,
  user: firebase.UserInfo
) => {
  return await firebase.functions().httpsCallable("world-updateWorld")(
    await createFirestoreWorldEntranceInput(world, user)
  );
};

export const updateWorldAdvancedSettings = async (
  world: WithId<WorldAdvancedFormInput>,
  user: firebase.UserInfo
) => {
  return await firebase.functions().httpsCallable("world-updateWorld")(
    await createFirestoreWorldAdvancedInput(world, user)
  );
};
