import { useEffect, useState } from 'react'

export default function Home() {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const id = localStorage.getItem('userId')
    setUserId(id)
  }, [])

  const logout = () => {
    localStorage.removeItem('userId')
    setUserId(null)
  }

  return (
    <div>
      <h2>Home</h2>
      {userId ? (
        <>
          <p>Logged in as userId: {userId}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  )
} 