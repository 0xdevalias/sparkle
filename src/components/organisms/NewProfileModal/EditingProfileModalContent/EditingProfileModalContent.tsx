import React, { useCallback } from "react";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";
import { useFirebase } from "react-redux-firebase";
import { useAsyncFn } from "react-use";
import { pick, uniq } from "lodash";

import {
  profileModalPasswordsFields,
  UserProfileModalFormData,
  UserProfileModalFormDataPasswords,
} from "types/profileModal";
import { ProfileLink, User } from "types/User";
import { AnyVenue } from "types/venues";

import { WithId } from "utils/id";
import { propName, userProfileModalFormProp as formProp } from "utils/propName";

import { useCheckOldPassword } from "hooks/useCheckOldPassword";
import { useProfileModalFormDefaultValues } from "hooks/useProfileModalFormDefaultValues";
import { useProfileQuestions } from "hooks/useProfileQuestions";
import { useShowHide } from "hooks/useShowHide";

import { updateUserProfile } from "pages/Account/helpers";

import { EditProfileModalButtons } from "components/organisms/NewProfileModal/components/buttons/EditProfileModalButtons";
import { ProfileModalEditBasicInfo } from "components/organisms/NewProfileModal/components/header/ProfileModalEditBasicInfo";
import { ProfileModalEditLinks } from "components/organisms/NewProfileModal/components/links/ProfileModalEditLinks";
import { ProfileModalChangePassword } from "components/organisms/NewProfileModal/components/ProfileModalChangePassword";
import { ProfileModalQuestions } from "components/organisms/NewProfileModal/components/ProfileModalQuestions";

import "./EditingProfileModalContent.scss";

export interface CurrentUserProfileModalContentProps {
  user: WithId<User>;
  venue?: WithId<AnyVenue>;
  onCancelEditing: () => void;
}

export const EditingProfileModalContent: React.FC<CurrentUserProfileModalContentProps> = ({
  user,
  venue,
  onCancelEditing,
}) => {
  const { questions, answers } = useProfileQuestions(user, venue?.worldId);
  const firebaseUser = useFirebase().auth()?.currentUser;

  const defaultValues = useProfileModalFormDefaultValues(
    user,
    questions,
    answers
  );

  const checkOldPassword = useCheckOldPassword();

  const {
    isShown: isChangePasswordShown,
    show: showChangePassword,
  } = useShowHide();

  const {
    register,
    reset,
    errors,
    setError,
    clearError,
    watch,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState,
  } = useForm<UserProfileModalFormData>({
    mode: "onBlur",
    reValidateMode: "onChange",
    validateCriteriaMode: "all",
    defaultValues,
  });

  const {
    fields: links,
    append: addLink,
    remove: removeLink,
  } = useFieldArray<ProfileLink>({
    control,
    name: formProp("profileLinks"),
  });

  const onDeleteLink = useCallback(
    (i: number) => {
      // @debt a hacky solution to mark profileLinks field dirty. For some reason, `remove` from useFieldArray is not enough
      formState.dirtyFields.add("profileLinks");
      removeLink(i);
    },
    [formState.dirtyFields, removeLink]
  );

  const cancelEditing = useCallback(() => {
    onCancelEditing();
    reset();
  }, [reset, onCancelEditing]);

  const addLinkHandler = useCallback(() => {
    addLink({ url: "", title: "" });
  }, [addLink]);

  const setLinkTitle = useCallback(
    (index: number, title: string) => {
      setValue(
        `${formProp("profileLinks")}[${index}].${propName<ProfileLink>(
          "title"
        )}`,
        title
      );
    },
    [setValue]
  );

  const [{ loading: isSubmitting }, onSubmit] = useAsyncFn(
    async (data: Omit<UserProfileModalFormData, "profileLinks">) => {
      if (!firebaseUser) return;
      const dataWithProfileLinks = {
        profileLinks: [],
        ...data,
      };

      const passwordsNotEmpty = Object.values(
        pick(data, profileModalPasswordsFields)
      ).some((x) => x);
      if (passwordsNotEmpty) {
        if (!(await checkOldPassword(data.oldPassword))) {
          setError(formProp("oldPassword"), "validate", "Incorrect password");
          return;
        } else {
          clearError(formProp("oldPassword"));
          await firebaseUser.updatePassword(data.confirmNewPassword);
        }
      }

      const changedFields = uniq(
        Array.from(formState.dirtyFields)
          .filter(
            (k) =>
              !profileModalPasswordsFields.includes(
                k as keyof UserProfileModalFormDataPasswords
              )
          )
          // formState.dirtyFields expressed nested fields like this: "profileLinks[0].url", "profileLinks[0].title"
          // so we need to transform them
          .map((k) =>
            k.startsWith(formProp("profileLinks")) ? "profileLinks" : k
          )
      ) as (keyof UserProfileModalFormData)[];

      if (changedFields.length > 0) {
        await updateUserProfile(
          firebaseUser.uid,
          pick(dataWithProfileLinks, changedFields)
        );
      }

      onCancelEditing();
    },
    [
      firebaseUser,
      formState.dirtyFields,
      onCancelEditing,
      checkOldPassword,
      setError,
      clearError,
    ]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ProfileModalEditBasicInfo
        user={user}
        containerClassName="EditingProfileModalContent__section"
        register={register}
        watch={watch}
        setValue={setValue}
        partyNameError={errors?.partyName}
      />
      <ProfileModalQuestions
        editMode
        containerClassName="EditingProfileModalContent__section"
        questions={questions}
        answers={answers}
        register={register}
      />
      <ProfileModalEditLinks
        containerClassName="EditingProfileModalContent__section"
        register={register}
        initialLinks={defaultValues.profileLinks ?? []}
        links={links}
        setLinkTitle={setLinkTitle}
        errors={errors?.profileLinks}
        onDeleteLink={onDeleteLink}
        onAddLink={addLinkHandler}
      />
      {isChangePasswordShown && (
        <ProfileModalChangePassword
          containerClassName="EditingProfileModalContent__section"
          register={register}
          getValues={getValues}
          errors={pick<
            FieldErrors<UserProfileModalFormData>,
            "oldPassword" | "newPassword" | "confirmNewPassword"
          >(errors, ["oldPassword", "newPassword", "confirmNewPassword"])}
        />
      )}
      <EditProfileModalButtons
        isChangePasswordShown={!isChangePasswordShown}
        onChangePasswordClick={showChangePassword}
        onCancelClick={cancelEditing}
        isSubmitting={isSubmitting}
        containerClassName="EditingProfileModalContent__edit-buttons"
      />
    </form>
  );
};
