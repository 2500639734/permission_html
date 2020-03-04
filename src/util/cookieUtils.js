/**
 * 登录token存放在cookie中的key
 */
const loginTokenKey = 'login_token'

/**
 * 获取cookie
 * @param {cookieName} cookieName
 */
function getCookie (cookieName) {
  if (document.cookie === undefined || document.cookie == null || document.cookie === '') {
    return null
  }
  const cookies = document.cookie.split(';')
  if (cookieName === undefined || cookieName == null || cookieName === '') {
    return null
  }
  if (cookies === undefined || cookies == null || cookies === '') {
    return null
  }
  const token = cookies.forEach(cookieKV => {
    const cookieKey = cookieKV.split('=')[0]
    const cookieValue = cookieKV.split('=')[1]
    if (cookieKey === loginTokenKey) {
      return cookieValue
    }
  })
  return token
}

/**
 * 删除cookie
 * @param {cookieName} cookieName
 */
function deleteCookie (cookieName) {
  const cookieVal = getCookie(cookieName)
  if (cookieVal === undefined || cookieVal == null || cookieVal === '') {
    var exp = new Date()
    exp.setTime(exp.getTime() - 1)
    document.cookie = cookieName + '=' + cookieVal + ';expires=' + exp.toGMTString()
  }
}

export default {
  loginTokenKey,
  getCookie,
  deleteCookie
}
