export const randomNum = (max = 100): number => Math.floor(Math.random() * max)

export const randomStr = (len = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charsLength = chars.length
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength))
  }

  return result
}

export const getNameInitials = (fullName: string, defaultValue = '??') =>
  fullName
    ? fullName
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
    : defaultValue

export const parseDateLocal = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}
