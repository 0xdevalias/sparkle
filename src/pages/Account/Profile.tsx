import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { useAsyncFn } from "react-use";

import {
  ACCOUNT_PROFILE_QUESTIONS_URL,
  DEFAULT_SPACE_SLUG,
  DISPLAY_NAME_MAX_CHAR_COUNT,
} from "settings";

import { generateUrl } from "utils/url";

import { useSpaceParams } from "hooks/spaces/useSpaceParams";
import { useUser } from "hooks/useUser";

import { Loading } from "components/molecules/Loading";
import { ProfilePictureInput } from "components/molecules/ProfilePictureInput";

import { ButtonNG } from "components/atoms/ButtonNG";

import "firebase/storage";

import { updateUserProfile } from "./helpers";

// @debt refactor the Profile related styles from Account.scss into Profile.scss
import "./Account.scss";
import "./Profile.scss";

export interface ProfileFormData {
  partyName: string;
  pictureUrl: string;
}

export const Profile: React.FC = () => {
  const history = useHistory();
  const { user, userWithId } = useUser();

  const { worldSlug, spaceSlug = DEFAULT_SPACE_SLUG } = useSpaceParams();

  const {
    register,
    handleSubmit,
    errors,
    formState,
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    mode: "onChange",
    defaultValues: {
      partyName: userWithId?.partyName,
      pictureUrl: userWithId?.pictureUrl,
    },
  });

  const [{ loading: isUpdating, error: httpError }, onSubmit] = useAsyncFn(
    async (data: ProfileFormData) => {
      if (!user) return;

      await updateUserProfile(user.uid, data);

      // @debt Should we throw an error here rather than defaulting to empty string?
      const nextUrl = generateUrl({
        route: ACCOUNT_PROFILE_QUESTIONS_URL,
        required: ["worldSlug"],
        params: { worldSlug, spaceSlug },
      });

      history.push(nextUrl);
    },
    [history, user, worldSlug, spaceSlug]
  );

  const pictureUrl = watch("pictureUrl");

  return (
    <div className="Profile page-container-onboarding">
      <div className="Profile__container login-container">
        <h2 className="login-welcome-title">
          Well done! Now create your profile
        </h2>

        <div className="login-welcome-subtitle">
          {`Don't fret, you'll be able to edit it at any time later`}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="input-group profile-form">
            {/* @debt refactor this to use InputField */}
            <input
              name="partyName"
              className="input-block input-centered"
              placeholder="Your display name"
              ref={register({
                required: true,
                maxLength: DISPLAY_NAME_MAX_CHAR_COUNT,
              })}
              autoComplete="off"
            />
            <span className="input-info">
              This is your display name (max {DISPLAY_NAME_MAX_CHAR_COUNT}{" "}
              characters)
            </span>
            {errors.partyName && errors.partyName.type === "required" && (
              <span className="input-error">Display name is required</span>
            )}
            {errors.partyName && errors.partyName.type === "maxLength" && (
              <span className="input-error">
                Display name must be {DISPLAY_NAME_MAX_CHAR_COUNT} characters or
                less
              </span>
            )}

            {user && (
              <ProfilePictureInput
                setValue={setValue}
                user={user}
                errors={errors}
                pictureUrl={pictureUrl}
                register={register}
              />
            )}
          </div>

          <div className="input-group">
            <ButtonNG
              type="submit"
              className="create-account__button"
              variant="login-gradient"
              disabled={!formState.isValid || isUpdating}
            >
              Create my profile
            </ButtonNG>
            {isUpdating && <Loading />}
            {httpError && (
              <span className="input-error">{httpError.message}</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
