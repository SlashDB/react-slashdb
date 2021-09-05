import { default as auth } from './auth';

import { default as slashDB } from './slashdb';

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

import { default as setCookie, getCookie, delete_cookie } from './cookies';

export {
  auth,
  SlashDBContext,
  SlashDBProvider,
  SlashDBConsumer,
  setCookie,
  getCookie,
  delete_cookie,
  useSetUp,
  useDataDiscovery,
  useExecuteQuery,
  slashDB as default,
};
