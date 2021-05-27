import { useState, useMemo, useCallback } from "react";
import Fuse from "fuse.js";

import { DEFAULT_DISPLAYED_POSTER_PREVIEW_COUNT } from "settings";

import { isTruthy } from "utils/types";
import { screeningRoomVideosSelector } from "utils/selectors";

import { isLoaded, useFirestoreConnect } from "hooks/useFirestoreConnect";
import { useDebounceSearch } from "hooks/useDebounceSearch";
import { useSelector } from "hooks/useSelector";

const emptyScreeningRoomVideosArray: never[] = [];

export const useConnectScreeningRoomVideos = (screeningRoomVenueId: string) => {
  useFirestoreConnect([
    {
      collection: "venues",
      doc: screeningRoomVenueId,
      subcollections: [{ collection: "screeningRoomVideos" }],
      storeAs: "screeningRoomVideos",
    },
  ]);
};

export const useScreeningRoomVideos = (screeningRoomVenueId: string) => {
  useConnectScreeningRoomVideos(screeningRoomVenueId);

  const screeningRoomVideos = useSelector(screeningRoomVideosSelector);

  return useMemo(
    () => ({
      screeningRoomVideos: screeningRoomVideos ?? emptyScreeningRoomVideosArray,
      isScreeningRoomVideosLoaded: isLoaded(screeningRoomVideos),
    }),
    [screeningRoomVideos]
  );
};

export const useScreeningRoom = (screeningRoomVenueId: string) => {
  const {
    screeningRoomVideos,
    isScreeningRoomVideosLoaded: isVideosLoaded,
  } = useScreeningRoomVideos(screeningRoomVenueId);

  const {
    searchInputValue,
    searchQuery,
    setSearchInputValue,
  } = useDebounceSearch();

  const [categoryFilter, _setCategoryFilter] = useState<string>();
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>();
  const [displayedVideosAmount, setDisplayedVideosAmount] = useState(
    DEFAULT_DISPLAYED_POSTER_PREVIEW_COUNT
  );

  const setCategoryFilter = useCallback((category: string) => {
    // Clear previously chosen subcategory
    setSubCategoryFilter(undefined);
    _setCategoryFilter(category);
  }, []);

  const unsetCategoryFilter = useCallback(() => {
    // Clear chosen subcategory, if any
    setSubCategoryFilter(undefined);
    _setCategoryFilter(undefined);
  }, []);

  const increaseDisplayedVideosAmount = useCallback(() => {
    setDisplayedVideosAmount(
      (prevPostersNumber) =>
        prevPostersNumber + DEFAULT_DISPLAYED_POSTER_PREVIEW_COUNT
    );
  }, []);

  const categoryList = useMemo(
    () =>
      Array.from(new Set(screeningRoomVideos.map((video) => video.category))),
    [screeningRoomVideos]
  );

  const filteredVideosByCategory = useMemo(
    () =>
      categoryFilter
        ? screeningRoomVideos.filter(
            (video) => video.category === categoryFilter
          )
        : screeningRoomVideos,
    [screeningRoomVideos, categoryFilter]
  );

  const subCategoryList = useMemo(
    () =>
      categoryFilter
        ? Array.from(
            new Set(filteredVideosByCategory.map((video) => video.subCategory))
          ).filter(isTruthy)
        : [],
    [filteredVideosByCategory, categoryFilter]
  );

  const filteredVideosBySubCategory = useMemo(
    () =>
      subCategoryFilter
        ? filteredVideosByCategory.filter(
            (video) => video.subCategory === subCategoryFilter
          )
        : filteredVideosByCategory,
    [filteredVideosByCategory, subCategoryFilter]
  );

  const fuseVideos = useMemo(
    () =>
      new Fuse(screeningRoomVideos, {
        keys: ["title"],
      }),
    [screeningRoomVideos]
  );

  const searchedVideos = useMemo(() => {
    if (!searchQuery)
      return filteredVideosBySubCategory.slice(0, displayedVideosAmount);

    return fuseVideos
      .search(searchQuery)
      .slice(0, displayedVideosAmount)
      .map((fuseSearchItem) => fuseSearchItem.item);
  }, [
    searchQuery,
    fuseVideos,
    filteredVideosBySubCategory,
    displayedVideosAmount,
  ]);

  const hasHiddenVideos = searchedVideos.length > displayedVideosAmount;

  return {
    videos: searchedVideos,
    isVideosLoaded,

    hasHiddenVideos,

    categoryList,
    subCategoryList,

    searchInputValue,
    categoryFilter,
    subCategoryFilter,

    increaseDisplayedVideosAmount,
    setSearchInputValue,
    setCategoryFilter,
    setSubCategoryFilter,
    unsetCategoryFilter,
  };
};
