import { removeSdbClients, checkClientAuthStatus } from './hooks.js';


/** 
 * Authentication singleton for logging in and out of SlashDB instances.  
 */
class Auth {
  constructor() {
  }

  /**
   * Log into a SlashDB instance with a username and password.  Executes provided function on successful login
   *
   * @param {string} username user to log into SlashDB instance with
   * @param {string} password password for user
   * @param {SlashDBClient} sdbClient a SlashDBClient object containing SlashDB host config, obtained from calling the useSetUp hook
   * @param {function} fnc function to be executed after successful login
   */
  // async login(username, password, sdbClient, fnc) {
    async login(sdbClient, fnc) {
    try {
      // await sdbClient.login(username, password)
      await sdbClient.login()
        .then( () => {
          if (sdbClient.isAuthenticated()) {
            fnc();
          }
        });
    }
    catch(e) {
      console.error(e);
      return;
    }
  }

  /**
   * Log out of SlashDB instance
   *
   * @param {function} fnc to be executed after logout. Eg. push route away from restricted area of application.
   * @param {string} [instanceName] instance to log out; if not provided, all registered instances are logged out
   */
  async logout(fnc, instanceName = undefined) {
    removeSdbClients(instanceName);
    fnc();
  }

  /**
   * Check if client authenticated
   *
   * @param {string} [instanceName] instance to log out; if not provided, the default instance is checked
   * @returns {boolean} flag indicating if client is currently authenticated to SlashDB instance
   */  
  async clientIsAuthenticated(instanceName = 'default') {
    const status = await checkClientAuthStatus(instanceName);
    return status;
  }
}

export default new Auth();
