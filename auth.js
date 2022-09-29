//import slashDB  from './slashdb';

class Auth {
  constructor() {
    this.authenticated = false;
    this.sdbClient = null;
  }

  /**
   * Method for log-in purposes takes username, password, and function to perform. Basic idea is to authenticate and then do something
   * like push route to restricted page of application.
   *
   * @param {String} username Username credential.
   * @param {String} password Password credential.
   * @param {function} fnc Function to be executed after valiadation of session.
   */
  async login(username, password, sdbClient, fnc) {
    this.sdbClient = sdbClient;
    this.sdbClient.username = username;
    if (!sdbClient.apiKey) {
      this.sdbClient.password = password;
    }
    else {
      console.warn('API key set, ignoring password');
    }
    try {
      await this.sdbClient.login()
        .then( () => {
          if (this.sdbClient.isAuthenticatedFlag) {
            this.authenticated = true;
            fnc();
          }
        });
    }
    catch(e) {
      this.authenticated = false;
      console.error(e);
      return;
    }
  }

  /**
   * Send logout request
   *
   * @param {function} fnc to be executed after logout. Eg. push route away from restricted area of application.
   */
  async logout(fnc) {
    this.sdbClient.logout();
    this.authenticated = false;
    fnc();
  }

}

export default new Auth();
