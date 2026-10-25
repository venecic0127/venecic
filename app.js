
(function () {
"use strict";

var KEY = "screen-secret-projects-v1";
var THEMES = {
  violet: {label:"미드나잇 바이올렛",bg:"linear-gradient(155deg,#1b2246 0%,#725695 49%,#28233d 100%)",accent:"#9b85ef"},
  blue: {label:"블루 아워",bg:"linear-gradient(145deg,#071d39 0%,#27628f 47%,#161e42 100%)",accent:"#61addb"},
  red: {label:"다크 로즈",bg:"linear-gradient(155deg,#2c132d 0%,#933657 46%,#24112b 100%)",accent:"#e990b3"},
  green: {label:"포레스트",bg:"linear-gradient(155deg,#0c2629 0%,#285c53 48%,#0d1b29 100%)",accent:"#75c6aa"},
  mono: {label:"모노크롬",bg:"linear-gradient(160deg,#181a24 0%,#484a59 49%,#10131b 100%)",accent:"#aeb5c9"}
};
var APPS = [
 {id:"messages",name:"메시지",icon:"✉",color:"#55b986"},
 {id:"contacts",name:"연락처",icon:"♙",color:"#a7a3d3"},
 {id:"notes",name:"메모",icon:"▤",color:"#f3b64e"},
 {id:"browser",name:"Safari",icon:"◎",color:"#4c9ae5"},
 {id:"calendar",name:"캘린더",icon:"▦",color:"#dc706f"},
 {id:"gallery",name:"사진",icon:"▧",color:"#b584ce"},
 {id:"calls",name:"통화",icon:"☎",color:"#69bb8a"}
];
var TABS = [
 {id:"profile",name:"기본 설정",icon:"✦"},
 {id:"messages",name:"메시지",icon:"✉"},
 {id:"contacts",name:"연락처",icon:"♙"},
 {id:"notes",name:"메모",icon:"▤"},
 {id:"browser",name:"검색 기록",icon:"◎"},
 {id:"calendar",name:"캘린더",icon:"▦"},
 {id:"gallery",name:"사진",icon:"▧"},
 {id:"calls",name:"통화",icon:"☎"}
];
var DEFINITIONS = {
  contacts:{title:"연락처",help:"휴대폰 주소록에 저장된 이름과 번호, 관계를 설정해요.",add:"연락처 추가",fields:[["name","저장된 이름","text"],["number","전화번호","text"],["note","관계 / 별명","textarea"]]},
  notes:{title:"메모",help:"누군가에게 보여주지 않은 메모나 비밀스러운 기록을 적어보세요.",add:"메모 추가",fields:[["title","메모 제목","text"],["content","메모 내용","textarea"]]},
  browser:{title:"Safari 검색 기록",help:"검색어를 누르면 열리는 가상 웹페이지의 내용도 직접 쓸 수 있어요. 실제 인터넷으로 이동하지 않아요.",add:"기록 추가",fields:[["query","검색어 또는 페이지 제목","text"],["url","가상 주소 (예: archive.secret)","text"],["content","페이지 본문 / 검색 내용","textarea"]]},
  calendar:{title:"캘린더",help:"캐릭터의 일정과 약속, 기념일을 입력해요.",add:"일정 추가",fields:[["date","날짜 (YYYY-MM-DD)","date"],["title","일정 제목","text"],["detail","상세 내용","textarea"]]},
  gallery:{title:"사진첩",help:"공개 이미지 주소(https://...)를 넣어 사진을 보여줘요. 휴대폰 사진 업로드는 아직 지원하지 않아요.",add:"사진 추가",fields:[["title","사진 제목","text"],["url","이미지 주소 (https://...)","url"],["caption","사진 설명","textarea"]]},
  calls:{title:"통화 기록",help:"부재중 전화와 수신·발신 내역을 구성해요.",add:"통화 내역 추가",fields:[["name","상대 이름","text"],["type","통화 유형 (부재중, 발신, 수신)","text"],["date","일시","text"]]}
};
var defaults = {
 contacts:{name:"새 연락처",number:"010-0000-0000",note:""},
 notes:{title:"새 메모",content:""},
 browser:{query:"새로운 검색",url:"",content:""},
 calendar:{date:"2026-10-25",title:"새 일정",detail:""},
 gallery:{title:"새 사진",url:"",caption:""},
 calls:{name:"알 수 없음",type:"부재중",date:"오늘"}
};
var app = document.getElementById("app");
var state = {
  phones: readSaved(), mode:"library", activeId:null, shared:null,
  tab:"profile", screen:"lock", detail:-1, mobile:"edit", toastTimer:null
};
var demo = {
 name:"루시안",handle:"@unread_0",tagline:"읽지 말았어야 할 기록",notice:"알림 2개 · 아무에게도 말하지 마.",
 theme:"violet",avatarUrl:"",wallpaperUrl:"",
 messages:[
  {name:"알 수 없음",lines:[{who:"them",text:"오늘 밤에도 거기 있는 거지?",time:"23:41"},{who:"me",text:"그 장소는 어떻게 알았어?",time:"23:42"},{who:"them",text:"네가 남긴 기록을 봤으니까.",time:"23:43"}]},
  {name:"서준",lines:[{who:"them",text:"연락 좀 해. 걱정되니까.",time:"18:20"},{who:"me",text:"괜찮아. 나중에 얘기할게.",time:"18:24"}]}
 ],
 contacts:[{name:"서준 ☁",number:"010-****-1234",note:"오래된 친구"},{name:"알 수 없음",number:"발신번호 표시제한",note:"차단하지 않은 번호"}],
 notes:[{title:"10월 25일",content:"그날 본 것을 아무에게도 이야기하지 않았다.\n그런데 누군가는 이미 알고 있었다."},{title:"잊지 말 것",content:"자정, 문 앞, 파란 봉투."}],
 browser:[{query:"기록이 삭제된 채팅 복구",url:"search.example/restore",content:"삭제된 기록은 기기에 따라 복구가 불가능할 수 있습니다."},{query:"밤 12시 반복되는 전화",url:"forum.example/night",content:"같은 번호에서 정각에 연락이 온다는 제보."}],
 calendar:[{date:"2026-10-25",title:"23:50 · 약속",detail:"그 사람이 기다리는 장소로."}],
 gallery:[{title:"봉투",url:"",caption:"서랍 안에 접혀 있던 파란 봉투"}],
 calls:[{name:"알 수 없음",type:"부재중",date:"어제 23:59"},{name:"서준",type:"수신",date:"어제 18:03"}]
};
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function clone(x){return JSON.parse(JSON.stringify(x))}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(x){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]})}
function txt(s){return esc(s).replace(/\n/g,"<br>")}
function trim(s,n){return String(s==null?"":s).slice(0,n||20000)}
function linkUrl(s){var v=trim(s,2000).trim();return /^https:\/\/[^\s<>"']+$/i.test(v)?v:""}
function img(s){var url=linkUrl(s);return url?'<img src="'+esc(url)+'" loading="lazy" alt="">':""}
function initials(s){return esc((s||"?").trim().slice(0,1)||"?")}
function att(s){return esc(s)}
function current(){return state.mode==="viewer"?state.shared:state.phones.find(function(x){return x.id===state.activeId})}
function toast(s){var el=document.getElementById("toast");el.textContent=s;el.classList.add("show");clearTimeout(state.toastTimer);state.toastTimer=setTimeout(function(){el.classList.remove("show")},2900)}
function readSaved(){try{var val=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(val)?val.map(normalize):[]}catch(e){return []}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state.phones));return true}catch(err){toast("저장 공간이 부족해요. 사진 대신 이미지 주소를 사용해 주세요.");return false}}
function sanitizeRecords(arr,fields,limit){if(!Array.isArray(arr))return[];return arr.slice(0,limit||100).map(function(item){var obj={};fields.forEach(function(k){obj[k]=trim(item&&item[k],k==="content"||k==="detail"||k==="caption"||k==="note"?"10000":2000)});return obj})}
function normalize(raw){
 raw=(raw&&typeof raw==="object")?raw:{};
 var obj={
  id:typeof raw.id==="string"&&raw.id.length<60?raw.id:uid(),
  name:trim(raw.name||"이름 없는 캐릭터",80),handle:trim(raw.handle||"@character",80),
  tagline:trim(raw.tagline||"",200),notice:trim(raw.notice||"",200),
  theme:THEMES[raw.theme]?raw.theme:"violet",avatarUrl:linkUrl(raw.avatarUrl),
  wallpaperUrl:linkUrl(raw.wallpaperUrl),messages:[],contacts:[],notes:[],browser:[],calendar:[],gallery:[],calls:[]
 };
 if(Array.isArray(raw.messages))obj.messages=raw.messages.slice(0,60).map(function(c){return {
   name:trim(c&&c.name,120),lines:Array.isArray(c&&c.lines)?c.lines.slice(0,100).map(function(line){return {
    who:line&&line.who==="me"?"me":"them",text:trim(line&&line.text,4000),time:trim(line&&line.time,60)
   }}):[]
 }});
 Object.keys(DEFINITIONS).forEach(function(k){obj[k]=sanitizeRecords(raw[k],DEFINITIONS[k].fields.map(function(f){return f[0]}),80)});
 return obj;
}
function blank(){return normalize({id:uid(),name:"새 캐릭터",handle:"@secret",tagline:"이 휴대폰에는 어떤 비밀이 있을까?",notice:"비밀스러운 하루가 시작됩니다.",theme:"violet"})}
function resetPhone(){state.screen="lock";state.detail=-1}
function setMode(mode){state.mode=mode;render();window.scrollTo(0,0)}
function removeHash(){if(location.hash)history.replaceState(null,"",location.pathname+location.search)}
function openEditor(phone){removeHash();state.activeId=phone.id;state.tab="profile";state.mobile="edit";resetPhone();setMode("editor")}
function openViewer(phone,shared){if(shared){state.shared=normalize(phone)}else{state.shared=normalize(phone)}resetPhone();setMode("viewer")}
function addPhone(from){var p=from?normalize(clone(from)):blank();p.id=uid();state.phones.unshift(p);save();openEditor(p);toast(from?"내 작업실에 복사했어요.":"새 캐릭터 휴대폰을 만들었어요.")}
function confirmDelete(id){if(!confirm("이 캐릭터 휴대폰을 삭제할까요? 이 기기의 저장 내용이 사라져요."))return;state.phones=state.phones.filter(function(p){return p.id!==id});save();render()}
function navbar(){return '<header class="topbar wrap"><div class="logo" data-action="home"><span class="logo-mark">◈</span> SCREEN<span style="color:#b8a2ff">//</span>SECRET</div><div class="top-links"><span class="top-note">your character, their secrets.</span><button class="small ghost" data-action="home">내 작업실</button></div></header>'}
function footer(){return '<footer class="site-footer wrap">SCREEN//SECRET · 캐릭터 휴대폰 제작 & 공유<br>회원가입 없이 내 기기에 임시 저장됩니다. 공유 링크에는 작성한 정보가 포함되며, 누구든 링크를 알면 열람할 수 있어요. 개인정보나 실제 비밀번호는 입력하지 마세요.</footer>'}
function render(){app.innerHTML=navbar()+ (state.mode==="library"?renderLibrary():state.mode==="editor"?renderStudio():renderViewer())+footer()+'<input type="file" id="importFile" accept=".json,application/json" class="hidden">';
 if(state.mode==="editor"||state.mode==="viewer")renderPhone();
}
function renderLibrary(){
 var s='<main class="wrap"><section class="hero"><span class="kicker">CREATE · EXPLORE · SHARE</span><h1>누군가의 <span class="glow-text">휴대폰</span>엔<br>그 사람의 이야기가 있다.</h1><p>메시지, 메모, 통화 기록, 사진까지.<br>나만의 캐릭터 휴대폰을 만들고 비밀스러운 링크를 공유해 보세요.</p><div class="hero-actions"><button class="primary" data-action="new">✦ 새 휴대폰 만들기</button><button class="ghost" data-action="demo">샘플 휴대폰 열어보기</button><button class="ghost" data-action="import">JSON 가져오기</button></div></section>';
 s+='<div class="section-title"><h2>내 작업실 <span class="muted-small">('+state.phones.length+')</span></h2><span class="muted-small">이 기기에 저장된 작품</span></div><section class="library-grid"><button class="project-card add-card" data-action="new"><span class="plus">＋</span><strong>새 캐릭터 만들기</strong><span class="muted-small">빈 휴대폰에서 시작하기</span></button>';
 state.phones.forEach(function(p){s+='<article class="project-card"><div class="project-cover"><div class="avatar">'+(img(p.avatarUrl)||initials(p.name))+'</div><div><h3>'+esc(p.name)+'</h3><p>'+esc(p.handle)+'</p></div></div><p>'+esc(p.tagline||"아직 작성된 소개가 없어요.")+'</p><div class="project-actions"><button class="primary tiny" data-action="edit" data-id="'+att(p.id)+'">편집</button><button class="tiny" data-action="view" data-id="'+att(p.id)+'">미리보기</button><button class="tiny danger" data-action="delete" data-id="'+att(p.id)+'">삭제</button></div></article>'});
 s+='</section><section class="feature-row"><div class="feature"><strong>✎ 자유롭게 만들기</strong>프로필부터 메시지와 갤러리까지 직접 작성해요.</div><div class="feature"><strong>▣ 실제 휴대폰처럼 탐색</strong>잠금 화면과 앱 아이콘을 눌러 이야기를 읽어요.</div><div class="feature"><strong>⇧ 링크 하나로 공유</strong>친구에게 완성한 휴대폰 화면을 그대로 보여줘요.</div></section></main>';
 return s;
}
function topActions(){return '<div class="toolbar-actions"><button class="small ghost" data-action="export">↓ JSON 백업</button><button class="small primary" data-action="share">↗ 링크 공유</button></div>'}
function renderStudio(){
 var p=current();if(!p)return '<main class="wrap"><p>프로젝트를 찾지 못했어요.</p><button data-action="home">홈으로</button></main>';
 return '<main class="wrap"><div class="studio-top"><div><button class="tiny ghost" data-action="home">← 내 작업실</button><h1>휴대폰 꾸미기 <span class="glow-text">'+esc(p.name)+'</span></h1><div class="muted-small">수정 내용은 이 기기에 자동 저장돼요.</div></div>'+topActions()+'</div>'+
 '<div class="mobile-switch"><button class="'+(state.mobile==="edit"?"primary":"")+'" data-action="mobile" data-view="edit">✎ 편집하기</button><button class="'+(state.mobile==="preview"?"primary":"")+'" data-action="mobile" data-view="preview">▣ 화면 보기</button></div>'+
 '<div class="studio-layout mobile-'+state.mobile+'"><section class="editor"><div class="editor-top"><h2>콘텐츠 편집</h2><div class="muted-small">아래 항목을 눌러 휴대폰 속 내용을 바꿔요.</div></div><div class="editor-tabs">'+TABS.map(function(t){return '<button class="tab '+(state.tab===t.id?"active":"")+'" data-action="tab" data-tab="'+t.id+'">'+t.icon+' '+t.name+'</button>'}).join("")+'</div><div class="editor-body" id="editorBody">'+renderEditor(p)+'</div></section>'+
 '<section class="preview-pane"><div class="preview-label">LIVE PHONE PREVIEW</div><div id="phoneMount"></div><div class="iphone-hint">홈 바를 누르면 홈 화면으로 돌아가요.<br>잠금 해제 후 앱 아이콘을 눌러보세요.</div></section></div></main>';
}
function renderViewer(){
 var p=current();if(!p)return '<main class="wrap"><h2>휴대폰을 불러오지 못했어요.</h2><button data-action="home">작업실로</button></main>';
 return '<main class="wrap viewer-page"><div class="viewer-info"><span class="eyebrow">YOU FOUND A SECRET</span><h1>'+esc(p.name)+'<br><span class="glow-text">의 휴대폰</span></h1><p>'+esc(p.tagline||"화면을 열고 이 캐릭터의 이야기를 발견해 보세요.")+'<br><br>잠금을 해제한 뒤 문자, 메모, 검색 기록을 직접 눌러보세요.</p><div class="toolbar-actions"><button class="primary" data-action="fork">✦ 이 휴대폰을 복사해 만들기</button><button class="ghost" data-action="home">내 작업실</button></div></div><div class="viewer-phone"><div id="phoneMount"></div><div class="iphone-hint">홈 바를 터치하면 홈 화면으로 이동해요.</div></div></main>';
}
function field(label,key,value,mode,extra){
 mode=mode||"text";var hint=extra||"";return '<div class="field"><label>'+esc(label)+'</label>'+(mode==="textarea"?'<textarea '+hint+'>'+esc(value)+'</textarea>':'<input type="'+mode+'" '+hint+' value="'+att(value)+'" '+(mode==="url"?'placeholder="https://..."':'')+'>')+'</div>';
}
function renderProfile(p){
 var opts=Object.keys(THEMES).map(function(k){return '<option value="'+k+'" '+(p.theme===k?"selected":"")+'>'+THEMES[k].label+'</option>'}).join("");
 return '<h3>캐릭터 프로필</h3><p class="helper">이름과 소개, 잠금 화면, 배경 이미지를 설정해요. 이미지가 없다면 기본 그라데이션을 사용해요.</p>'+
 field("캐릭터 이름","name",p.name,"text",'data-profile="name" maxlength="80"')+
 field("아이디 / 별명","handle",p.handle,"text",'data-profile="handle" maxlength="80"')+
 field("캐릭터 한 줄 소개","tagline",p.tagline,"textarea",'data-profile="tagline" maxlength="200"')+
 field("잠금 화면 문구","notice",p.notice,"text",'data-profile="notice" maxlength="200"')+
 '<div class="field"><label>분위기 색상</label><select data-profile="theme">'+opts+'</select></div>'+
 field("프로필 이미지 주소","avatarUrl",p.avatarUrl,"url",'data-profile="avatarUrl"')+
 field("배경화면 이미지 주소 (선택)","wallpaperUrl",p.wallpaperUrl,"url",'data-profile="wallpaperUrl"')+
 '<div class="editor-tip">TIP · 이미지 주소는 https://로 시작해야 해요. SNS 일부 이미지 링크는 외부 표시가 막힐 수 있어요. 링크 공유에는 이미지 자체가 아니라 이미지 주소만 포함돼요.</div>';
}
function renderMessages(p){
 var s='<h3>문자 메시지</h3><p class="helper">대화 상대를 만들고, 말풍선을 추가해요. <b>상대방</b>과 <b>내 캐릭터</b>를 선택해 대화 내용을 구분할 수 있어요.</p>';
 s+='<div class="list-editor">';
 p.messages.forEach(function(chat,i){
  s+='<div class="edit-card"><div class="edit-card-head"><span>✉ 대화 '+(i+1)+'</span><button class="tiny danger" data-action="delete-chat" data-index="'+i+'">대화 삭제</button></div>';
  s+=field("대화 상대 이름","name",chat.name,"text",'data-chat="'+i+'" maxlength="120"');
  s+='<div class="message-bubbles-editor"><div class="muted-small">대화 내용 ('+chat.lines.length+')</div>';
  chat.lines.forEach(function(line,j){
   s+='<div class="msgline"><div class="edit-card-head"><span>말풍선 '+(j+1)+'</span><button class="tiny danger" data-action="delete-line" data-index="'+i+'" data-line="'+j+'">삭제</button></div>';
   s+='<div class="field"><label>말한 사람</label><select data-line-chat="'+i+'" data-line-index="'+j+'" data-line-key="who"><option value="them" '+(line.who==="them"?"selected":"")+'>상대방</option><option value="me" '+(line.who==="me"?"selected":"")+'>내 캐릭터</option></select></div>';
   s+=field("메시지 내용","text",line.text,"textarea",'data-line-chat="'+i+'" data-line-index="'+j+'" data-line-key="text"');
   s+=field("시간","time",line.time,"text",'data-line-chat="'+i+'" data-line-index="'+j+'" data-line-key="time"');
   s+='</div>';
  });
  s+='<button class="small" data-action="add-line" data-index="'+i+'">＋ 말풍선 추가</button></div></div>';
 });
 s+='</div><div class="editor-action-row"><button class="primary small" data-action="add-chat">＋ 새 대화 상대 추가</button></div>';
 return s;
}
function renderRecords(p,tab){
 var def=DEFINITIONS[tab],a=p[tab];
 var s='<h3>'+def.title+'</h3><p class="helper">'+def.help+'</p><div class="list-editor">';
 a.forEach(function(item,i){
  s+='<div class="edit-card"><div class="edit-card-head"><span>'+def.title+' '+(i+1)+'</span><button class="tiny danger" data-action="delete-row" data-kind="'+tab+'" data-index="'+i+'">삭제</button></div>';
  def.fields.forEach(function(spec){s+=field(spec[1],spec[0],item[spec[0]],spec[2],'data-record="'+tab+'" data-index="'+i+'" data-key="'+spec[0]+'"')});
  s+='</div>';
 });
 s+='</div><div class="editor-action-row"><button class="primary small" data-action="add-row" data-kind="'+tab+'">＋ '+def.add+'</button></div>';
 if(!a.length)s+='<div class="editor-tip">아직 작성된 항목이 없어요. 위 버튼으로 첫 번째 기록을 만들어 보세요.</div>';
 return s;
}
function renderEditor(p){if(state.tab==="profile")return renderProfile(p);if(state.tab==="messages")return renderMessages(p);return renderRecords(p,state.tab)}
function phoneNav(){return '<div class="phone-nav" data-action="phone-home" title="홈으로"><span></span></div>'}
function phoneStatus(){var time=new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:false});return '<div class="phone-status"><span>'+esc(time)+'</span><span class="symbols">▂▃▅ ◕ ▰</span></div>'}
function renderPhone(){
 var el=document.getElementById("phoneMount"),p=current();if(!el||!p)return;
 el.innerHTML='<div class="phone"><div class="phone-body"><div class="phone-wall"></div>'+phoneStatus()+'<div class="phone-content">'+phoneScreen(p)+'</div>'+phoneNav()+'</div></div>';
 var wall=el.querySelector(".phone-wall");if(wall){wall.style.backgroundImage=linkUrl(p.wallpaperUrl)?'url("'+linkUrl(p.wallpaperUrl).replace(/["\\]/g,"")+'")':THEMES[p.theme].bg}
}
function phoneScreen(p){
 if(state.screen==="lock"){
  var now=new Date();
  return '<div class="lock-screen"><div class="lock-date">'+(now.getMonth()+1)+'월 '+now.getDate()+'일 · '+["일","월","화","수","목","금","토"][now.getDay()]+'요일</div><div class="lock-time">'+now.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:false})+'</div><div class="lock-character">'+esc(p.name)+'</div><div class="lock-message">'+esc(p.notice||"휴대폰을 열어보세요.")+'</div><button class="unlock-btn" data-action="phone-unlock">⌁ 잠금 해제</button></div>';
 }
 if(state.screen==="home"){
  var tiles=APPS.map(function(item){return appTile(item)}).join("");
  return '<div class="home-screen"><div class="home-widget"><div style="font-size:11px;opacity:.85">'+esc(p.handle)+'</div><h2>'+esc(p.name)+'</h2><p>'+esc(p.tagline)+'</p></div><div class="app-grid">'+tiles+'</div><div class="app-dock">'+APPS.slice(0,3).map(appTile).join("")+'</div></div>';
 }
 return phoneApp(p);
}
function appTile(info){return '<button class="app-tile" data-action="open-app" data-app="'+info.id+'"><span class="app-symbol" style="background:'+info.color+'">'+info.icon+'</span><span>'+info.name+'</span></button>'}
function phoneApp(p){
 var ap=APPS.find(function(a){return a.id===state.screen}),title=ap?ap.name:"앱";
 var isDetail=state.detail>=0;
 var head='<div class="app-head"><button data-action="'+(isDetail?"phone-back":"phone-home")+'">‹ 뒤로</button><h2>'+esc(title)+'</h2></div>';
 return '<div class="app-screen">'+head+'<div class="app-body">'+appContent(p)+'</div></div>';
}
function empty(msg){return '<div class="app-empty">✧<br>'+esc(msg)+'<br><span style="font-size:11px">아직 기록이 없어요.</span></div>'}
function appContent(p){
 var a=p[state.screen];if(!Array.isArray(a))return empty("화면을 열 수 없어요.");
 if(!a.length)return empty("이 휴대폰에는");
 if(state.screen==="messages"){
  if(state.detail<0)return a.map(function(chat,i){var l=chat.lines[chat.lines.length-1];return '<button class="app-item clickable" data-action="phone-detail" data-index="'+i+'"><span class="app-item-icon">✉</span><span><h3>'+esc(chat.name||"알 수 없음")+'</h3><p>'+esc(l?l.text:"새 대화")+'</p></span></button>'}).join("");
  var chat=a[state.detail];if(!chat)return empty("대화가 사라졌어요.");
  return '<div class="day-pill">'+esc(chat.name)+' · 대화 기록</div>'+chat.lines.map(function(line){return '<div class="bubble-row '+(line.who==="me"?"mine":"")+'">'+(line.who==="me"?"":'<span class="bubble-time">'+esc(line.time)+'</span>')+'<div class="bubble">'+txt(line.text)+'</div>'+(line.who==="me"?'<span class="bubble-time">'+esc(line.time)+'</span>':"")+'</div>'}).join("");
 }
 if(state.screen==="contacts")return a.map(function(v){return '<div class="app-item"><span class="app-item-icon">♙</span><span><h3>'+esc(v.name)+'</h3><p>'+esc(v.number)+'<br>'+esc(v.note)+'</p></span></div>'}).join("");
 if(state.screen==="notes"){
  if(state.detail<0)return a.map(function(v,i){return '<button class="app-item clickable" data-action="phone-detail" data-index="'+i+'"><span class="app-item-icon">▤</span><span><h3>'+esc(v.title)+'</h3><p>'+esc(v.content).slice(0,85)+'</p></span></button>'}).join("");
  var n=a[state.detail];return n?'<div class="app-article"><h2>'+esc(n.title)+'</h2><p>'+txt(n.content)+'</p></div>':empty("메모를 찾을 수 없어요.");
 }
 if(state.screen==="browser"){
  if(state.detail<0)return '<div style="background:#e9eefd;border-radius:13px;padding:12px;margin-bottom:15px;color:#6a6499;font-size:12px">◎　최근 방문한 페이지 / 검색 기록</div>'+a.map(function(v,i){return '<button class="app-item clickable" data-action="phone-detail" data-index="'+i+'"><span class="app-item-icon">◎</span><span><h3>'+esc(v.query)+'</h3><p>'+esc(v.url||"최근 검색 기록")+'</p></span></button>'}).join("");
  var b=a[state.detail];return b?'<div class="app-article"><div style="font-size:11px;color:#9188b6;margin-bottom:11px">◎ '+esc(b.url||"검색 기록")+'</div><h2>'+esc(b.query)+'</h2><p>'+txt(b.content)+'</p></div>':empty("기록이 없어요.");
 }
 if(state.screen==="calendar")return a.map(function(v){return '<div class="day-pill">'+esc(v.date)+'</div><div class="app-item"><span class="app-item-icon">▦</span><span><h3>'+esc(v.title)+'</h3><p>'+txt(v.detail)+'</p></span></div>'}).join("");
 if(state.screen==="gallery"){
  if(state.detail<0)return '<div class="image-grid">'+a.map(function(v,i){return '<button class="gallery-item" data-action="phone-detail" data-index="'+i+'">'+(img(v.url)||'<span>▧<br>'+esc(v.title)+'</span>')+'</button>'}).join("")+'</div>';
  var g=a[state.detail];return g?'<div class="app-article photo-detail">'+(img(g.url)||'<div style="font-size:55px">▧</div>')+'<h2>'+esc(g.title)+'</h2><p>'+txt(g.caption)+'</p></div>':empty("사진이 없어요.");
 }
 if(state.screen==="calls")return a.map(function(v){return '<div class="app-item"><span class="app-item-icon">☎</span><span><h3 style="'+(/부재중/.test(v.type)?"color:#d3646f":"")+'">'+esc(v.name)+'</h3><p>'+esc(v.type)+' · '+esc(v.date)+'</p></span></div>'}).join("");
 return empty("기록이 없어요.");
}
function renderEditorOnly(){
 var el=document.getElementById("editorBody");if(el&&current())el.innerHTML=renderEditor(current());renderPhone();
}
function ensureArray(kind){var p=current();return p&&Array.isArray(p[kind])?p[kind]:null}
function onAction(btn){
 var action=btn.dataset.action,id=btn.dataset.id,p=current(),n=parseInt(btn.dataset.index,10),ln=parseInt(btn.dataset.line,10);
 if(action==="home"){removeHash();setMode("library");return}
 if(action==="new"){addPhone();return}
 if(action==="demo"){openViewer(demo,false);return}
 if(action==="view"){var v=state.phones.find(function(x){return x.id===id});if(v)openViewer(v,false);return}
 if(action==="edit"){var v2=state.phones.find(function(x){return x.id===id});if(v2)openEditor(v2);return}
 if(action==="delete"){confirmDelete(id);return}
 if(action==="fork"){if(p)addPhone(p);return}
 if(action==="tab"){state.tab=btn.dataset.tab;renderEditorOnly();return}
 if(action==="mobile"){state.mobile=btn.dataset.view;var layout=document.querySelector(".studio-layout");if(layout){layout.className="studio-layout mobile-"+state.mobile;document.querySelectorAll(".mobile-switch button").forEach(function(b){b.classList.toggle("primary",b.dataset.view===state.mobile)})}return}
 if(action==="add-chat"&&p){p.messages.push({name:"새 대화 상대",lines:[{who:"them",text:"안녕?",time:"12:00"}]});save();renderEditorOnly();return}
 if(action==="delete-chat"&&p){p.messages.splice(n,1);save();renderEditorOnly();return}
 if(action==="add-line"&&p&&p.messages[n]){p.messages[n].lines.push({who:"me",text:"",time:"12:00"});save();renderEditorOnly();return}
 if(action==="delete-line"&&p&&p.messages[n]){p.messages[n].lines.splice(ln,1);save();renderEditorOnly();return}
 if(action==="add-row"&&p&&DEFINITIONS[btn.dataset.kind]){p[btn.dataset.kind].push(clone(defaults[btn.dataset.kind]));save();renderEditorOnly();return}
 if(action==="delete-row"&&p&&DEFINITIONS[btn.dataset.kind]){p[btn.dataset.kind].splice(n,1);save();renderEditorOnly();return}
 if(action==="phone-unlock"){state.screen="home";state.detail=-1;renderPhone();return}
 if(action==="phone-home"){state.screen="home";state.detail=-1;renderPhone();return}
 if(action==="open-app"){state.screen=btn.dataset.app;state.detail=-1;renderPhone();return}
 if(action==="phone-detail"){state.detail=n;renderPhone();return}
 if(action==="phone-back"){state.detail=-1;renderPhone();return}
 if(action==="share"){openShare();return}
 if(action==="close-share"){document.getElementById("shareCover")?.remove();return}
 if(action==="copy-share"){copyShare();return}
 if(action==="native-share"){nativeShare();return}
 if(action==="export"){exportJson();return}
 if(action==="import"){document.getElementById("importFile")?.click();return}
}
document.addEventListener("click",function(e){
 var btn=e.target.closest("[data-action]");if(btn){e.preventDefault();onAction(btn)}
 if(e.target&&e.target.id==="shareCover")e.target.remove();
});
document.addEventListener("input",function(e){
 var t=e.target,p=current();if(state.mode!=="editor"||!p||!t)return;
 if(t.dataset.profile){var key=t.dataset.profile;var value=t.value;if(key==="theme"&&!THEMES[value])return;p[key]=value;save();renderPhone();return}
 if(t.dataset.chat!=null){var i=Number(t.dataset.chat);if(p.messages[i])p.messages[i].name=t.value;save();renderPhone();return}
 if(t.dataset.lineChat!=null){var i2=Number(t.dataset.lineChat),j=Number(t.dataset.lineIndex),key2=t.dataset.lineKey;if(p.messages[i2]&&p.messages[i2].lines[j]&&["who","text","time"].includes(key2)){p.messages[i2].lines[j][key2]=t.value;save();renderPhone()}return}
 if(t.dataset.record){var kind=t.dataset.record,i3=Number(t.dataset.index),key3=t.dataset.key;if(DEFINITIONS[kind]&&p[kind][i3]&&DEFINITIONS[kind].fields.some(function(f){return f[0]===key3})){p[kind][i3][key3]=t.value;save();renderPhone()}}
});
document.addEventListener("change",function(e){if(e.target.dataset&&e.target.dataset.profile==="theme")renderPhone()});
document.addEventListener("change",async function(e){
 if(e.target.id!=="importFile")return;
 var file=e.target.files&&e.target.files[0];e.target.value="";
 if(!file)return;
 if(file.size>500000){toast("500KB 이하 JSON 파일만 불러올 수 있어요.");return}
 try{var obj=JSON.parse(await file.text());if(!obj||typeof obj!=="object"||Array.isArray(obj))throw Error("bad");addPhone(obj);toast("JSON 파일을 불러왔어요.")}catch(ex){toast("올바른 캐릭터 JSON 파일이 아니에요.")}
});
function exportJson(){
 var p=current();if(!p)return;
 var blob=new Blob([JSON.stringify(p,null,2)],{type:"application/json;charset=utf-8"});
 var url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=(p.name||"character").replace(/[/\\?%*:|"<>]/g,"_")+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1000);toast("JSON 백업 파일을 준비했어요.");
}
function b64url(bytes){
 var str="";for(var i=0;i<bytes.length;i+=16384)str+=String.fromCharCode.apply(null,bytes.subarray(i,i+16384));
 return btoa(str).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function fromB64url(raw){
 if(!/^[A-Za-z0-9_-]+$/.test(raw)||raw.length>50000)throw Error("invalid");
 var bin=atob(raw.replace(/-/g,"+").replace(/_/g,"/")),out=new Uint8Array(bin.length);
 for(var i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
 return out;
}
async function pack(p){
 var obj=clone(p);delete obj.id;var raw=new TextEncoder().encode(JSON.stringify(obj));
 if(typeof CompressionStream!=="undefined"){
  var comp=await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
  return "g"+b64url(new Uint8Array(comp));
 }
 return "j"+b64url(raw);
}
async function unpack(token){
 if(token.length>50000)throw Error("long");
 var mode=token[0],bytes=fromB64url(token.slice(1));
 if(mode==="g"){
  if(typeof DecompressionStream==="undefined")throw Error("unsupported");
  bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
 }else if(mode!=="j")throw Error("bad");
 if(bytes.length>500000)throw Error("too big");
 return normalize(JSON.parse(new TextDecoder().decode(bytes)));
}
async function openShare(){
 var p=current();if(!p)return;
 var overlay=document.createElement("div");overlay.id="shareCover";overlay.className="modal-cover";
 overlay.innerHTML='<div class="modal"><h2>✦ 이 휴대폰 공유하기</h2><p>링크를 받은 사람은 회원가입 없이 캐릭터의 휴대폰을 엿볼 수 있어요. 링크에 작품 내용이 포함되니 개인정보는 넣지 마세요.</p><div class="field"><label>공유 링크</label><textarea class="share-field" id="shareLink" readonly>링크 생성 중...</textarea></div><div id="shareSize" class="muted-small"></div><div class="modal-actions"><button class="primary" data-action="copy-share">링크 복사</button><button data-action="native-share">공유하기</button><button class="ghost" data-action="close-share">닫기</button></div></div>';
 document.body.appendChild(overlay);
 try{
  var token=await pack(p),url=location.origin+location.pathname+location.search+"#p="+token;
  var input=document.getElementById("shareLink"),hint=document.getElementById("shareSize");
  if(!input)return;
  if(url.length>12000){
   input.value="";hint.textContent="⚠ 기록이 많아서 공유 링크가 너무 길어요 ("+url.length+"자). 기록을 줄여 주세요.";document.querySelector('[data-action="copy-share"]').disabled=true;
  }else{
   input.value=url;
   hint.textContent="링크 길이 "+url.length+"자 · "+(url.length>6000?"길어서 일부 메신저에서 잘릴 수 있어요. JSON 백업도 권장해요.":"완성된 휴대폰을 링크로 열 수 있어요.");
  }
 }catch(e){document.getElementById("shareSize").textContent="공유 링크를 만들지 못했어요. 최신 브라우저를 이용해 주세요."}
}
async function copyShare(){
 var el=document.getElementById("shareLink");if(!el||!el.value||el.value.indexOf("http")!==0)return;
 try{await navigator.clipboard.writeText(el.value);toast("공유 링크를 복사했어요!")}catch(e){el.focus();el.select();document.execCommand("copy");toast("링크를 선택했어요. 길게 눌러 복사해 주세요.")}
}
async function nativeShare(){
 var el=document.getElementById("shareLink");if(!el||!el.value||el.value.indexOf("http")!==0)return;
 if(navigator.share){try{await navigator.share({title:current().name+"의 휴대폰",url:el.value})}catch(e){}}else{copyShare()}
}
async function loadHash(){
 if(!location.hash.startsWith("#p="))return;
 try{
  var p=await unpack(location.hash.slice(3));state.shared=p;resetPhone();setMode("viewer");
 }catch(e){removeHash();setMode("library");toast("공유 링크를 읽지 못했어요. 전체 링크를 다시 확인해 주세요.")}
}
window.addEventListener("hashchange",function(){if(location.hash.startsWith("#p="))loadHash()});
render();
loadHash();
})();
