import '@/styles/globals.css'
import Router from "next/router";
import { useEffect, useState } from 'react';

import Layout from '@/components/Layout';

export default function App({ Component, pageProps }) {
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch("/api/checklogin")
      .then(res => {
        if (!res.ok) Router.push("/login");
        setLoading(false);
      })

  }, [])

  if (isLoading) return(<></>);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
  
}
