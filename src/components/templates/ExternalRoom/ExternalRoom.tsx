import React, { useCallback, useEffect } from "react";
import { useCss } from "react-use";
import classNames from "classnames";

import { ALWAYS_EMPTY_ARRAY, ENABLE_POPUPS_URL } from "settings";

import { AnyVenue } from "types/venues";

import { WithId } from "utils/id";
import { getExtraLinkProps, openUrl } from "utils/url";

import { RenderMarkdown } from "components/organisms/RenderMarkdown";

import { UserList } from "components/molecules/UserList";

import { ButtonNG } from "components/atoms/ButtonNG";
import { SparkleLogoIcon } from "components/atoms/SparkleLogoIcon";
import { VenueWithOverlay } from "components/atoms/VenueWithOverlay/VenueWithOverlay";

import IconExternalLink from "assets/icons/icon-room-externallink.svg";

import "./ExternalRoom.scss";

export interface ExternalRoomProps {
  venue: WithId<AnyVenue>;
}

export const ExternalRoom: React.FC<ExternalRoomProps> = ({ venue }) => {
  const redirectUrl = venue.zoomUrl ?? "";

  const venueLogoVars = useCss({
    "background-image": `url(${venue.host?.icon || IconExternalLink})`,
  });

  const venueLogoClasses = classNames(
    "ExternalRoom__venue-logo",
    venueLogoVars
  );

  useEffect(() => {
    if (!redirectUrl) return;
    openUrl(redirectUrl);
  }, [redirectUrl]);

  const openRoomUrl = useCallback(() => openUrl(redirectUrl), [redirectUrl]);

  return (
    <VenueWithOverlay venue={venue} containerClassNames="ExternalRoom">
      <div className="ExternalRoom__container">
        <SparkleLogoIcon />
        {!redirectUrl && (
          <div className="ExternalRoom__container">
            <div className="ExternalRoom__message">
              Venue {venue.name} should redirect to a URL, but none was set.
            </div>
          </div>
        )}

        {redirectUrl && (
          <>
            <div className="ExternalRoom__message">
              <div>This page should automatically open</div>
              <a
                href={redirectUrl}
                className="ExternalRoom__link"
                {...getExtraLinkProps(true)}
              >
                {redirectUrl}
              </a>

              <div>
                in a new tab. If you&apos;re not seeing this, try{" "}
                <a rel="noreferrer" href={ENABLE_POPUPS_URL} target="_blank">
                  enabling pop ups on your browser.
                </a>
              </div>
            </div>
            <div className="ExternalRoom__content">
              <div className="ExternalRoom__venue-container">
                <div className={venueLogoClasses} />

                <div className="ExternalRoom__venue-details">
                  <div className="ExternalRoom__venue-title">{venue.name}</div>

                  <div className="ExternalRoom__venue-subtitle">
                    {venue.config?.landingPageConfig.subtitle}
                  </div>

                  <ButtonNG variant="primary" onClick={openRoomUrl}>
                    Enter
                  </ButtonNG>
                </div>
              </div>

              <div className="ExternalRoom__venue-description">
                <RenderMarkdown
                  text={venue.config?.landingPageConfig.description}
                />
              </div>

              <UserList
                containerClassName="ExternalRoom__userlist"
                userCount={venue.recentUserCount ?? 0}
                usersSample={venue.recentUsersSample ?? ALWAYS_EMPTY_ARRAY}
                activity="in here"
                hasClickableAvatars
              />
            </div>
          </>
        )}
      </div>
    </VenueWithOverlay>
  );
};
