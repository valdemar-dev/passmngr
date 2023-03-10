import styles from "@/styles/Layout.module.css";

export default function Layout(props) {
  return(
    <>
      <main>
        {props.children}
      </main>

      <img src="/blob1.svg" className={`${styles.blob_bottom_left} ${styles.blob}`} draggable="false"/>
      <img src="/blob2.svg" className={`${styles.blob_bottom_left} ${styles.blob}`} draggable="false"/>
      <img src="/blob3.svg" className={`${styles.blob_bottom_left} ${styles.blob}`} draggable="false"/>
      <img src="/blob4.svg" className={`${styles.blob_bottom_left} ${styles.blob}`} draggable="false"/>

      <img src="/blob5.svg" className={`${styles.blob_top_right} ${styles.blob}`} draggable="false"/>
      <img src="/blob6.svg" className={`${styles.blob_top_right} ${styles.blob}`} draggable="false"/>
      <img src="/blob7.svg" className={`${styles.blob_top_right} ${styles.blob}`} draggable="false"/>
      <img src="/blob8.svg" className={`${styles.blob_top_right} ${styles.blob}`} draggable="false"/>

      <img src="/blob9.svg" className={`${styles.blob_bottom_right} ${styles.blob}`} draggable="false"/>
      <img src="/blob10.svg" className={`${styles.blob_bottom_right} ${styles.blob}`} draggable="false"/>
      <img src="/blob11.svg" className={`${styles.blob_bottom_right} ${styles.blob}`} draggable="false"/>
      <img src="/blob12.svg" className={`${styles.blob_bottom_right} ${styles.blob}`} draggable="false"/>

    </>
  )
}
