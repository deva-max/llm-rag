export const TOAST_MESSAGES = {
  SUCCESS: {
    CONFIG_SAVED: 'Settings saved successfully!',
    URL_INGESTED: 'URL ingested into knowledge base successfully.',
    TEXT_INGESTED: 'Document ingested successfully.',
    MEMORY_SAVED: 'Memory added successfully.',
    MEMORY_DELETED: 'Memory removed.'
  },
  ERROR: {
    NETWORK_ERROR: 'Network error. Please try again.',
    CONFIG_SAVE_FAILED: 'Failed to save settings.',
    INGEST_FAILED: 'Failed to ingest content.',
    MEMORY_ACTION_FAILED: 'Memory action failed.',
    FETCH_FAILED: 'Failed to fetch data.',
    SEARCH_FAILED: 'Search failed.'
  },
  INFO: {
    SEARCHING: 'Searching knowledge base...',
    GENERATING: 'Synthesizing response...',
    INGESTING: 'Ingesting document...'
  }
}
