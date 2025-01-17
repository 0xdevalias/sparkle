import {
  UserProfileActions,
  UserProfileActionTypes,
} from "store/actions/UserProfile";

export type UserProfileState = {
  userId?: string;
};

const initialState: UserProfileState = {
  userId: undefined,
};

export const userProfileReducer = (
  state = initialState,
  action: UserProfileActions
): UserProfileState => {
  switch (action.type) {
    case UserProfileActionTypes.UPDATE_USER_PROFILE_ID:
      const { userId } = action.payload;
      return { userId };

    default:
      return state;
  }
};
