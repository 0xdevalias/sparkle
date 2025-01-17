import React, { useCallback } from "react";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";

import { ALWAYS_EMPTY_ARRAY } from "settings";

import { AuditoriumSection } from "types/auditorium";
import { AuditoriumVenue } from "types/venues";

import { getSectionCapacity } from "utils/auditorium";
import { WithId } from "utils/id";

import { UserList } from "components/molecules/UserList";

import "./SectionPreview.scss";

export interface SectionPreviewProps {
  section: WithId<AuditoriumSection>;
  venue: WithId<AuditoriumVenue>;
  enterSection: (sectionId: string) => void;
}

export const SectionPreview: React.FC<SectionPreviewProps> = ({
  section,
  venue,
  enterSection,
}) => {
  const sectionCapacity = getSectionCapacity(venue, section);

  const sectionId = section.id;

  const seatedUsersCount = section.seatedUsersCount ?? 0;

  const isFull = seatedUsersCount >= sectionCapacity;
  const isEmpty = seatedUsersCount === 0;

  const userAmountText = isFull
    ? "Full"
    : `${seatedUsersCount}/${sectionCapacity}`;

  const onSectionEnter = useCallback(() => {
    if (isFull) return;

    enterSection(sectionId);
  }, [isFull, enterSection, sectionId]);

  const containerClasses = classNames("SectionPreview", {
    "SectionPreview--full": isFull,
    "SectionPreview--empty": isEmpty,
    "SectionPreview--vip": section.isVip,
  });

  return (
    <div className={containerClasses} onClick={onSectionEnter}>
      {section.isVip && <div className="SectionPreview__vip-label">VIP</div>}

      <div className="SectionPreview__people-count">
        <FontAwesomeIcon icon={faUserFriends} size="sm" />
        <span className="SectionPreview__people-count-number">
          {userAmountText}
        </span>
      </div>

      <UserList
        usersSample={section.seatedUsersSample ?? ALWAYS_EMPTY_ARRAY}
        userCount={section.seatedUsersCount ?? 0}
        showTitle={false}
        cellClassName="SectionPreview__avatar"
      />
    </div>
  );
};
