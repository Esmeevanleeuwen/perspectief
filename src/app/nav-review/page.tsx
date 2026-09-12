// Temporary visual fixture; removed before merging.
import { Suspense } from "react";
import SiteHeaderNav from "@/app/components/Layout/SiteHeaderNav";
import HeaderAccount from "@/app/components/Layout/HeaderAccount";
import styles from "@/app/components/Layout/SiteHeader.module.css";
export const metadata = {robots:{index:false,follow:false}};
export default async function Page({searchParams}: {searchParams:Promise<{w?:string}>}) {
 const q=await searchParams;
 const width=[320,390,768,1120,1280].includes(Number(q.w))?Number(q.w):390;
 return <main style={{padding:"20px 0"}}>
  <section aria-label="Voorbeeld met account"><p>Voorbeeld van het menu na inloggen</p><header className={styles.shell}><Suspense fallback={<p>Menu laden…</p>}><SiteHeaderNav account={<HeaderAccount signedIn/>} mobileAccount={<HeaderAccount signedIn variant="mobile"/>}/></Suspense></header></section>
  <p style={{marginTop:24}}>Weergave op {width}px</p>
  <iframe title="Mobiele menucontrole" src="/artikelen/prestatiedruk?lees=verder" width={width} height="820" style={{border:"1px solid #ccc",display:"block"}}/>
 </main>;
}
