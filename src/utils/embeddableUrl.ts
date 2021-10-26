import {
  FACEBOOK_EMBED_URL,
  TWITCH_EMBED_URL,
  TWITCH_SHORT_URL,
  VIMEO_EMBED_URL,
  VIMEO_SHORT_EVENT_URL,
  YOUTUBE_EMBED_URL,
  YOUTUBE_SHORT_URL_STRING,
} from "settings";

const withParameters = (urlObject: URL, urlParams?: URLSearchParams) => {
  if (!urlParams) {
    return;
  }

  for (const [key, value] of urlParams.entries()) {
    urlObject.searchParams.set(key, value);
  }
};

const withAutoPlay = ({
  urlObject,
  autoPlay,
}: {
  urlObject: URL;
  autoPlay?: string | false | null;
}) => {
  if (autoPlay === "1" || autoPlay === "true") {
    urlObject.searchParams.set("autoplay", autoPlay);
  } else {
    urlObject.searchParams.delete("autoplay");
  }
};

type ConvertYoutubeUrlOptions = {
  searchParams: URLSearchParams;
  pathname: string;
};

const getYoutubeUrl = ({
  searchParams,
  pathname,
}: ConvertYoutubeUrlOptions) => {
  const youtubeVideoId = searchParams.get("v") || pathname.slice(1);
  const youtubeStartTime =
    searchParams.get("start") || searchParams.get("t") || "0";

  const youtubeUrlObj = new URL(`${YOUTUBE_EMBED_URL}${youtubeVideoId}`);
  withParameters(youtubeUrlObj, searchParams);
  youtubeUrlObj.searchParams.set("start", youtubeStartTime);

  return youtubeUrlObj;
};

type ConvertTwitchUrlOptions = {
  pathname: string;
  twitchId?: string | null;
  urlParameters: URLSearchParams;
};

const convertTwitchUrl: (options: ConvertTwitchUrlOptions) => string = ({
  pathname,
  urlParameters,
}) => {
  const twitchVideoId = urlParameters.get("video");
  const twitchId = urlParameters.get("channel") || twitchVideoId;
  const id = pathname.split("/")?.slice(-1)?.[0] || twitchId || "";

  const twitchUrl = new URL(TWITCH_EMBED_URL);

  if (pathname.includes("video") || twitchVideoId) {
    twitchUrl.searchParams.set("video", id);
  } else {
    twitchUrl.searchParams.set("channel", id);
  }

  withParameters(twitchUrl, urlParameters);
  twitchUrl.searchParams.set("parent", "localhost");

  return twitchUrl.href;
};

export interface ConvertToEmbeddableUrlOptions {
  url?: string;
  autoPlay?: boolean;
}

export const convertToEmbeddableUrl: (
  options: ConvertToEmbeddableUrlOptions
) => string = ({ url: urlString, autoPlay }) => {
  if (!urlString) {
    return "";
  }

  const urlObject = new URL(urlString);
  const { host, searchParams, pathname } = urlObject;

  const urlAutoPlayValue =
    searchParams.get("autoplay") === "1" ||
    searchParams.get("autoplay") === "true"
      ? searchParams.get("autoplay")
      : false;

  withAutoPlay({ urlObject, autoPlay: autoPlay && urlAutoPlayValue });

  const isTwitch = host.includes(TWITCH_SHORT_URL);

  if (isTwitch) {
    return convertTwitchUrl({
      pathname,
      urlParameters: searchParams,
    });
  }

  if (
    host?.includes(YOUTUBE_SHORT_URL_STRING) &&
    !pathname?.includes("embed")
  ) {
    const youtubeUrl = getYoutubeUrl({ pathname, searchParams });

    return youtubeUrl.href;
  }

  if (
    host?.includes("vimeo") &&
    !host?.includes("player") &&
    // NOTE: If you have a scheduled live event, it gives you a different embed code
    !urlString?.includes(VIMEO_SHORT_EVENT_URL)
  ) {
    const vimeoUrlObject = new URL(`${VIMEO_EMBED_URL}${pathname}`);

    return vimeoUrlObject.href;
  }

  if (pathname?.includes(FACEBOOK_EMBED_URL)) {
    searchParams.set("mute", "0");
  }

  return urlObject.href;
};