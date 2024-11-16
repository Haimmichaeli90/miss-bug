export const userService = {
    query,
    login,
    logout,
    signup,
    remove,
    getById,
    getLoggedInUser,
    getEmptyCredentials
  }
  
  const STORAGE_KEY = 'loggedinUser'
  
  function query() {
    return axios.get('/api/user').then(res => res.data)
  }
  
  function login(credentials) {
    console.log('credentials', credentials)
    return axios
      .post('/api/login', credentials)
      .then(res => res.data)
      .then(user => {
        console.log('user', user)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        return user
      })
  }
  
  function signup(signupInfo) {
    return axios
      .post('/api/signup', signupInfo)
      .then(res => res.data)
      .then(user => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        return user
      })
  }
  
  function remove(userId) {
    console.log(userId)
    return axios.delete('/api/user/' + userId)
  }
  
  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    return axios.post('/api/logout')
  }
  
  function getById(userId) {
    return axios
      .get('/api/user/' + userId)
      .then(res => res.data)
      .catch(err => console.log(err))
  }
  
  function getEmptyCredentials() {
    return {
      username: '',
      password: '',
      fullname: ''
    }
  }
  
  function getLoggedInUser() {
    return _getUserFromSession()
  }
  
  function _getUserFromSession() {
    const entity = sessionStorage.getItem(STORAGE_KEY)
    return JSON.parse(entity)
  }
  