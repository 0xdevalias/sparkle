import { CSSProperties } from "react";

import { HAS_ROOMS_TEMPLATES } from "settings";

import { AuditoriumSectionPath } from "types/auditorium";

import { WithId } from "utils/id";
import { Branded } from "utils/types";

import { GameOptions } from "components/templates/AnimateMap/configs/GameConfig";

import { Banner } from "./banner";
import { Poster } from "./posters";
import { Quotation } from "./Quotation";
import { Room } from "./rooms";
import { Table } from "./Table";
import { UpcomingEvent } from "./UpcomingEvent";
import { User, UserStatus } from "./User";
import { VenueAccessMode } from "./VenueAcccess";
import { VideoAspectRatio } from "./VideoAspectRatio";

export type SpaceSlug = Branded<string, "SpaceSlug">;

// These represent all of our templates (they should remain alphabetically sorted, deprecated should be separate from the rest)
// @debt unify this with VenueTemplate in functions/venue.js + share the same code between frontend/backend
export enum VenueTemplate {
  auditorium = "auditorium",
  conversationspace = "conversationspace",
  firebarrel = "firebarrel",
  jazzbar = "jazzbar",
  partymap = "partymap",
  animatemap = "animatemap",
  posterhall = "posterhall",
  posterpage = "posterpage",
  screeningroom = "screeningroom",
  viewingwindow = "viewingwindow",
  zoomroom = "zoomroom",

  /**
   * @deprecated Legacy template is going to be removed soon, try VenueTemplate.viewingwindow instead?
   */
  artpiece = "artpiece",
  /**
   * @deprecated Legacy template is going to be removed soon, try VenueTemplate.viewingwindow instead?
   */
  embeddable = "embeddable",
  /**
   * @deprecated Legacy template removed, perhaps try VenueTemplate.auditorium instead?
   */
  audience = "audience",
  /**
   * @deprecated Legacy template removed
   */
  artcar = "artcar",
  /**
   * @deprecated Legacy template removed
   */
  friendship = "friendship",
  /**
   * @deprecated Legacy template removed, perhaps try VenueTemplate.partymap instead?
   */
  themecamp = "themecamp",
  /**
   * @deprecated Legacy template removed
   */
  performancevenue = "performancevenue",
  /**
   * @deprecated Legacy template removed
   */
  avatargrid = "avatargrid",
  /**
   * @deprecated Legacy template removed, perhaps try VenueTemplate.partymap instead?
   */
  preplaya = "preplaya",

  /**
   * @deprecated Legacy template removed, perhaps try VenueTemplate.partymap instead?
   */
  playa = "playa",
}

export type PortalTemplate = VenueTemplate | "external";

// This type should have entries to exclude anything that has it's own specific type entry in AnyVenue below
export type GenericVenueTemplates = Exclude<
  VenueTemplate,
  | VenueTemplate.embeddable
  | VenueTemplate.jazzbar
  | VenueTemplate.animatemap
  | VenueTemplate.partymap
  | VenueTemplate.posterpage
  | VenueTemplate.themecamp
  | VenueTemplate.auditorium
  | VenueTemplate.viewingwindow
>;

// We shouldn't include 'Venue' here, that is what 'GenericVenue' is for (which correctly narrows the types; these should remain alphabetically sorted, except with GenericVenue at the top)
export type AnyVenue =
  | GenericVenue
  | AuditoriumVenue
  | AnimateMapVenue
  | EmbeddableVenue
  | JazzbarVenue
  | PartyMapVenue
  | PosterPageVenue
  | ViewingWindowVenue;

// --- VENUE V2
export interface Venue_v2 extends Venue_v2_Base, VenueAdvancedConfig {}

export interface Venue_v2_Base {
  name: string;
  slug: string;
  config: {
    landingPageConfig: {
      subtitle?: string;
      description?: string;
      coverImageUrl: string;
    };
  };
  host: {
    icon: string;
  };
  owners?: string[];
  theme?: {
    primaryColor: string;
    backgroundColor?: string;
  };
  id: string;
  rooms?: Room[];
  mapBackgroundImageUrl?: string;
  worldId: string;
}

export interface VenueAdvancedConfig {
  columns?: number;
  radioStations?: string | string[]; // single string on form, array in DB
  roomVisibility?: RoomVisibility;
  showGrid?: boolean;
  showRadio?: boolean;
  parentId?: string;
  showUserStatus?: boolean;
  userStatuses?: UserStatus[];
  enableJukebox?: boolean;
}

// @debt refactor this into separated logical chunks? (eg. if certain params are only expected to be set for certain venue types)
// @debt The following keys are marked as required on this type, but i'm not sure they should be:
//   termsAndConditions, width, height
export interface BaseVenue {
  template: VenueTemplate;
  parentId?: string;
  name: string;
  slug: SpaceSlug;
  access?: VenueAccessMode;
  config?: VenueConfig;
  host?: {
    icon: string;
  };
  owners?: string[];
  iframeUrl?: string;
  autoPlay?: boolean;
  events?: Array<UpcomingEvent>; //@debt typing is this optional? I have a feeling this no longer exists @chris confirm
  placement?: VenuePlacement;
  zoomUrl?: string;
  mapBackgroundImageUrl?: string;
  placementRequests?: string;
  radioStations?: string[];
  radioTitle?: string;
  dustStorm?: boolean;
  activity?: string;
  banner?: Banner;
  playaIcon?: PlayaIcon;
  playaIcon2?: PlayaIcon;
  miniAvatars?: boolean;
  samlAuthProviderId?: string;
  showAddress?: boolean;
  showGiftATicket?: boolean;
  columns?: number;
  rows?: number;
  nightCycle?: boolean;
  hasPaidEvents?: boolean;
  profileAvatars?: boolean;
  hideVideo?: boolean;
  showGrid?: boolean;
  roomVisibility?: RoomVisibility;
  rooms?: Room[];
  width: number;
  height: number;
  description?: {
    text: string;
  };
  subtitle?: string;
  showLearnMoreLink?: boolean;
  start_utc_seconds?: number;
  end_utc_seconds?: number;
  ticketUrl?: string;
  showReactions?: boolean;
  isReactionsMuted?: boolean;
  showShoutouts?: boolean;
  auditoriumColumns?: number;
  auditoriumRows?: number;
  sectionsCount?: number;
  videoAspect?: VideoAspectRatio;
  termsAndConditions: TermOfService[];
  userStatuses?: UserStatus[];
  showRadio?: boolean;
  showUserStatus?: boolean;
  createdAt?: number;
  recentUserCount?: number;
  recentUsersSample?: WithId<User>[];
  recentUsersSampleSize?: number;
  updatedAt?: number;
  worldId: string;
  enableJukebox?: boolean;
  requiresDateOfBirth?: boolean;
  showBadges?: boolean;
}

export interface GenericVenue extends BaseVenue {
  template: GenericVenueTemplates;
}

export interface AnimateMapVenue extends BaseVenue {
  id: string;
  gameOptions: GameOptions;
  relatedPartymapId: string;
  template: VenueTemplate.animatemap;
}

// @debt which of these params are exactly the same as on Venue? Can we simplify this?
// @debt we probably don't want to include id directly here.. that's what WithId is for
export interface PartyMapVenue extends BaseVenue {
  id: string;
  template: VenueTemplate.partymap | VenueTemplate.themecamp;

  // @debt The following keys are marked as required on this type, but i'm not sure they should be:
  //   url, name (we seem to be using icon to hold the URL of the image)
  host?: {
    url: string;
    icon: string;
    name: string;
  };

  description?: {
    text: string;
    program_url?: string;
  };

  start_utc_seconds?: number;
  duration_hours?: number;
  party_name?: string;
  map_viewbox?: string;
  password?: string;
  admin_password?: string;
  rooms?: Room[];
}

export interface JazzbarVenue extends BaseVenue {
  template: VenueTemplate.jazzbar;
  iframeUrl: string;
  logoImageUrl: string;
  host: {
    icon: string;
  };
  enableJukebox?: boolean;
}

export interface EmbeddableVenue extends BaseVenue {
  template: VenueTemplate.embeddable;
  iframeUrl?: string;
  containerStyles?: CSSProperties;
  iframeStyles?: CSSProperties;
  iframeOptions?: Record<string, string>;
}

export interface ViewingWindowVenue extends BaseVenue {
  template: VenueTemplate.viewingwindow;
  iframeUrl?: string;
  containerStyles?: CSSProperties;
  iframeStyles?: CSSProperties;
  iframeOptions?: Record<string, string>;
  isWithParticipants?: boolean;
}

export interface PosterPageVenue extends BaseVenue {
  template: VenueTemplate.posterpage;
  poster?: Poster;
  isLive?: boolean;
}

export interface AuditoriumVenue extends BaseVenue {
  template: VenueTemplate.auditorium;
  title?: string;
}

export interface AnimateMapVenue extends BaseVenue {
  template: VenueTemplate.animatemap;
  playerioGameId: string;
  playerioMaxPlayerPerRoom?: number;
  playerioFrequencyUpdate?: number;
  //@dept Right now advanced mode in develop, don't add this flag to venue!
  playerioAdvancedMode?: boolean;
}

interface TermOfService {
  name: string;
  text: string;
  link?: string;
}

export enum RoomVisibility {
  hover = "hover",
  count = "count",
  nameCount = "count/name",
  none = "none",
  unclickable = "unclickable",
}

export interface VenueConfig {
  theme: {
    primaryColor: string;
    backgroundColor?: string;
  };

  // @debt landingPageConfig should probably be 'potentially undefined', or is it guaranteed to exist everywhere?
  landingPageConfig: VenueLandingPageConfig;
  redirectUrl?: string;
  memberEmails?: string[];
  tables?: Table[];
}

// @debt The following keys are marked as required on this type, but i'm not sure they should be:
//   presentation, checkList
export interface VenueLandingPageConfig {
  coverImageUrl: string;
  subtitle?: string;
  description?: string;
  presentation: string[];
  bannerImageUrl?: string;
  checkList: string[];
  iframeUrl?: string;
  joinButtonText?: string;
  quotations?: Quotation[];
}

export interface VenuePlacement {
  x: number;
  y: number;
  addressText?: string;
  state?: VenuePlacementState;
}

export enum VenuePlacementState {
  SelfPlaced = "SELF_PLACED",
  AdminPlaced = "ADMIN_PLACED",
  Hidden = "HIDDEN",
}

export interface PlayaIcon {
  x: number;
  y: number;
  fire: boolean;
  visible: boolean;
  className: string;
  clickable: boolean;
  venueId: string;
}

export interface WorldEvent {
  name: string;
  startUtcSeconds: number;
  description: string;
  durationMinutes: number;
  host: string;
  id: string;
  orderPriority?: number;
  liveAudience?: number;
  spaceId: string;
  worldId: string;
}

export interface ScheduledEvent extends WorldEvent {
  isSaved: boolean;
  venueIcon: string;
  liveAudience: number;
}

export interface VenueTablePath {
  venueId: string;
  tableReference: string;
}

export type TableSeatedUsersVenuesTemplates =
  | VenueTemplate.jazzbar
  | VenueTemplate.conversationspace;

export type RecentSeatedUserData<T extends VenueTemplate> = {
  template: T;
  venueId: string;
  venueSpecificData: T extends VenueTemplate.auditorium
    ? Pick<AuditoriumSectionPath, "sectionId">
    : T extends TableSeatedUsersVenuesTemplates
    ? {}
    : never;
};

export interface RecentSeatedUserTimestamp<T extends VenueTemplate>
  extends RecentSeatedUserData<T> {
  lastSittingTimeMs: number;
}

export const isVenueWithRooms = (venue: AnyVenue): venue is PartyMapVenue =>
  HAS_ROOMS_TEMPLATES.includes(venue.template);

export const isPartyMapVenue = (venue: AnyVenue): venue is PartyMapVenue =>
  venue.template === VenueTemplate.partymap;

export const isNotPartyMapVenue = (venue: AnyVenue) =>
  venue.template !== VenueTemplate.partymap;

export const urlFromImage = (
  defaultValue: string,
  filesOrUrl?: FileList | string
) => {
  if (typeof filesOrUrl === "string") return filesOrUrl;
  return filesOrUrl && filesOrUrl.length > 0
    ? URL.createObjectURL(filesOrUrl[0])
    : defaultValue;
};
