/*
 * getCookie
 *
 * Use this method for getting cookie values (i.e. for getting the CSRF token).
 *
 * Usage:
 *   const csrfToken = getCookie("csrftoken");
 */
export default function getCookieTS(cname:string):string {
  var name = cname + '='
  console.log('name: ', name)
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  console.log('decoded cookie: ', ca)
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') {
      console.log('skipping blank space')
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      console.log('condition met!')
      console.log('returning: ', c.substring(name.length, c.length))
      return c.substring(name.length, c.length)
    }
  }
  return ''
}
