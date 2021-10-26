import React, { useMemo } from "react";
import { Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useAsyncFn } from "react-use";
import * as Yup from "yup";

import { World } from "api/admin";
import { updateWorldEntranceSettings } from "api/world";

import { EntranceStepConfig } from "types/EntranceStep";
import { Question } from "types/Question";
import { WorldEntranceFormInput } from "types/world";

import { WithId } from "utils/id";

import { useArray } from "hooks/useArray";
import { useUser } from "hooks/useUser";

import { AdminSidebarFooter } from "components/organisms/AdminVenueView/components/AdminSidebarFooter";
import { AdminSidebarFooterProps } from "components/organisms/AdminVenueView/components/AdminSidebarFooter/AdminSidebarFooter";
import { EntranceStepsBuilder } from "components/organisms/EntranceStepsBuilder";
import { QuestionsBuilder } from "components/organisms/QuestionsBuilder";

import { AdminSection } from "components/molecules/AdminSection";
import { FormErrors } from "components/molecules/FormErrors";
import { SubmitError } from "components/molecules/SubmitError";

import { ButtonProps } from "components/atoms/ButtonNG/ButtonNG";
import { Checkbox } from "components/atoms/Checkbox";
import { Toggler } from "components/atoms/Toggler";

import "./WorldEntranceForm.scss";

// NOTE: add the keys of those errors that their respective fields have handled
const HANDLED_ERRORS: string[] = ["entrance"];

const questionSchema = Yup.array<Question>()
  .ensure()
  .defined()
  .transform((value) =>
    value.filter(({ name, text }: Question) => !!name && !!text)
  );

const validationSchema = Yup.object().shape({
  adultContent: Yup.bool().notRequired(),
  requiresDateOfBirth: Yup.bool().notRequired(),
  code: questionSchema.notRequired(),
  profile: questionSchema.notRequired(),
  entrance: Yup.array(
    Yup.object().shape({
      videoUrl: Yup.string().required("Video URL is required."),
      autoplay: Yup.boolean().notRequired(),
      buttons: Yup.array(
        Yup.object().shape({
          isProceed: Yup.boolean().required(),
          text: Yup.string().notRequired(),
          href: Yup.string().notRequired(),
        })
      ),
    })
  ).notRequired(),
});

export interface WorldEntranceFormProps extends AdminSidebarFooterProps {
  world: WithId<World>;
}

export const WorldEntranceForm: React.FC<WorldEntranceFormProps> = ({
  world,
  ...sidebarFooterProps
}) => {
  const worldId = world.id;
  const { user } = useUser();

  // @debt sync useArray with the form changes or try useFieldArray
  const {
    items: codeQuestions,
    add: addCodeQuestion,
    clear: clearCodeQuestions,
    remove: removeCodeQuestion,
  } = useArray<Question>(world.questions?.code);

  const {
    items: profileQuestions,
    add: addProfileQuestion,
    clear: clearProfileQuestions,
    remove: removeProfileQuestion,
  } = useArray<Question>(world.questions?.profile);

  const {
    items: entranceSteps,
    add: addEntranceStep,
    clear: clearEntranceSteps,
    remove: removeEntranceStep,
  } = useArray<EntranceStepConfig>(world.entrance);

  const defaultValues = useMemo<WorldEntranceFormInput>(
    () => ({
      code: codeQuestions,
      profile: profileQuestions,
      entrance: entranceSteps,
      adultContent: world.adultContent ?? false,
      requiresDateOfBirth: world.requiresDateOfBirth ?? false,
    }),
    [
      codeQuestions,
      profileQuestions,
      entranceSteps,
      world.adultContent,
      world.requiresDateOfBirth,
    ]
  );

  const {
    reset,
    register,
    formState: { dirty, isSubmitting },
    errors,
    handleSubmit,
  } = useForm<WorldEntranceFormInput>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    validationSchema,
    defaultValues,
  });

  const [{ error, loading: isSaving }, submit] = useAsyncFn(
    async (input: WorldEntranceFormInput) => {
      if (!user || !worldId) return;

      await updateWorldEntranceSettings({ ...input, id: worldId }, user);

      reset(input);
    },
    [worldId, user, reset]
  );

  const saveButtonProps: ButtonProps = useMemo(
    () => ({
      type: "submit",
      disabled: !dirty && !isSaving && !isSubmitting,
      loading: isSubmitting || isSaving,
    }),
    [dirty, isSaving, isSubmitting]
  );

  return (
    <div className="WorldEntranceForm">
      <Form onSubmit={handleSubmit(submit)}>
        <AdminSidebarFooter
          {...sidebarFooterProps}
          saveButtonProps={saveButtonProps}
        />
        <AdminSection title="Limit access to world">
          <Toggler
            name="adultContent"
            label="Restrict entry to adults aged 18+"
            forwardedRef={register}
          />
          <Checkbox
            name="requiresDateOfBirth"
            label="Require date of birth on register"
            forwardedRef={register}
          />
        </AdminSection>
        <AdminSection title="Code of conduct questions">
          <QuestionsBuilder
            errors={errors}
            hasLink
            items={codeQuestions}
            name="code"
            onAdd={addCodeQuestion}
            onRemove={removeCodeQuestion}
            onClear={clearCodeQuestions}
            register={register}
          />
        </AdminSection>
        <AdminSection title="Profile questions">
          <QuestionsBuilder
            errors={errors}
            items={profileQuestions}
            name="profile"
            onAdd={addProfileQuestion}
            onRemove={removeProfileQuestion}
            onClear={clearProfileQuestions}
            register={register}
          />
        </AdminSection>
        <AdminSection title="Space Entrance">
          <EntranceStepsBuilder
            errors={errors.entrance}
            items={entranceSteps}
            name="entrance"
            onAdd={addEntranceStep}
            onRemove={removeEntranceStep}
            onClear={clearEntranceSteps}
            register={register}
          />
        </AdminSection>
        <FormErrors errors={errors} omitted={HANDLED_ERRORS} />
        <SubmitError error={error} />
      </Form>
    </div>
  );
};