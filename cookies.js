/**
 * Set cookie with params based on passed values to function. Main use in SDK for storing username for auth needs.
 *
 * @param {String} cname Name of cookie.
 * @param {String} cvalue Value of cookie.
 */
export const setCookie = (cname, cvalue) => {
  var cookieExpires = new Date();
  cookieExpires.setTime(cookieExpires.getTime() + 1 * 12 * 60 * 60 * 1000);
  document.cookie = `${cname}=${cvalue}; expires=${cookieExpires}; Path=/;`;
};

/**
 * Look at cookie with name matching, cname param and get its value.
 *
 * @param {String} cname Name of cookie
 * @return {String}  Value of cookie with name matching inncoming param cname.
 */
export function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

/**
 * Delete cookie with name matching cname param.
 * 
 * @param {String} cname Name of cookie.
 */
export function delete_cookie(cname) {
  document.cookie = cname + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
