import { Navigate } from 'react-router-dom'
import { useFollowupRoute } from 'src/utils/auth'
import { useAuth } from 'src/stores/auth'

/**
 * Determines what should it render on hitting `/`. Based on whether the user is logged in or not. You can still add public routes on /*
 */
export const AppOrAuth = () => {
  const token = useAuth.use.token()

  const followupRoute = useFollowupRoute()

  const isAuth = Boolean(token)
  //TODO: modify this according to what will the main page be
  if (isAuth) {
    return <Navigate to={followupRoute} />
  }
  return <Navigate to="/log-in" state={{ from: followupRoute }} />
}
