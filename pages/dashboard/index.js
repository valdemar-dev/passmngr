import styles from "@/styles/Dashboard.module.css";
import { useEffect, useRef, useState } from "react";

import Cookies from "universal-cookie";
import crypto, { randomInt } from "crypto";
import Router from "next/router";

export default function Dashboard() {
    const pageRefs = {
        accountListRef: useRef(),
        createAccountRef: useRef(),
    };

    const sidebarRefs = {
        accountListRef: useRef(),
        createAccountRef: useRef(),
    };

    const createPasswordFieldRef = useRef();

    // fetch all the accounts and decrypt them using the stored vault key cookie
    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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

            if (searchQuery.length > 0){
                const regex = new RegExp(`(${searchQuery})+`, "gi");
                if (!regex.test(service)) return;
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

    const showSubPage = (ref) => {
        for (const pageRef in pageRefs) {
            if (ref === pageRef) {
                pageRefs[pageRef].current.style.display = "grid";
                sidebarRefs[pageRef].current.className = `${styles.sidebar_link} ${styles.sidebar_link_active}`;
            } else {
                pageRefs[pageRef].current.style.display = "none";
                sidebarRefs[pageRef].current.className = `${styles.sidebar_link}`;
            }
        }
    };

    const handlePasswordAutoGenerate = (event) => {
        if (event.target.checked) {
            createPasswordFieldRef.current.disabled = true;

            crypto.randomBytes(32, function(err, buffer) {
              createPasswordFieldRef.current.value = buffer.toString('base64');
            });    
        } else {
            createPasswordFieldRef.current.disabled = false;
            createPasswordFieldRef.current.value = "";
        }
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
                        autoFocus={true}
                    />
                </div>

                <div id={styles.sidebar}>
                    <div 
                        className={`${styles.sidebar_link} ${styles.sidebar_link_active}`}
                        onClick={() => {showSubPage("accountListRef");}}
                        ref={sidebarRefs.accountListRef}
                    >
                        Accounts
                    </div>
                    <div 
                        className={styles.sidebar_link} 
                        onClick={() => {showSubPage("createAccountRef")}}
                        ref={sidebarRefs.createAccountRef}
                    >
                        Create
                    </div>
                </div>
 
                <div id={styles.inner_content}>
                    <div id={styles.account_list} ref={pageRefs.accountListRef}>
                        {loadAccounts() || "No accounts found!"}
                    </div>

                    <div id={styles.create_account} ref={pageRefs.createAccountRef}>
                       <form 
                            onSubmit={(event) => {createAccount(event)}}
                            id={styles.account_create_form}
                        >
                            <span>Service</span>
                            <input type="text"/>
                            <span>Link to service</span>
                            <input type="text"/>
                            <span>Username (optional)</span>
                            <input type="text"/>
                            <span>Email (optional)</span>
                            <input type="email"/>
                            <span>Password</span>
                            <input 
                                type="password"
                                ref={createPasswordFieldRef}
                            />

                            <div id={styles.create_account_password_autogenerate}>
                                <label htmlFor="checkbox_password">Auto-generate password</label>
                                <input 
                                    type="checkbox" 
                                    id="checkbox_password" 
                                    name="checkbox" 
                                    value="value"
                                    onChange={(event) => {handlePasswordAutoGenerate(event)}}
                                />
                            </div>

                            <button type="submit">Create account</button>
                        </form> 
                    </div>
                </div>
            </div>

        </div> 
    )
}
