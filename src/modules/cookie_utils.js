const oldestDate = new Date(0);
const oldestDateUtcString = oldestDate.toUTCString();

export default {
  setCookie(key, value, expireDate = null) {
    let cookie = key + '=' + value + ';';
    if (expireDate !== null) {
      let expireDateUtcString = expireDate.toUTCString();
      cookie += 'expires=' + expireDateUtcString + ';';
    }
    document.cookie = cookie;
  },

  getCookie(key) {
    let cookiePairs = document.cookie.split(';').map(cookiePair => cookiePair.trim());
    let foundCookiePair = cookiePairs.find(cookiePair => cookiePair.startsWith(key + '='))
    if (foundCookiePair === undefined) return null;
    return foundCookiePair.split('=')[1];
  },

  deleteCookie(key) {
    document.cookie = key + '=; expires=' + oldestDateUtcString + ';';
  },
}