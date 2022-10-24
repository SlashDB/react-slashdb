import { default as auth } from './auth';

import {
  default as useSetUp,
  useDataDiscovery,
  useExecuteQuery,
} from './hooks';

import {
  default as SlashDBProvider,
  SlashDBContext,
  SlashDBConsumer,
} from './Context';

export {
  auth,
  SlashDBContext,
  SlashDBProvider,
  SlashDBConsumer,
  useSetUp,
  useDataDiscovery,
  useExecuteQuery
};
