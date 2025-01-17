import React, { useEffect, useMemo, useState } from "react";
import { Dropdown as ReactBootstrapDropdown } from "react-bootstrap";
import { FieldError, useForm } from "react-hook-form";
import { omit, omitBy } from "lodash";

import { PORTAL_INFO_ICON_MAPPING } from "settings";

import { AnyVenue, PortalTemplate, VenueTemplate } from "types/venues";

import { WithId } from "utils/id";

import { Dropdown } from "components/atoms/Dropdown";

import "./SpacesDropdown.scss";

const noneOptionName = "None";
const spaceNoneOption = Object.freeze({
  id: "",
  name: "",
  template: undefined,
});

type SpacesDropdownPortal = {
  template?: PortalTemplate;
  name: string;
  id?: string;
};

interface SpacesDropdownProps {
  parentSpace?: SpacesDropdownPortal;
  setValue: <T>(prop: string, value: T, validate: boolean) => void;
  register: ReturnType<typeof useForm>["register"];
  fieldName: string;
  error?: FieldError;
  spaces: Record<string, WithId<AnyVenue>>;
}

export const SpacesDropdown: React.FC<SpacesDropdownProps> = ({
  parentSpace,
  spaces,
  setValue,
  register,
  fieldName,
  error,
}) => {
  // @debt SpacesDropdown should not know about the concept of parent spaces
  // It should be getting the value from the form values instead.
  const [selected, setSelected] = useState(parentSpace);

  // @debt: Probably need to omit returning playa from the useOwnedVenues as it's deprecated and
  // doesn't exist on SPACE_PORTALS_ICONS_MAPPING
  const spacesWithoutPlaya = omit(spaces, VenueTemplate.playa);
  // @debt Filter out all the poster pages as poster hall currently uses (abuses?)
  // spaces by creating a space for every single poster page. They aren't
  // proper spaces though. We should make a better way of handling this.
  const filteredSpaces = omitBy(
    spacesWithoutPlaya,
    (s) => s.template === VenueTemplate.posterpage
  );
  const sortedSpaces = useMemo(
    () =>
      Object.values(filteredSpaces).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    [filteredSpaces]
  );

  const spaceOptions = useMemo(() => [spaceNoneOption, ...sortedSpaces], [
    sortedSpaces,
  ]);

  useEffect(() => {
    if (parentSpace) {
      setSelected(parentSpace);
    }
  }, [parentSpace]);

  const renderedOptions = useMemo(
    () =>
      spaceOptions.map(({ id, name, template }) => {
        const spaceIcon = PORTAL_INFO_ICON_MAPPING[template ?? ""];

        return (
          <ReactBootstrapDropdown.Item
            key={id}
            onClick={() => {
              setSelected({ name, template, id });
              setValue(fieldName, id, true);
            }}
            className="SpacesDropdown__item"
          >
            {name !== spaceNoneOption.name ? (
              <img
                alt={`space-icon-${spaceIcon}`}
                src={spaceIcon}
                className="SpacesDropdown__item-icon"
              />
            ) : null}
            {name || noneOptionName}
          </ReactBootstrapDropdown.Item>
        );
      }) ?? [],
    [spaceOptions, setValue, fieldName]
  );

  const renderedTitle = useMemo(() => {
    if (!selected) {
      return "Select a space";
    }

    const space = spaces?.[selected.id ?? ""] ?? parentSpace;

    const spaceIcon = PORTAL_INFO_ICON_MAPPING[space?.template ?? ""];

    return (
      <span className="SpacesDropdown__value">
        {selected.name !== spaceNoneOption.name ? (
          <img
            alt={`space-icon-${spaceIcon}`}
            src={spaceIcon}
            className="SpacesDropdown__item-icon"
          />
        ) : null}
        {selected.name || noneOptionName}
      </span>
    );
  }, [spaces, selected, parentSpace]);

  return (
    // @debt align the style of the SpacesDropdown with the Dropdown component
    <>
      <div className="SpacesDropdown">
        <Dropdown title={renderedTitle} options={renderedOptions} />
        <input type="hidden" ref={register} name={fieldName} />
      </div>
      {error && <span className="input-error">{error.message}</span>}
    </>
  );
};
