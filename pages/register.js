import styles from "@/styles/Register.module.css";

import hash from "@/utils/hash";
import Link from "next/link";
import Router from "next/router";
import { useRef } from "react";

export default function Register() {
  const passwordValidatorRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const infoTextRef = useRef();

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

  const createAccount = async (event) => {
    event.preventDefault();

    const email = event.target[0].value;
    const password = event.target[1].value;
    
    if (!email) return highlightInput(emailRef, "Enter an email!");
    if (!password) return highlightInput(passwordRef, "Enter a password!");

    if (password.length < 12) {
      return(
        highlightInput(passwordRef, "Min 12 characters!")
      )
    } else if (/[A-Z]/g.test(password) === false) {
      return(
        highlightInput(passwordRef, "Min 1 capital letter!")
      )
    } else if (/[0-9]/g.test(password) === false) {
      return(
        highlightInput(passwordRef, "Min 1 number!")
      )
    }

    const hashedPassword = hash(password);
    const hashedEmail = hash(email);

    const data = {
      password: hashedPassword,
      email: hashedEmail,
    };

    const endpoint = "/api/register";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(endpoint, options);
  
    if (response.status === 200) {
      Router.push("/login")
    } else if (response.status === 422) {
      highlightInput(emailRef, "");
      return highlightInput(passwordRef, "Account already exists!");
    }
  }


  return(
    <div className={styles.register}>
      <div id={styles.register_form}>
        <div id={styles.register_content_wrapper}>
          <div id={styles.register_form_header}>
            <h2>Register</h2> 
            <span id={styles.register_info_text} ref={infoTextRef}></span>
          </div>

          <form onSubmit={event => {createAccount(event)}} autoComplete={"off"}>
            <input type="email" placeholder='email' ref={emailRef} autoComplete="off"/>
            <br/>
            <input type="password" placeholder='password' ref={passwordRef} autoComplete="off"/>
            <span ref={passwordValidatorRef}></span>
            <br/>
            <button type="submit">Register</button>
          </form>

          <p>
            Have an account already?
            <Link href="/login" style={{float: "right",}}> Login</Link>
          </p>
        </div>

        <img src={"/blob1.svg"} id={styles.form_blob}/>
      </div>
    </div>
  );
}
