import { createContext, useReducer, useEffect } from 'react'
import { LOGIN_ACTION, LOGOUT_ACTION,USER_ROLE } from './Actions'

export const AuthContext = createContext()

export const authReducer = (state, action) => {
  switch (action.type) {
    case LOGIN_ACTION:
      return { ...state, user: action.payload }
    case LOGOUT_ACTION:
      return { user: null }
    case USER_ROLE:
      return {  ...state,role: action.payload }
    default:
      return state
  }
}

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    role: null
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))

    if (user) {
      dispatch({ type: LOGIN_ACTION, payload: user })
       dispatch({ type: USER_ROLE, payload: user.userRole.name })
    }
  }, [])


  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )

}