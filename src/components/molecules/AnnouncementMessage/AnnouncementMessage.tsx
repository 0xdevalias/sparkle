import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";


import { RenderMarkdown } from "components/organisms/RenderMarkdown";

import { useShowHide } from "hooks/useShowHide";

import { BannerFormData } from "types/banner";

import { LinkButton } from "components/atoms/LinkButton";

import "./AnnouncementMessage.scss";

export interface AnnouncementMessageProps {
  banner?: BannerFormData;
  isUser?: boolean;
}

export const AnnouncementMessage: React.FC<AnnouncementMessageProps> = ({
  banner,
  isUser = false,
}) => {

  const {
    isShown: isShownAnnouncementMessage,
    show: showAnnouncementMessage,
    hide: hideAnnouncementMessage,
  } = useShowHide();

  useEffect(() => {
    if (banner?.content) {
      showAnnouncementMessage();
    }
  }, [banner, showAnnouncementMessage]);

  const noop = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  const isActiveButton =
    banner?.buttonDisplayText && banner?.buttonUrl && banner?.isActionButton;

  const containerClassNames = classNames("AnnouncementContainer", {
    "AnnouncementContainer--centered": banner?.isFullScreen,
    "AnnouncementContainer--canceled": !isUser,
  });

  if (!isUser && !banner?.content)
    return (
      <div className="AnnouncementMessage">
        <span className="AnnouncementMessage__default-text">
          No announcement
        </span>
      </div>
    );

  if (!isShownAnnouncementMessage || !banner?.content) return null;

  return (
    <div className={containerClassNames} onClick={hideAnnouncementMessage}>
      <div className="AnnouncementMessage" onClick={noop}>
        {banner?.title && (
          <h2 className="AnnouncementMessage__title">{banner.title}</h2>
        )}
        <div className="AnnouncementMessage__content">
          <RenderMarkdown text={banner.content} />
          {/* {getLinkFromText(banner.content)} */}
        </div>
        {isActiveButton && (
          <LinkButton
            href={banner.buttonUrl}
            className="AnnouncementMessage__action-button"
          >
            {banner.buttonDisplayText}
          </LinkButton>
        )}
        {isUser && banner.isCloseButton ? (
          <span
            className="AnnouncementMessage__close-button"
            onClick={hideAnnouncementMessage}
          >
            <FontAwesomeIcon icon={faTimesCircle} />
          </span>
        ) : null}
      </div>
    </div>
  );
};
