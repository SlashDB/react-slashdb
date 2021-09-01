import React, { createContext } from 'react';
/**
 * Create custom Context to be used with provider, consumer and useContext hook. For param sharing without need to pass it
 * down from parent to child at each level of the component tree.
 */
export const SlashDBContext = createContext({});

/**
 * Custom React component for build in use of Provider from createContext. Use: <SlashDBProvider params... >....children </SlashDBProvider>
 * by defining SlashDBProvider element in project we can pass params to it which will be accessable thoughout project.
 * See SlashDBConsumer for more info on how to use params passed. I.e. Wrap App component so that context data is avaliable
 * throughout application.
 *
 * @param {Object} param0 Holds two params: baseUrl (a.k.a. slashdb server to be accessed. E.g. https://demo.slashdb.com)
 * and setUpOptions. setUpOptions is an object of key value pairs. dataFormatExt and apiKey are the keys handleable at this stage
 * of development.
 * @param {String} param0.baseUrl Url of slashDB server.
 * @param {{}} param0.setUpOptions Params for set up of connections such as dataFormat and API key. dataFormatExt: "value", apiKey: "value"
 */
export const SlashDBProvider = ({ baseUrl, setUpOptions, children }) =>
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
export const SlashDBConsumer = SlashDBContext.Consumer;
