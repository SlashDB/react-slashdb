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
 * @param {Object} setUpOptions holds the setup parameter: setUpOptions is an object of key value pairs.
 * @param {string} setUpOptions.host - hostname/IP address of the SlashDB instance, including protocol and port number (e.g. http://192.168.1.1:8080)
 * @param {string} setUpOptions.username - optional username to use when connecting to SlashDB instance using password based login
 * @param {string} setUpOptions.password - optional password associated with username
 * @param {string} setUpOptions.apiKey - optional API key associated with username
 * @param {Object} setUpOptions.config.sso - optional settings to login with Single Sign-On
 * @param {string} setUpOptions.config.sso.idpId - optional identity provider id configured in SlashDB
 * @param {string} setUpOptions.config.sso.redirectUri - optional redirect uri to redirect browser after sign in
 * @param {boolean} setUpOptions.config.sso.popUp - optional flag to sign in against the identity provider with a Pop Up window (false by default)
 */
const SlashDBProvider = ({ setUpOptions = null, children }) =>
  React.createElement(
    SlashDBContext.Provider,
    { value: { setUpOptions } },
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