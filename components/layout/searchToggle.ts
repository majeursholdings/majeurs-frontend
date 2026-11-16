/**
 * Marks the header's search button: pressing it toggles the panel itself, so SearchPanel doesn't treat it as a
 * press "outside". Its own module so HeaderActions can read it without importing the panel (loaded on demand).
 */
export const SEARCH_TOGGLE_ATTR = "data-search-toggle";
