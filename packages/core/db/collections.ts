import {
  type Collections,
  DocumentVersions,
} from '../eventSourcing/eventSourcingEventsSchema';

export const getCollections = (): Collections => {
  if (process.env.MONGODB_PLAYERS_COLLECTION_NAME === undefined) {
    throw Error('Define player collection');
  }
  return {
    playersCollection: process.env.MONGODB_PLAYERS_COLLECTION_NAME,
  };
};

export const getCurrentDocumentVersion = (): DocumentVersions => {
  if (process.env.PLAYERS_DOCUMENT_CURRENT_VERSION === undefined) {
    throw Error('Define PLAYERS_DOCUMENT_CURRENT_VERSION');
  }

  return {
    players: parseInt(process.env.PLAYERS_DOCUMENT_CURRENT_VERSION),
  };
};
