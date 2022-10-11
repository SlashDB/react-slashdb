import React, { createContext } from 'react';
/**
 * Create custom Context to be used with provider, consumer and useContext hook. For param sharing without need to pass it
 * down from parent to child at each level of the component tree.
 */
const SlashDBContext = createContext({});

/**
 * Custom React component for build in use of Provider from createContext. Use: <SlashDBProvider params... >....children </SlashDBProvider>
 * by defining SlashDBProvider element in project we can pass params to it which will be accessable thoughout project.
 * See SlashDBConsumer for more info on how to use params passed. I.e. Wrap App component so that context data is avaliable
 * throughout application.
 *
 * @param {Object} param0 holds two parameters: baseUrl (hostname/IP of SlashdDB instance to be accessed, e.g. https://demo.slashdb.com)
 * and setUpOptions. setUpOptions is an object of key value pairs. 'apiKey' is the only key that can be set currently
 * of development.
 * @param {string} param0.baseUrl URL of SlashDB instance
 * @param {Object} param0.setUpOptions parameters for connection { apiKey: "somevalue" }
 */
const SlashDBProvider = ({ baseUrl, setUpOptions, children }) =>
  React.createElement(
    SlashDBContext.Provider,
    { value: { baseUrl, setUpOptions } },
    children
  );

/**
 * Use to access params passed though use of SlashDBProvider.
 *
 * useContext hook from React can be used instead of SlashDBConsumer in practice
 * such as:
 * import { useContext} from 'react';
 * import { SlashDBContext } from './Context';
 * useContext(SlashDBContext);
 */
const SlashDBConsumer = SlashDBContext.Consumer;

export { SlashDBProvider as default, SlashDBContext,  SlashDBConsumer};