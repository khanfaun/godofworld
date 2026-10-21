import { useEffect, useRef } from "react";
import markup from "./game-markup.html?raw";
import "../css/styles.css";
import sharedUrl from "../js/shared.js?url";
import worldDataUrl from "../js/world-data.js?url";
import npcPanelUrl from "../js/npc-panel.js?url";
import mapControlsUrl from "../js/map-controls.js?url";
import clockUrl from "../js/clock.js?url";
import travelNeedsUrl from "../js/travel-needs.js?url";
import npcAiUrl from "../js/npc-ai.js?url";
import npcActionsUrl from "../js/npc-actions.js?url";
import worldTimeUrl from "../js/world-time.js?url";
import powersUrl from "../js/powers.js?url";
import uiControlsUrl from "../js/ui-controls.js?url";
import appUrl from "../js/app.js?url";

const scripts=[sharedUrl,worldDataUrl,npcPanelUrl,mapControlsUrl,clockUrl,travelNeedsUrl,npcAiUrl,npcActionsUrl,worldTimeUrl,powersUrl,uiControlsUrl,appUrl];

function loadClassicScript(src){
 return new Promise((resolve,reject)=>{
  const script=document.createElement("script");
  script.src=src;
  script.onload=()=>resolve(script);
  script.onerror=()=>reject(new Error("Không tải được "+src));
  document.body.append(script);
 });
}

export default function App(){
 const host=useRef(null);
 useEffect(()=>{
  const node=host.current;
  node.innerHTML=markup;
  const loaded=[];
  let cancelled=false;
  (async()=>{
   for(const src of scripts){
    if(cancelled)return;
    loaded.push(await loadClassicScript(src));
   }
  })().catch(error=>console.error("Lỗi khởi tạo mô phỏng:",error));
  return ()=>{
   cancelled=true;
   clearInterval(window.__legacyTimer);
   loaded.forEach(script=>script.remove());
  };
 },[]);
 return <div ref={host} />;
}
