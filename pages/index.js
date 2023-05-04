import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import Router from 'next/router'
import { useEffect, useState } from 'react'

export default function Home() {
  useEffect(() => {
    fetch("/api/checklogin").then(async (res) => {
      const resJSON = await res.json();

      if (resJSON.isLoggedIn === true) return Router.push("/dashboard");
    })
  }, []);

  return (
    <div className={styles.home}>
      <section id={styles.first_section}>
        <h1 className={styles.fade_in}>PassSafe Manager</h1>
        <p className={styles.fade_in}>Secure and easy-to-use password manager.</p>

        <br/>
        <br/>
        <div style={{display: "flex", gap:"1rem", justifyContent: "center"}}>
          <Link className={styles.fade_in} href="/register">Register</Link>
        </div>
      </section>
    </div>
  )
}
