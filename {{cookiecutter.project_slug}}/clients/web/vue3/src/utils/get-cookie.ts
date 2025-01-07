/*
 * getCookie
 *
 * Use this method for getting cookie values (i.e. for getting the CSRF token).
 *
 * Usage:
 *   const csrfToken = getCookie("csrftoken");
 */
export const getCookie = (cname: string): string => {
  const name = cname + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}
