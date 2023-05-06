import styles from "@/styles/Dashboard.module.css";
import crypto from "crypto";
import Link from "next/link";
import { useRef } from "react";
import Router from "next/router";

export default function Dashboard() {
    const iv = crypto.randomBytes(16);

    let key;
    if(typeof window !== 'undefined') {
        key = localStorage.getItem("vaultKey")
    }

    const createPasswordFieldRef = useRef();
    
    const encrypt = (text) => {
        let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return { 
            iv: iv.toString("hex"),
            encryptedData: encrypted.toString('hex'),
        };
    };

    const handlePasswordAutoGenerate = (event) => {
        if (event.target.checked) {
            createPasswordFieldRef.current.disabled = true;

            crypto.randomBytes(32, function(err, buffer) {
              navigator.clipboard.writeText(buffer.toString('base64'));
              createPasswordFieldRef.current.value = buffer.toString('base64');
            });    

        } else {
            createPasswordFieldRef.current.disabled = false;
            createPasswordFieldRef.current.value = "";
        }
    };

    const createAccount = async (event) => {
        event.preventDefault();

        const service = (encrypt(event.target[0].value));
        const link = encrypt(event.target[1].value);
        const username = (encrypt(event.target[2].value));
        const email = (encrypt(event.target[3].value));
        const password = (encrypt(event.target[4].value));
        
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

    return(
        <div className={styles.dashboard_wrapper}>
            <div className={styles.dashboard}>
                <div id={styles.logo}>
                    <h1>PassSafe</h1>
                </div>

                <div id={styles.topbar}>
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
                    <div id={styles.create_account} style={{display: "grid"}}>
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
};