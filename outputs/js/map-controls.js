const mapElement=$('#map'),mapWorld=$('#mapWorld'),zoomLabel=$('#zoomLabel');let mapZoom=1,mapPanX=0,mapPanY=0,mapDrag=null;
function clampMapPan(){const limitX=mapElement.clientWidth*Math.max(0,mapZoom-1)/2,limitY=mapElement.clientHeight*Math.max(0,mapZoom-1)/2;mapPanX=Math.max(-limitX,Math.min(limitX,mapPanX));mapPanY=Math.max(-limitY,Math.min(limitY,mapPanY))}
function updateMapView(){clampMapPan();mapWorld.style.transform=`translate(${mapPanX}px, ${mapPanY}px) scale(${mapZoom})`;zoomLabel.textContent=`${Math.round(mapZoom*100)}%`}
function fitMap(){mapDrag=null;mapWorld.classList.remove('dragging');mapZoom=1;mapPanX=0;mapPanY=0;updateMapView()}
function zoomMap(next,x,y){const rect=mapElement.getBoundingClientRect(),cx=x??rect.left+rect.width/2,cy=y??rect.top+rect.height/2,localX=cx-rect.left-rect.width/2,localY=cy-rect.top-rect.height/2,newZoom=Math.max(1,Math.min(2.8,next)),ratio=newZoom/mapZoom;if(newZoom===1){fitMap();return}mapPanX=localX-(localX-mapPanX)*ratio;mapPanY=localY-(localY-mapPanY)*ratio;mapZoom=newZoom;updateMapView()}
$('#zoomIn').onclick=()=>zoomMap(mapZoom*1.15);$('#zoomOut').onclick=()=>zoomMap(mapZoom/1.15);$('#zoomReset').onclick=fitMap;
window.addEventListener('resize',()=>{if(mapZoom<=1.001)fitMap();else updateMapView()});
mapElement.addEventListener('wheel',e=>{e.preventDefault();zoomMap(mapZoom*(e.deltaY<0?1.12:1/1.12),e.clientX,e.clientY)},{passive:false});
mapElement.addEventListener('pointerdown',e=>{if(e.button!==0||mapZoom<=1||e.target.closest('button,.top,.side,.follow-panel,.command-panel,.right-actions,#clockControls,.bottom,.sheet,.modal,.zoom-controls'))return;mapDrag={x:e.clientX,y:e.clientY,panX:mapPanX,panY:mapPanY};mapWorld.classList.add('dragging');mapElement.setPointerCapture(e.pointerId)});
mapElement.addEventListener('pointermove',e=>{if(!mapDrag)return;if(mapZoom<=1){mapPanX=0;mapPanY=0;updateMapView();return}mapPanX=mapDrag.panX+e.clientX-mapDrag.x;mapPanY=mapDrag.panY+e.clientY-mapDrag.y;updateMapView()});
function endMapDrag(){mapDrag=null;mapWorld.classList.remove('dragging')}mapElement.addEventListener('pointerup',endMapDrag);mapElement.addEventListener('pointercancel',endMapDrag);
