import '@/styles/globals.css'
import Router from "next/router";
import { useEffect, useState } from 'react';

import Cookies from 'universal-cookie';
const cookies = new Cookies();

import Layout from '@/components/Layout';

export default function App({ Component, pageProps }) {
  const [isLoading, setLoading] = useState(false)

  const onBeforeUnload = async (event) => {
    event.preventDefault();

    const sessionToken = cookies.get("sessionToken");

    // if the cookie hasnt yet been deleted, set its age to 10 seconds
    if (sessionToken !== null) {
      return cookies.set("sessionToken", sessionToken, { maxAge: 10, path: "/", });
    }

    // if the cookie has been deleted, log out the user and clear localstorage
    // for security reasons.
    const endpoint = "/api/logout";

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    await fetch(endpoint, options);

    localStorage.clear();
  };

  useEffect(() => {
    setLoading(true)
    fetch("/api/checklogin")
      .then((res) => res.json())
        .then((data) => {
          if (data.isLoggedIn === false && Router.pathname !== "/register") Router.push("/login");
          else if (data.isLoggedIn === true) {
            cookies.set("sessionToken", cookies.get("sessionToken"), { maxAge: 43200, path: "/", });
          }
          setLoading(false)

        })

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    }
  }, [])

  if (isLoading) return(<></>);
  else {
      return (<Layout><Component {...pageProps} /></Layout>);
  }
}
