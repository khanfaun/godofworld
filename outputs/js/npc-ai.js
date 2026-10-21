function setPlan(n,plan){
 const destination=plan.destination||null;
 const activeDestination=n.destination||null;
 const sameRoute=!!(activeDestination&&activeDestination===destination);
 const expectedDestination=destination&&destination!==n.location?destination:null;
 const samePlan=n.action===plan.action&&n.actionLocation===(plan.site||null)&&activeDestination===expectedDestination&&n.actionDays>0;
 if(samePlan){n.actionReason=plan.reason;n.actionBenefit=plan.benefit;return false}
 if(activeDestination&&activeDestination!==destination){n.destination=null;n.routeProgress=0;n.routeDays=0}
 if(!sameRoute)n.actionTravelDays=0;
 const workDays=plan.action==='Hành trình có mục tiêu'?0:Math.max(0,Number(plan.days)||0);
 n.action=plan.action;n.actionDays=workDays;n.actionDuration=workDays;n.actionLocation=plan.site||null;n.actionResolved=false;n.actionReason=plan.reason;n.actionBenefit=plan.benefit;n.actionPriority=plan.score>=700?'Ưu tiên 1 · Sinh tồn: khí huyết':plan.score>=500?'Ưu tiên 2 · Sinh tồn: lương thực':plan.score>=390?'Ưu tiên 3 · Nhu cầu thể chất':plan.score>=300?'Ưu tiên 4 · Đột phá':'Ưu tiên 5 · Mục tiêu cá nhân';n.activity=plan.activity;return true
}
function chooseActivity(n){
 const choices=[];const add=(score,plan)=>choices.push({...plan,score});
 const goal=String(n.goal||'').toLowerCase(),trait=String(n.trait||'').toLowerCase();
 const wantsCultivation=/công pháp|cảnh giới|đột phá|đạo tâm|tu hành/.test(goal);
 const curious=trait.includes('hiếu kỳ')||/khám phá|di tích/.test(goal);
 const sociable=trait.includes('lạc quan')||/kết giao|đồng đạo/.test(goal);
 const practical=trait.includes('thực tế')||/linh thạch|tích lũy|đổi đan dược/.test(goal);
 const patient=trait.includes('kiên nhẫn')||trait.includes('điềm đạm');
 const determined=trait.includes('cứng cỏi')||goal.includes('đột phá');
 const deadlineMatch=goal.match(/trước[^0-9]{0,20}([0-9]{1,3})/);
 const yearsLeft=deadlineMatch?Number(deadlineMatch[1])-n.age:null;
 const deadlineUrgency=yearsLeft===null?0:Math.max(0,Math.min(45,(5-yearsLeft)*12));
 const foodField=nearestResource(n,'food'),herbValley=nearestResource(n,'herb'),oreMountain=nearestResource(n,'ore'),market=nearestMarket(n);
 if(n.hp<55)add(750+(55-n.hp)*3,{action:'Dưỡng thương',days:30,reason:'Khí huyết còn '+n.hp+'%, nguy cơ trọng thương hoặc tử vong.',benefit:'Hồi phục khí huyết và thể lực.',activity:'Tìm nơi an toàn dưỡng thương'});
 if(n.hunger>=58&&n.food>0)add(500+n.hunger,{action:'Ăn uống',days:3,reason:'Đói bụng '+n.hunger+'%, lương thực sẵn có.',benefit:'Tiêu thụ 1 phần lương thực, giảm đói và hồi phục thể lực.',activity:'Dùng lương thực để giảm đói'});
 if(n.hunger>=58&&n.food===0){if(foodField&&foodField.stock>0)add(650+n.hunger,{action:'Kiếm lương thực',days:8,site:foodField.name,destination:foodField.name,reason:'Đói nguy cấp và hết lương thực; phải tới linh điền để kiếm thức ăn.',benefit:'Thu hoạch linh mễ để thoát đói.',activity:'Đi tới '+foodField.name+' kiếm lương thực'});else if(n.stones>=5&&market)add(650+n.hunger,{action:'Mua lương thực',days:5,site:market.name,destination:market.name,reason:'Nguồn lương thực gần nơi ở đã cạn; dùng linh thạch mua ở chợ.',benefit:'Đổi 5 linh thạch lấy 1 phần lương thực.',activity:'Đi chợ '+market.name+' mua lương thực'})}
 if(n.energy<28)add(420+(28-n.energy)*4,{action:'Nghỉ ngơi',days:12,reason:'Thể lực chỉ còn '+n.energy+'%, không đủ duy trì hành động nặng.',benefit:'Hồi phục thể lực và một phần khí huyết.',activity:'Nghỉ ngơi để hồi phục thể lực'});
 if(n.qi<27)add(390+(27-n.qi)*4,{action:'Thổ nạp',days:18,reason:'Linh lực còn '+n.qi+'%, cần hồi khí trước khi tu luyện.',benefit:'Hấp thu linh khí, phục hồi linh lực.',activity:'Tĩnh tu hồi phục linh lực'});
 if(n.progress>=100&&n.qi<55)add(315+(55-n.qi)*2,{action:'Thổ nạp',days:18,reason:'Tu vi đã đầy nhưng linh lực chưa đủ để thử đột phá.',benefit:'Hồi linh lực để chuẩn bị đột phá.',activity:'Thổ nạp trước khi đột phá'});
 if(n.progress>=100&&n.qi>=55)add(300,{action:'Đột phá cảnh giới',days:6,reason:'Tu vi đã đầy và linh lực đủ; có thể thử đột phá cảnh giới tiếp theo.',benefit:'Thành công sẽ tăng cảnh giới; thất bại làm giảm tu vi, khí huyết và gây trọng thương.',activity:'Chuẩn bị đột phá'});
 if(n.progress<100)add(180+n.talent/5+(wantsCultivation?22:0)+(patient?8:0),{action:'Tu luyện',days:45,reason:'Tích lũy tu vi để đạt viên mãn: '+n.goal+'.',benefit:'Tăng tu vi đến mức tối đa; linh lực và thể lực sẽ tiêu hao.',activity:'Vận công tích lũy tu vi'});
 if(n.food<2&&foodField&&foodField.stock>0)add(225+(patient?5:0),{action:'Kiếm lương thực',days:8,site:foodField.name,destination:foodField.name,reason:'Dự trữ lương thực thấp; chủ động đi tới linh điền trước khi đói.',benefit:'Bổ sung linh mễ để dự phòng sinh tồn.',activity:'Thu hoạch linh mễ tại linh điền gần nhất'});
 if(n.herbs<3&&herbValley&&herbValley.stock>0)add(n.stones<80||practical?230:195,{action:'Hái linh dược',days:30,site:herbValley.name,destination:herbValley.name,reason:'Cần linh dược để luyện đan hoặc trao đổi tại thị trấn.',benefit:'Thu thập linh dược từ đúng vùng sinh trưởng.',activity:'Đi tới '+herbValley.name+' hái thuốc'});
 if(n.ore<3&&oreMountain&&oreMountain.stock>0&&n.stones<120)add(practical?235:220,{action:'Khai thác khoáng',days:30,site:oreMountain.name,destination:oreMountain.name,reason:'Linh thạch dự trữ thấp; cần khai khoáng để bán hoặc sử dụng.',benefit:'Thu được quặng và linh thạch tại mạch khoáng.',activity:'Đi tới '+oreMountain.name+' khai khoáng'});
 if(n.herbs>=3&&n.stones<120&&market)add(practical?240:225,{action:'Bán linh dược',days:6,site:market.name,destination:market.name,reason:'Đang có linh dược nhưng thiếu linh thạch; đem hàng ra chợ đổi.',benefit:'Đổi linh dược thành linh thạch.',activity:'Mang linh dược tới chợ '+market.name});
 if(determined&&n.progress<100)add(225+deadlineUrgency,{action:'Luyện kiếm',days:30,reason:'Rèn luyện để tiến gần mục tiêu: '+n.goal+'.',benefit:'Tăng tiến độ tu luyện, đổi lại tiêu hao thể lực.',activity:'Luyện kiếm để nâng cao kiếm ý'});
 if(curious){const exploreTarget=Object.keys(locations).find(name=>goal.includes(name.toLowerCase()))||'Bách Hoa Môn';add(230,{action:'Khám phá di tích',days:24,site:exploreTarget,destination:exploreTarget,reason:'Tính hiếu kỳ và mục tiêu '+n.goal+'.',benefit:'Tăng khí vận; có cơ hội tìm thấy linh thạch.',activity:'Đi tới '+exploreTarget+' thăm dò di tích'})}
 if(sociable&&n.mood<95)add(230+(95-n.mood),{action:'Giao lưu',days:20,reason:'Muốn kết giao đồng đạo theo mục tiêu: '+n.goal+'.',benefit:'Cải thiện tâm cảnh, hỗ trợ hiệu quả tu luyện.',activity:'Gặp gỡ và kết giao đồng đạo'});
 if(goal.includes('đạo tâm')&&trait.includes('điềm đạm')&&n.location==='Huyết Sát Tông'&&n.qi<55)add(215,{action:'Hộ pháp',days:30,reason:'Giữ vững đạo tâm và nâng cao cảnh giới: '+n.goal+'.',benefit:'Tích lũy linh lực ổn định và củng cố quan hệ tông môn.',activity:'Hộ pháp cho đồng môn'});
 if(n.mood<30)add(250+(30-n.mood)*2,{action:'Tĩnh dưỡng tâm cảnh',days:20,reason:'Tâm cảnh xuống thấp ('+n.mood+'%), dễ ảnh hưởng tu luyện.',benefit:'Cải thiện tâm cảnh và ổn định đạo tâm.',activity:'Tĩnh dưỡng để ổn định đạo tâm'});
 let target=null;
 if(goal.includes('cổ thư'))target='Thanh Vân Sơn';else if(goal.includes('linh thạch')||goal.includes('đan dược'))target='Bình Dương';else if(goal.includes('bách hoa'))target='Bách Hoa Môn';else if(goal.includes('đột phá'))target='Thiên Phủ';else if(goal.includes('đạo tâm'))target='Huyết Sát Tông';else if(goal.includes('kết giao'))target='Thanh Lâm';
 if(target&&n.location!==target&&!n.destination&&n.hunger<58&&n.energy>40&&n.hp>55)add(225,{action:'Hành trình có mục tiêu',days:0,reason:'Cần đến '+target+' để tiếp tục mục tiêu cá nhân.',benefit:'Di chuyển đến đúng khu vực công việc hoặc tu luyện.',activity:'Đang chuẩn bị hành trình đến '+target,destination:target});
 choices.sort((a,b)=>b.score-a.score);
 const plan=choices[0]||{action:'Tu luyện',days:30,reason:'Tiếp tục mục tiêu tu hành cá nhân.',benefit:'Tăng tiến độ đột phá.',activity:'Vận công tu luyện'};
 setPlan(n,plan);
 if(plan.destination&&n.destination!==plan.destination)beginTravel(n,plan.destination);
}
