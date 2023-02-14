import { axios } from './axios-instance'

const uris = {
  createVerifyPhone: 'api/user-auth/',
  users: 'api/users/',
  userById: (id: string) => `api/users/${id}/`,
  login: 'api/login/',
}

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
}

export const postLogin = async ({ email, password }: { email: string; password: string }) => {
  const res = await axios.post(uris.login, {
    email,
    password,
  })
  return res.data
}

export const postCreateUser = async (data: {
  email: string
  password: string
  firstName: string
  lastName: string
}) => {
  const res = await axios.post(uris.users, data)
  if (res.status !== 200 && res.status !== 201) {
    throw new Error('Failed to properly sign up, try again later')
  }
  // will send a text message to the given phone number, we don't get any response other that status code here.
  return res.data
}

export const getUserInfo = async (id: string) => {
  const res = await axios.get(uris.userById(id))
  return res.data
}

export const refreshToken = async () => {
  //TODO:
  return {}
}

export const verifyToken = async () => {
  //TODO
  return {}
}
