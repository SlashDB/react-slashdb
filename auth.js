import { slashDB } from './slashdb';

class Auth {
  constructor() {
    this.authenticated = slashDB.getIsAuthenticated();
  }

  /**
   * Method for log-in purposes takes username, password, and function to perform. Basic idea is to authenticate and then do something
   * like push route to restricted page of application.
   *
   * @param {String} username Username credential.
   * @param {String} password Password credential.
   * @param {function} fnc Function to be executed after valiadation of session.
   */
  async login(username, password, fnc) {
    await slashDB
      .authenticateCookieSessionLogin(username, password)
      .then(() => {
        this.authenticated = slashDB.getIsAuthenticated();
      })
      .then(fnc);
  }

  /**
   * Send logout request and terminate cookie.
   *
   * @param {function} fnc to be executed after logout. Eg. push route away from restricted area of application.
   */
  async logout(fnc) {
    await slashDB
      .authenticateCookieSessionLogout()
      .then(() => {
        this.authenticated = slashDB.getIsAuthenticated();
      })
      .then(fnc);
  }

  /**
   * Check if user is authenticated still.
   *
   * @return {boolean} True or false value based on if user is still validly authenticated.
   */
  async isAuthenticated() {
    var state;
    state = await slashDB.isAuthenticated();
    return state;
  }
}

export default new Auth();
