import React, { useEffect, useMemo } from "react";
import { Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useAsyncFn } from "react-use";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { updateWorldAdvancedSettings, World } from "api/world";

import { UserStatus } from "types/User";
import { WorldAdvancedFormInput } from "types/world";

import { WithId, withId } from "utils/id";
import { shouldScheduleBeShown } from "utils/schedule";

import { emptyObjectSchema } from "forms/emptyObjectSchema";

import { useArray } from "hooks/useArray";
import { useUser } from "hooks/useUser";

import { AdminSidebarButtons } from "components/organisms/AdminVenueView/components/AdminSidebarButtons";

import { AdminCheckbox } from "components/molecules/AdminCheckbox";
import { AdminInput } from "components/molecules/AdminInput";
import { AdminSection } from "components/molecules/AdminSection";
import { AdminUserStatusInput } from "components/molecules/AdminUserStatusInput";
import { FormErrors } from "components/molecules/FormErrors";
import { SubmitError } from "components/molecules/SubmitError";

import { ButtonNG } from "components/atoms/ButtonNG";

import "./WorldAdvancedForm.scss";

// NOTE: add the keys of those errors that their respective fields have handled
const HANDLED_ERRORS: string[] = [];

export interface WorldAdvancedFormProps {
  world: WithId<World>;
}

export const WorldAdvancedForm: React.FC<WorldAdvancedFormProps> = ({
  world,
}) => {
  const worldId = world.id;
  const { user } = useUser();

  const {
    items: userStatuses,
    add: addStatus,
    set: setStatus,
    remove: removeStatus,
    isDirty: isDirtyStatuses,
    clearDirty: clearDirtyStatuses,
  } = useArray<UserStatus>(world.userStatuses);

  const defaultValues = useMemo<WorldAdvancedFormInput>(
    () => ({
      attendeesTitle: world.attendeesTitle,
      radioStation: world.radioStations?.[0],
      showBadges: world.showBadges,
      showRadio: world.showRadio,
      showSchedule: shouldScheduleBeShown(world),
      showUserStatus: world.showUserStatus,
      userStatuses: userStatuses,
      hasSocialLoginEnabled: world.hasSocialLoginEnabled,
    }),
    [world, userStatuses]
  );

  const {
    getValues,
    reset,
    watch,
    formState: { dirty, isSubmitting },
    errors,
    handleSubmit,
    register,
  } = useForm<WorldAdvancedFormInput>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    validationSchema: emptyObjectSchema,
    defaultValues,
  });

  const values = watch();

  const [{ error, loading: isSaving }, submit] = useAsyncFn(async () => {
    if (!values || !user || !worldId) return;

    const data = {
      attendeesTitle: values.attendeesTitle,
      radioStation: values.radioStation,
      showBadges: values.showBadges,
      showRadio: values.showRadio,
      showSchedule: values.showSchedule,
      showUserStatus: values.showUserStatus,
      hasSocialLoginEnabled: values.hasSocialLoginEnabled,
      userStatuses,
    };

    await updateWorldAdvancedSettings(withId(data, worldId), user);

    reset(data);
    clearDirtyStatuses();
  }, [worldId, user, values, reset, userStatuses, clearDirtyStatuses]);

  const isSaveLoading = isSubmitting || isSaving;
  const isSaveDisabled = !(
    dirty ||
    isSaving ||
    isSubmitting ||
    isDirtyStatuses
  );

  useEffect(() => {
    const values: Partial<WorldAdvancedFormInput> = getValues();
    reset({
      attendeesTitle: values.attendeesTitle,
      radioStation: values.radioStation,
      showBadges: values.showBadges,
      showRadio: values.showRadio,
      showSchedule: values.showSchedule,
      showUserStatus: values.showUserStatus,
      hasSocialLoginEnabled: values.hasSocialLoginEnabled,
      userStatuses,
    });
  }, [userStatuses, getValues, reset]);

  const renderedUserStatuses = useMemo(
    () =>
      userStatuses.map((userStatus, index) => {
        const key = `${userStatus}-${index}`;
        const name = `userStatuses[${index}]`;

        const handleChange = (item: UserStatus) => setStatus({ index, item });
        const handleRemove = () => removeStatus({ index });

        return (
          <AdminUserStatusInput
            key={key}
            name={name}
            item={userStatuses[index]}
            register={register}
            onChange={handleChange}
            onRemove={handleRemove}
          />
        );
      }),
    [userStatuses, setStatus, removeStatus, register]
  );

  return (
    <div className="WorldAdvancedForm">
      <Form onSubmit={handleSubmit(submit)}>
        <AdminSection
          title="Title of your venues attendees"
          subtitle="(For example: guests, attendees, partygoers)"
          withLabel
        >
          <AdminInput
            name="attendeesTitle"
            autoComplete="off"
            placeholder="Attendees title"
            errors={errors}
            register={register}
          />
        </AdminSection>

        <AdminSection>
          <AdminCheckbox
            name="showBadges"
            label="Show badges"
            variant="toggler"
            register={register}
          />
        </AdminSection>

        <AdminSection>
          <AdminCheckbox
            name="showRadio"
            label="Enable space radio"
            variant="toggler"
            errors={errors}
            register={register}
          />
          <AdminInput
            name="radioStation"
            errors={errors}
            register={register}
            label="Radio station stream URL:"
            hidden={!values.showRadio}
          />
        </AdminSection>

        <AdminSection>
          <AdminCheckbox
            name="hasSocialLoginEnabled"
            label="Social Login"
            subtext="Users can login using Google/Facebook/Okta social networks"
            variant="toggler"
            errors={errors}
            register={register}
          />
        </AdminSection>

        <AdminSection>
          <AdminCheckbox
            name="showSchedule"
            label="Show schedule"
            variant="toggler"
            register={register}
          />
        </AdminSection>

        <AdminSection>
          <AdminCheckbox
            name="showUserStatus"
            label="Show user status"
            variant="toggler"
            register={register}
          />
          {values.showUserStatus && (
            <>
              {renderedUserStatuses}
              <ButtonNG variant="primary" iconName={faPlus} onClick={addStatus}>
                Add a status
              </ButtonNG>
            </>
          )}
        </AdminSection>

        <FormErrors errors={errors} omitted={HANDLED_ERRORS} />
        <SubmitError error={error} />
        <AdminSidebarButtons>
          <ButtonNG
            className="AdminSidebar__button--larger"
            variant="primary"
            type="submit"
            disabled={isSaveDisabled}
            loading={isSaveLoading}
          >
            Save
          </ButtonNG>
        </AdminSidebarButtons>
      </Form>
    </div>
  );
};
