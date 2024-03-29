import styles from "@/styles/Login.module.css";

import hash from '@/utils/hash';
import Router from 'next/router'

import Cookies from 'universal-cookie'
const cookies = new Cookies();

import crypto from "crypto";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const infoTextRef = useRef();

  useEffect(() => {
    fetch("/api/checklogin").then(async (res) => {
      if (!res.ok) return;

      const resJSON = await res.json();
      if (resJSON.isLoggedIn === true) return Router.push("/dashboard");
    })
  }, []);

  const highlightInput = ({ current }, text) => {
      const infoText = infoTextRef.current;

      infoText.innerHTML = text;

      current.style.borderBottom = "2px solid #ff3021";

      current.style.borderBottomLeftRadius = "0px";
      current.style.borderBottomRightRadius = "0px";

      return setTimeout(() => {
        current.style.borderBottomLeftRadius = "5px";
        current.style.borderBottomRightRadius = "5px";

        current.style.borderBottom = "2px solid transparent";

        infoText.innerHTML = "";
      }, 3000)
  };

  const checkPassword = async (event) => {
    event.preventDefault()
  
    const email = event.target[0].value;
    const password = event.target[1].value;

    const hashedEmail = hash(email);
    const hashedPassword = hash(password);

    const data = {
      email: hashedEmail,
      password: hashedPassword,
    };

    const JSONdata = JSON.stringify(data)

    const endpoint = '/api/login';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    };

    const response = await fetch(endpoint, options)

    const result = await response.json();
    
    if (result.isPasswordCorrect === true) {
      // use next headers instead of universal-cookie?
      cookies.set("sessionToken", result.sessionToken, { path: "/", maxAge: 43200 });
        
      const vaultKey = hash(`${email}${password}`);
      localStorage.setItem("vaultKey", vaultKey.slice(0, vaultKey.length / 2));

      Router.push("/dashboard");
    } else {
       highlightInput(emailRef, "");
       highlightInput(passwordRef, "Incorrect password or email!");
    }
  }

  return (
    <div className={styles.login}>
      <div id={styles.login_form}>
        <div id={styles.login_content_wrapper}>
          <div id={styles.login_form_header}>
            <h2>Login</h2> 
            <span id={styles.login_info_text} ref={infoTextRef}></span>
          </div>

          <form onSubmit={event => {checkPassword(event)}}>
            <input type="email" placeholder='email' ref={emailRef} required/>
            <input type="password" placeholder='password' ref={passwordRef} required/>
            <button type="submit">Login</button>
          </form>

          <p>
            Don't have an account?
            <Link href="/register" style={{float: "right",}}> Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
