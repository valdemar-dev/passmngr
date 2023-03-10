import styles from '@/styles/Home.module.css'
import Router from 'next/router'
import { useEffect, useState } from 'react'

export default function Home() {

  const [isLoading, setLoading] = useState(false);

   useEffect(() => {
    setLoading(true)
    fetch("/api/checklogin")
      .then((res) => res.json())
        .then((data) => {
          if (data.isLoggedIn === false && Router.pathname !== "/register") Router.push("/login");
          else if (data.isLoggedIn === true) {
            Router.push("/dashboard");              
          }
          setLoading(false)

        })
  }, []); 
  return (
    <>

    </>
  )
}
