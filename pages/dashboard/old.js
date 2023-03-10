import styles from "@/styles/Dashboard.module.css";
import { useEffect, useRef, useState } from "react";
import crypto from "crypto";
import Router from "next/router";
import Cookies from "universal-cookie";

export default function Dashboard() {
    const accountsRef = useRef();
    const accountButtonRef = useRef();

    const createAccountRef = useRef();
    const createAccoutButtonRef = useRef();

    const blobRef = useRef();

    // fetch all the accounts and decrypt them using the stored vault key cookie
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        setLoading(true)
        fetch("/api/getvault", {
            signal: signal,
        })
            .then((res) => res.json())
            .then((data) => {
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                if (err.name === "AbortError") {
                    return;
                }
            });

        return () => {
            controller.abort();
            setData(null);
        }
    }, [])

    if (isLoading) return <></>
    if (!data) return <p>Not found</p>

    const vault = data.vault;

    const algorithm = "aes-256-cbc";

    const key = localStorage.getItem("vaultKey");

    if(!key) {return <>No vault key found</>};

    const iv = crypto.randomBytes(16);

    const encrypt = (text) => {
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return { 
            iv: iv.toString("hex"),
            encryptedData: encrypted.toString('hex'),
        };
    };

    const decrypt = (text, iv) => {
        const bufferIv = Buffer.from(iv, "hex");
        const bufferText = Buffer.from(text, "hex");

        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), bufferIv);

        let decrypted = decipher.update(bufferText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    };

    const createAccount = async (event) => {
        event.preventDefault();
        // get account details
        let service = event.target[0].value;
        let link = event.target[1].value;
        let username = event.target[2].value;
        let email = event.target[3].value;
        let password = event.target[4].value;

        if (service.length > 22) {
            return alert("Enter a shorter service name.");
        }
        if ( 
            !password || 
            !service
        ) return alert("Enter at least a service and a password.");

        service = (encrypt(service));
        link = encrypt(link);
        username = (encrypt(username));
        email = (encrypt(email));
        password = (encrypt(password));
        
        const endpoint = "/api/create";
        
        const data = {
            service: service.encryptedData,
            link: link.encryptedData,
            username: username.encryptedData,
            email: email.encryptedData,
            password: password.encryptedData,
            iv: username.iv.toString(),
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        };

        // add error handling here
        await fetch(endpoint, options);

        Router.reload();
    };

    const deleteAccount = async (id) => {
        if (!id) return alert("No id given");
        
        const endpoint = "/api/delete";

        console.log(vault);
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

        await fetch(endpoint, options);

        // add some error checks here
        Router.reload();
    };

    const logout = async () => {
        await fetch("/api/logout");

        const cookies = new Cookies();
        cookies.remove("sessionToken");

        Router.reload();
    };

    const moveBlob = (event) => {
        blobRef.current.style.left = (event.clientX) + "px";
        blobRef.current.style.top = (event.clientY) + "px";
    };


    let accounts = vault?.accounts || [];

    const loadAccounts = () => {
        return accounts = accounts.map(account => {
            let decryptedEmail;
            let decryptedUsername;
            let decryptedLink;

            if (decrypt(account.email, account.iv).length >= 1) {
                decryptedEmail = <button 
                    onClick={() => {
                        navigator.clipboard.writeText(decrypt(account.email, account.iv))
                    }}> 
                        <img src="/email.svg" height="30"/>
                    </button>;
            }

            if (decrypt(account.username, account.iv).length >= 1) {
                decryptedUsername = <p>
                    Username: <button onClick={() => {navigator.clipboard.writeText(decrypt(account.username, account.iv))}}> 
                        Copy
                    </button>
                </p>;
            }

            if (decrypt(account.link, account.iv).length >= 1) {
                decryptedLink = <a href={decrypt(account.link, account.iv)} rel="noreferrer" target={"_blank"}>
                    <img src="/link.svg" height={"20px"} id={styles.link_image}/>
                </a>
            }

            return(
                <div className={styles.account} id={account.id} key={account.id}>
                    <span className={styles.account_header}>
                        <span>{decrypt(account.service, account.iv)} </span>

                        {decryptedLink}

                        <button onClick={() => {deleteAccount(account.id)}} id={styles.account_delete_button}>Delete</button>
                    </span>

                    <br/>

                    {decryptedEmail}
                    {decryptedUsername}

                    <p>Password: <button onClick={() => {navigator.clipboard.writeText(decrypt(account.password, account.iv))}}> Copy</button></p>
                </div>
            )
        }); 
    };

    const showAccountList = () => {
        accountButtonRef.current.className = `${styles.selected}`;
        createAccoutButtonRef.current.className = "";

        accountsRef.current.className = "";
        createAccountRef.current.className = `${styles.hidden}`;
    };

    const showAccountCreation = () => {
        accountButtonRef.current.className = "";
        createAccoutButtonRef.current.className = `${styles.selected}`;


        accountsRef.current.className = `${styles.hidden}`;
        createAccountRef.current.className = "";
    };

    const handleSearch = (event) => {
        let accounts = vault?.accounts || [];

        accounts = accounts.shift();
    };

    return(
        <div className={styles.dashboard}>

            <div id={styles.dashboard_menu_wrapper} onMouseMove={(event) => {moveBlob(event)}}>
                <div id={styles.dashboard_menu}> 
                    <div id={styles.search}>
                        <input 
                            type="text" 
                            placeholder="Search accounts.."
                            autoComplete="off" 
                            onChange={(event) => {handleSearch(event)}}/>
                    </div>

                    <div id={styles.logout}>
                        <img src="/logout.svg" height="25" onClick={() => {logout()}}/>
                    </div>

                    <div id={styles.sidebar}>
                        <ul>
                            <li className={styles.selected} onClick={() => {showAccountList()}} ref={accountButtonRef}>Accounts</li>
                            <li  onClick={() => {showAccountCreation()}}  ref={createAccoutButtonRef}>Create</li>
                            <li>Starred</li>
                       </ul>
                    </div>

                    <div id={styles.content}>
                        <div id={styles.accounts} ref={accountsRef}>
                            {loadAccounts()}
                        </div>

                        <div id={styles.create} className={`${styles.hidden}`} ref={createAccountRef}>
                            <form onSubmit={async (event) =>  {await createAccount(event)}} >
                                <input type={"text"} placeholder="service"/>
                                <input type={"text"} placeholder="link to site"/>
                                <input type={"text"} placeholder="username"/>
                                <input type={"email"} placeholder="email"/>
                                <input type={"password"} placeholder="password"/>
                                <button type="submit">Create account</button>
                            </form>
                        </div>
                    </div>
                </div>

                <img 
                    src={"/blob1.svg"} 
                    id={styles.dashboard_blob}

                    ref={blobRef}
                />
            </div>
        </div>
    );
}

                        
