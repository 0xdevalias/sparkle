import calendarGenerator, { ICalCalendar } from "ical-generator";

import { AnyVenue, WorldEvent } from "types/venues";
import { WorldSlug } from "types/world";

import { eventEndTime, eventStartTime } from "utils/event";
import { WithId } from "utils/id";
import { generateAttendeeInsideUrl } from "utils/url";

export interface CreateCalendarProps {
  events: WorldEvent[];
  worldSlug?: WorldSlug;
  relatedVenues: WithId<AnyVenue>[];
}

export const createCalendar = ({
  events,
  worldSlug,
  relatedVenues,
}: CreateCalendarProps): ICalCalendar => {
  const calendar = calendarGenerator();

  events.forEach((event) => {
    const space = relatedVenues.find(({ id }) => id === event.spaceId);
    calendar.createEvent({
      start: eventStartTime({ event }),
      end: eventEndTime({ event }),
      organizer: `${event.host || "Unknown"} <undefined>`, // string format: "name <email>". email cannot be blank
      description: event.description,
      summary: event.name,
      url: generateAttendeeInsideUrl({
        worldSlug: worldSlug,
        spaceSlug: space?.slug,
        absoluteUrl: true,
      }),
    });
  });

  return calendar;
};

export interface DownloadCalendarProps {
  calendar: ICalCalendar;
  calendarName: string;
}

export const downloadCalendar = ({
  calendar,
  calendarName,
}: DownloadCalendarProps): void => {
  const outputFileName = `${calendarName}.ics`;

  const link = document.createElement("a");
  link.download = outputFileName;
  link.href = calendar.toURL();
  link.click();
};
