import styles from "@/styles/Dashboard.module.css";
import { useEffect, useRef, useState } from "react";

import crypto from "crypto";
import Router from "next/router";
import Link from "next/link";

export default function Dashboard() {
    // fetch all the accounts and decrypt them using the stored vault key cookie
    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const getData = async () => {
        await fetch("/api/getvault").then(async (res) => {
            if(!res.ok) return Router.push("/login");

            const resJSON = await res.json();

            setData(resJSON);
            setLoading(false);

            return;
        })
    };

    useEffect(() => {
        getData();
    }, [])

    if (isLoading) return <></>

    const vault = data.vault;

    const key = localStorage.getItem("vaultKey");

    if(!key) {return <>No vault key found</>};

    const decrypt = (text, iv) => {
        const bufferIv = Buffer.from(iv, "hex");
        const bufferText = Buffer.from(text, "hex");

        const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), bufferIv);

        let decrypted = decipher.update(bufferText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    };

    const deleteAccount = async (id) => {
        if (!id) return alert("No id given");

        const data = {
            id: id,
            vaultId: vault.id,
        };

        const options = {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        };

        await fetch("/api/delete", options);
        getData();
    };

    const accounts = vault?.accounts || [];

    const accountCopyButton = (info, filename) => {
        if (info.length > 1) return(
            <button 
                onClick={() => {
                    navigator.clipboard.writeText(info)
                }}> 

                <span className={styles.tooltip_text}>{`${info}`}</span>
                <img src={`/${filename}.svg`} height="20"/>
            </button>
        )
    };

    const loadAccounts = () => {
        if (accounts.length < 1) {
            return null;
        }

        return accounts.map(account => {
            const email = decrypt(account.email, account.iv);
            const username = decrypt(account.username, account.iv);
            const link = decrypt(account.link, account.iv);
            const service = decrypt(account.service, account.iv);
            const password = decrypt(account.password, account.iv);

            //advanced search function
            if (searchQuery.length > 0){
                let matchingWordsCount = 0;

                const splitSearchQuery = searchQuery.split(" ");

                splitSearchQuery.forEach((word) => {
                    if (word.length < 1) return;

                    const regex = new RegExp(`(${word})+`, "gi");
                    if (regex.test(service)) matchingWordsCount++;
                })
            
                if (matchingWordsCount < 1) return;
            }

            let accountLink;
            
            if (link.length > 1) {
                accountLink = <a 
                    href={link} 
                    target="_blank" 
                    rel="noreferrer"
                    title={`Go to ${service}`}
                >
                    <img src="/link.svg" id={styles.link_image}/>
                </a>

            }
            return(
                <div className={styles.account} id={account.id} key={account.id}>
                    <span className={styles.account_header}>
                        <span>{service} </span>
                       
                        {accountLink}

                        <img 
                            src="/delete.svg" 
                            onClick={() => {deleteAccount(account.id)}} 
                            id={styles.account_delete}
                        />
                    </span>
                    <br/>
                    <div className={styles.account_copy}>
                        <span>Copy:</span>
                        {accountCopyButton(email, "email")}
                        {accountCopyButton(username, "username")}
                        {accountCopyButton(password, "password")}
                    </div>
                </div>
            )
        }); 
    };


    return(
        <div className={styles.dashboard_wrapper}>
            <div className={styles.dashboard}>
                <div id={styles.logo}>
                    <h1>PassSafe</h1>
                </div>
                <div id={styles.topbar}>
                    <input 
                        id={styles.topbar_search} 
                        type="search" 
                        placeholder="Search accounts.."
                        onChange={(query) => {setSearchQuery(query.target.value)}}
                    />
                </div>

                <div id={styles.sidebar}>
                    <Link 
                        className={styles.sidebar_link}
                        href={"/dashboard"}
                    >
                        Accounts
                    </Link>
                    <Link
                        className={styles.sidebar_link}
                        href={"/dashboard/create"}
                    >
                        Create
                    </Link>
                </div>
 
                <div id={styles.inner_content}>
                    <div id={styles.account_list}>
                        {loadAccounts() || "No accounts found!"}
                    </div>
                </div>
            </div>

        </div> 
    )
}
