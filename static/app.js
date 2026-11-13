/* GranaLab — lógica do app (módulos, aulas, atividades, quizzes, progresso e chat). */
var IC={home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5"/>',quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 115 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>',chat:'<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',coin:'<circle cx="12" cy="12" r="9"/><path d="M14.5 9a3 3 0 00-5 1.5c0 3 5 1.5 5 4.5a3 3 0 01-5 1M12 6v2M12 16v2"/>',check:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',moon:'<path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',flame:'<path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-9-2 2-3 3-3 5-1-1-2-2-2-4-3 2-5 5-5 8 0 4 3 7 7 7z"/>',wallet:'<path d="M3 7h16a2 2 0 012 2v10H5a2 2 0 01-2-2zM3 7l3-3h11v3"/><circle cx="16.5" cy="13" r="1"/>',cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12h11l2-8H6"/>',flag:'<path d="M5 22V3M5 4h13l-2 4 2 4H5"/>',folder:'<path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',back:'<path d="M15 5l-7 7 7 7"/>',chev:'<path d="M6 9l6 6 6-6"/>',logout:'<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h9"/>',bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3 11v2h6v-2a6 6 0 00-3-11z"/>'};
function icon(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>'}
document.querySelectorAll('svg[data-i]').forEach(function(s){s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.innerHTML=IC[s.dataset.i]});

/* ---------- Utilidades ---------- */
function $(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function brl(v){var n=Number(v);if(!isFinite(n))n=0;return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function pct(v){var n=Number(v);if(!isFinite(n))n=0;return (Math.round(n*10)/10).toLocaleString('pt-BR')+'%'}
function num(id){var el=$(id);var v=el?parseFloat(String(el.value).replace(',','.')):0;return isFinite(v)&&v>0?v:0}
function hint(text){return '<p class="hint">'+text+'</p>'}
function scrollToId(id){var el=$(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
function readJSON(k,f){try{var v=JSON.parse(localStorage.getItem(k));return v==null?f:v}catch(e){return f}}
function writeJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}

/* ---------- Conta local ---------- */
var USERS_KEY='granalab.users',SESSION_KEY='granalab.session';
var session=readJSON(SESSION_KEY,null);
if(!session||!session.name)session=null;
var currentUser=null;

/* ---------- Classes de conta e progresso ---------- */
class Usuario {
 constructor(data){
  data=data||{};
  this.nome=data.name||data.nome||'';
  this.chaveLocal=this.nome.trim().toLowerCase();
  this.salt=data.salt||'';
  this.hashSenha=data.hash||data.hashSenha||'';
  this.dataCriacao=data.created||data.dataCriacao||null;
  this.progresso=data.progresso||null;
 }
 static carregar(nome){
  var users=readJSON(USERS_KEY,{});
  var registro=users[(nome||'').trim().toLowerCase()];
  return registro?new Usuario(registro):null;
 }
 async criarConta(nome,senha){
  var nomeLimpo=(nome||'').replace(/\s+/g,' ').trim();
  var chave=nomeLimpo.toLowerCase();
  var users=readJSON(USERS_KEY,{});
  if(users[chave])return {ok:false,motivo:'existe',usuario:new Usuario(users[chave])};
  var salt=makeSalt();
  var hash=await hashPass(senha,salt);
  var registro={name:nomeLimpo,salt:salt,hash:hash,created:Date.now()};
  users[chave]=registro;
  if(!writeJSON(USERS_KEY,users))return {ok:false,motivo:'armazenamento'};
  return {ok:true,usuario:new Usuario(registro)};
 }
 async entrar(nome,senha){
  var chave=(nome||'').trim().toLowerCase();
  var users=readJSON(USERS_KEY,{});
  var registro=users[chave];
  if(!registro)return {ok:false,motivo:'nao_encontrado'};
  var hash=await hashPass(senha,registro.salt);
  if(hash!==registro.hash)return {ok:false,motivo:'senha'};
  return {ok:true,usuario:new Usuario(registro)};
 }
 sair(){
  try{localStorage.removeItem(SESSION_KEY)}catch(e){}
 }
}

class ProgressoModulo {
 constructor(id,data){
  data=data||{};
  this.moduloId=id||data.moduloId||'';
  this.seen=!!data.seen;
  this.problem=!!data.problem;
  this.problemChoice=(data.problemChoice===undefined?null:data.problemChoice);
  this.activity=!!data.activity;
  this.quizBest=(data.quizBest===undefined?null:data.quizBest);
  this.quizDone=!!data.quizDone;
  this.done=!!data.done;
  this.updatedAt=data.updatedAt||0;
 }
 get aulaVista(){return this.seen}
 get problemaResolvido(){return this.problem}
 get escolhaProblema(){return this.problemChoice}
 get atividadeConcluida(){return this.activity}
 get melhorQuiz(){return this.quizBest}
 get quizConcluido(){return this.quizDone}
 get concluido(){return this.done}
 get atualizadoEm(){return this.updatedAt}
 percentual(){
  var v=0;
  if(this.seen)v+=10;
  if(this.problem)v+=20;
  if(this.activity)v+=30;
  if(this.quizDone)v+=30;
  if(this.done)v+=10;
  return v;
 }
 status(){
  if(this.done)return StatusModulo.CONCLUIDO;
  if(this.percentual()===0)return StatusModulo.NAO_INICIADO;
  return StatusModulo.EM_ANDAMENTO;
 }
}

class ProgressoUsuario {
 constructor(modulos){
  this.modulos=modulos||{};
 }
 lista(){
  var self=this;
  return Object.keys(this.modulos).map(function(id){return self.modulos[id]});
 }
 totalConcluidos(){return this.lista().filter(function(p){return p.done}).length}
 pontuacaoTotal(){return this.lista().reduce(function(t,p){return t+(p.quizBest?p.quizBest*10:0)},0)}
 quizzesConcluidos(){return this.lista().filter(function(p){return p.quizDone})}
 mediaAcertos(){
  var feitos=this.quizzesConcluidos();
  if(!feitos.length)return 0;
  var soma=feitos.reduce(function(t,p){return t+(p.quizBest||0)},0);
  return Math.round(soma/(feitos.length*5)*100);
 }
 quizPerfeito(){return this.quizzesConcluidos().some(function(p){return p.quizBest===5})}
 conquistas(){return typeof achievements==='function'?achievements():[]}
}

class AreaAprendizagem {
 constructor(raw){
  this.nome=raw.label;
  this.icone=raw.icon;
  this.ids=(raw.ids||[]).slice();
 }
 get label(){return this.nome}
 get icon(){return this.icone}
 percentual(progresso){
  if(!this.ids.length)return 0;
  return Math.round(this.ids.reduce(function(t,id){return t+(progresso[id]?progresso[id].percentual():0)},0)/this.ids.length);
 }
}

class Conquista {
 constructor(raw){Object.assign(this,raw)}
 get titulo(){return this.label}
 get descricao(){return this.desc}
 get icone(){return this.icon}
 desbloqueada(){return !!this.unlocked}
}

/* ---------- Progresso ---------- */
var progress={};
function userKey(){return (session&&session.name?session.name:'visitante').trim().toLowerCase()}
function progressKey(){return 'granalab.progress.'+userKey()}
function loadProgress(){
 var raw=readJSON(progressKey(),{})||{};
 progress={};
 Object.keys(raw).forEach(function(id){progress[id]=new ProgressoModulo(id,raw[id])});
}
function saveProgress(){writeJSON(progressKey(),progress)}
function pm(id){
 if(!progress[id])progress[id]=new ProgressoModulo(id,{});
 return progress[id];
}
function touch(p){p.updatedAt=Date.now()}
function progressUser(){return new ProgressoUsuario(progress)}
function pctOf(id){var p=progress[id];return p?p.percentual():0}
function statusOf(id){
 var p=progress[id];
 return p?p.status():StatusModulo.NAO_INICIADO;
}
function tagClass(s){return s.key==='done'?'tag':s.key==='doing'?'tag b':'tag n'}
function ctaFor(id){var s=statusOf(id);return s.key==='new'?'Começar módulo':s.key==='doing'?'Continuar':'Revisar'}
function pointsOf(){return progressUser().pontuacaoTotal()}
function doneCount(){return progressUser().totalConcluidos()}
function quizStats(){
 var u=progressUser();
 var feitos=u.quizzesConcluidos();
 if(!feitos.length)return {count:0,avg:0,perfect:false};
 return {count:feitos.length,avg:u.mediaAcertos(),perfect:u.quizPerfeito()};
}
function overallPct(){if(!MODULES.length)return 0;return Math.round(MODULES.reduce(function(t,m){return t+pctOf(m.id)},0)/MODULES.length)}
function startedCount(){return MODULES.filter(function(m){return pctOf(m.id)>0}).length}
function studyStreak(){
 var days={},count=0;
 MODULES.forEach(function(m){
  var p=progress[m.id];
  if(!p||!p.updatedAt)return;
  var d=new Date(p.updatedAt);
  days[d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()]=true;
 });
 var cursor=new Date();
 function dayKey(d){return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()}
 if(!days[dayKey(cursor)])cursor.setDate(cursor.getDate()-1);
 while(days[dayKey(cursor)]){
  count++;
  cursor.setDate(cursor.getDate()-1);
 }
 return count;
}
/* Áreas de aprendizagem: cada uma reúne módulos afins e usa o progresso real. */
var AREAS=[
 {label:'Planejamento financeiro',icon:'piggy',ids:['m1','m2']},
 {label:'Orçamento pessoal',icon:'calculator',ids:['m3','m4']},
 {label:'Economia consciente',icon:'coinStack',ids:['m5','m7']},
 {label:'Organização das finanças',icon:'growth',ids:['m6','m8','m9','m10']}
].map(function(a){return new AreaAprendizagem(a)});
function areaPct(area){
 return area.percentual(progress);
}
function achievements(){
 var done=doneCount(),pts=pointsOf(),qs=quizStats(),started=startedCount(),streak=studyStreak();
 return [
  {id:'first',label:'Primeiro módulo',desc:'Conclua seu primeiro módulo.',icon:'book',unlocked:done>=1},
  {id:'streak',label:'5 dias seguidos',desc:'Estude por 5 dias seguidos.',icon:'medalGold',unlocked:streak>=5},
  {id:'points',label:'500 pontos',desc:'Acumule 500 pontos nos quizzes.',icon:'coinStack',unlocked:pts>=500},
  {id:'perfect',label:'Quiz perfeito',desc:'Acerte todas as questões de um quiz.',icon:'trophy',unlocked:qs.perfect},
  {id:'explorer',label:'Explorador',desc:'Comece 5 módulos diferentes.',icon:'starGold',unlocked:started>=5},
  {id:'accuracy',label:'Precisão de 80%',desc:'Mantenha 80% de acerto com 3 quizzes feitos.',icon:'shield',unlocked:qs.count>=3&&qs.avg>=80},
  {id:'complete',label:'Curso completo',desc:'Conclua os 10 módulos da trilha.',icon:'medalGold',unlocked:done>=MODULES.length}
 ].map(function(a){return new Conquista(a)});
}
function unlockedAchievements(){return achievements().filter(function(a){return a.unlocked}).length}
function nextModule(){
 var doing=MODULES.filter(function(m){var p=progress[m.id];return p&&pctOf(m.id)>0&&!p.done});
 if(doing.length)return doing[0];
 return MODULES.filter(function(m){return !progress[m.id]||pctOf(m.id)===0})[0]||null;
}
function whenLabel(ts){
 if(!ts)return '—';
 var d=new Date(ts),now=new Date();
 var a=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
 var b=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
 var diff=Math.round((a-b)/86400000);
 if(diff<=0)return 'Hoje';
 if(diff===1)return 'Ontem';
 return d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0');
}

/* ---------- Módulos ---------- */
var MOD={};
MODULES.forEach(function(m){MOD[m.id]=m});
function moduleDesc(m){return m.desc}
function moduleTime(m){return m.dur}

function moduleTone(m){return 'tone-'+(((m.n-1)%10)+1)}
function moduleCard(m){
 var s=statusOf(m.id);
 var cta=s.key==='done'?'Revisar':s.key==='doing'?'Continuar':'Começar';
 return '<button class="mod-card '+moduleTone(m)+' is-'+s.key+'" type="button" data-mod="'+m.id+'" aria-label="Módulo '+m.n+': '+esc(m.t)+'. '+s.label+'. '+cta+'">'+
  '<span class="mod-card-head"><span class="mod-icon">'+pixelImg(moduleArt(m),'mod-ico',moduleArtAlt(m))+'</span>'+
  '<span class="mod-meta"><span class="mod-num">Módulo '+m.n+'</span><span class="mod-title">'+esc(m.t)+'</span></span></span>'+
  '<span class="mod-status">'+pixelImg(statusArt(s.key).key,'status-ico','')+s.label+'</span>'+
  '<span class="mod-btn">'+cta+'</span>'+
  '</button>';
}
function renderModuleList(){
 var list=$('modList'),det=$('modDetail');
 if(!list)return;
 det.classList.remove('on');det.innerHTML='';
 list.style.display='';
 list.innerHTML=MODULES.map(moduleCard).join('');
}
function renderQuizHub(){
 var hub=$('quizHub');if(!hub)return;
 hub.innerHTML=MODULES.map(function(m){
  var p=progress[m.id],best=p&&p.quizDone?p.quizBest:null;
  var state=best===5?'done':(best!=null||pctOf(m.id)>0)?'doing':'new';
  var label=best==null?'Não feito':best===5?'Gabaritou':'Melhor: '+best+'/5';
  var statusIcon=best===5?'medalGold':state==='doing'?'iconDoing':'iconNew';
  return '<button class="mod-card '+moduleTone(m)+' is-'+state+'" type="button" data-quiz="'+m.id+'" aria-label="Quiz do módulo '+m.n+': '+esc(m.t)+'. '+label+'">'+
   '<span class="mod-card-head"><span class="mod-icon">'+pixelImg(moduleArt(m),'mod-ico',moduleArtAlt(m))+'</span>'+
   '<span class="mod-meta"><span class="mod-num">Módulo '+m.n+' · 5 perguntas</span><span class="mod-title">'+esc(m.t)+'</span></span></span>'+
   '<span class="mod-status">'+pixelImg(statusIcon,'status-ico','')+label+'</span>'+
   '<span class="mod-btn">Fazer quiz</span>'+
   '</button>';
 }).join('');
}

/* ---------- Aula ---------- */
var lessonId=null;

function lessonHTML(m){
 var p=pm(m.id),v=pctOf(m.id),s=statusOf(m.id),rows=[];
 rows.push('<div class="lesson-head"><div class="lesson-meta"><span class="tag" id="lessonTag">'+pixelImg(statusArt(s.key).key,'tag-ico','')+s.label+'</span><span class="mute">Módulo '+m.n+' · '+esc(m.dur)+'</span></div><div class="lesson-title-row"><div><h2>'+esc(m.t)+'</h2><p class="mute">'+esc(m.desc)+'</p></div>'+pixelImg(moduleArt(m),'lesson-art',moduleArtAlt(m))+'</div><div class="lesson-progress"><div class="bar"><i id="lessonBar" style="width:'+v+'%"></i></div><span class="mute" id="lessonPct">'+v+'% concluído</span></div></div>');
 rows.push('<section class="lesson-sec"><h2>Introdução</h2><p>'+esc(m.intro.lead)+'</p><p>'+esc(m.intro.why)+'</p><div class="hl">'+icon('bulb')+'<div><b>O que você vai aprender</b><ul>'+m.intro.learn.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div></div></section>');
 rows.push('<section class="lesson-sec"><h2>Objetivos de aprendizagem</h2><ul class="obj-list">'+m.objectives.map(function(o){return '<li>'+icon('check')+'<span>'+esc(o)+'</span></li>'}).join('')+'</ul></section>');
 rows.push('<section class="lesson-sec"><h2>Conteúdo</h2>'+m.sections.map(function(sec){
  return '<div class="topic"><h3>'+esc(sec.h)+'</h3>'+sec.p.map(function(t){return '<p>'+esc(t)+'</p>'}).join('')+
   (sec.ex?'<div class="example"><b>No dia a dia</b><p>'+esc(sec.ex)+'</p></div>':'')+
   (sec.hl?'<div class="hl">'+icon('bulb')+'<div><b>Conceito importante</b><p>'+esc(sec.hl)+'</p></div></div>':'')+
   (sec.viz?'<div class="viz">'+sec.viz.map(function(b){return '<div class="viz-row"><span class="mute">'+esc(b[0])+'</span><div class="bar'+(b[2]==='#2A6FDB'?' b':'')+'"><i style="width:'+b[1]+'%;background:'+b[2]+'"></i></div></div>'}).join('')+'</div>':'')+
   '</div>';
 }).join('')+'</section>');
 rows.push('<section class="lesson-sec"><h2>Exemplo prático</h2>'+m.caseEx.p.map(function(t){return '<p>'+esc(t)+'</p>'}).join('')+
  '<div class="case"><ul class="res-list">'+m.caseEx.lines.map(function(l){return '<li><span>'+esc(l[0])+'</span><b>'+esc(l[1])+'</b></li>'}).join('')+'</ul><p class="mute">'+esc(m.caseEx.calc)+'</p></div></section>');
 rows.push('<section class="lesson-sec" id="probSec"><h2>Situação-problema</h2><p class="mute">Leia o caso e escolha uma alternativa. A explicação aparece depois da sua escolha.</p><p class="prob-q">'+esc(m.problem.q)+'</p><div class="opts" id="probOpts">'+
  m.problem.opts.map(function(o,i){return '<button class="opt" type="button" data-pi="'+i+'"'+(p.problem?' disabled':'')+'><span class="k">'+'ABCD'[i]+'</span>'+esc(o.t)+'</button>'}).join('')+
  '</div><div id="probFb"></div></section>');
 rows.push('<section class="lesson-sec" id="actSec"><h2>Atividade</h2><div id="actBox"></div></section>');
 rows.push('<section class="lesson-sec" id="quizSec"><h2>Quiz do módulo</h2><p class="mute">5 perguntas. Você só descobre a resposta depois de confirmar.</p><div id="quizBoxM"></div></section>');
 rows.push('<section class="lesson-sec" id="aiSec"><h2>Ficou com dúvida?</h2><p class="mute">O assistente pode explicar este módulo com outros exemplos e resolver cálculos passo a passo.</p><button class="btn ghost" type="button" id="askAi">'+icon('chat')+'Perguntar ao assistente</button></section>');
 rows.push('<section class="lesson-sec" id="endSec"><h2>Conclusão da aula</h2><div class="hl">'+icon('bulb')+'<div><b>Resumo</b><ul>'+m.summary.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div></div>'+
  '<div class="lesson-actions"><button class="btn" type="button" id="doneBtn">Marcar aula como concluída</button><button class="btn ghost" type="button" id="nextBtn">Próximo módulo</button></div><p class="hint" id="doneHint"></p></section>');
 return '<button class="btn ghost back" type="button" id="bk">'+icon('back')+'Voltar aos módulos</button><div class="lesson">'+rows.join('')+'</div>';
}

function renderLesson(id){
 var m=MOD[id];if(!m)return;
 var det=$('modDetail'),list=$('modList');
 var p=pm(id);
 if(!p.seen){p.seen=true;touch(p);saveProgress()}
 det.innerHTML=lessonHTML(m);
 det.classList.add('on');
 list.style.display='none';

 $('bk').onclick=function(){lessonId=null;renderModuleList();window.scrollTo(0,0)};
 det.querySelectorAll('#probOpts .opt').forEach(function(b){
  b.onclick=function(){answerProblem(m,+b.dataset.pi)};
 });
 if(p.problem)showProblemFeedback(m,p.problemChoice);
 m.activity.renderizar(m,$('actBox'));
 renderQuiz(m,$('quizBoxM'));
 $('askAi').onclick=function(){setContext(m)};
 $('doneBtn').onclick=function(){markDone(m)};
 $('nextBtn').onclick=function(){goNext(m)};
 syncLesson(m);
}

function syncLesson(m){
 var p=progress[m.id]||pm(m.id),v=pctOf(m.id),s=statusOf(m.id);
 var bar=$('lessonBar'),txt=$('lessonPct'),tag=$('lessonTag');
 if(bar)bar.style.width=v+'%';
 if(txt)txt.textContent=v+'% concluído';
 if(tag){tag.textContent=s.label;tag.className=tagClass(s).replace('tag','tag')}
 var done=$('doneBtn');
 if(done){done.textContent=p.done?'Aula concluída':'Marcar aula como concluída';done.disabled=false}
 var hintEl=$('doneHint');
 if(hintEl)hintEl.textContent=p.done?'Módulo concluído. Você pode revisar a aula e refazer o quiz quando quiser.':!p.activity?'Falta concluir a atividade prática para liberar a conclusão.':!p.quizDone?'Falta responder ao quiz do módulo.':'Tudo pronto! Marque a aula como concluída.';
}

function answerProblem(m,i){
 var p=pm(m.id);
 if(p.problem)return;
 p.problem=true;p.problemChoice=i;touch(p);saveProgress();
 var det=$('modDetail');
 det.querySelectorAll('#probOpts .opt').forEach(function(b){
  b.disabled=true;
  var k=+b.dataset.pi;
  if(m.problem.opts[k].best)b.classList.add('ok');
  if(k===i&&!m.problem.opts[k].best)b.classList.add('bad');
  if(k===i)b.classList.add('sel');
 });
 showProblemFeedback(m,i);
 syncLesson(m);
}
function showProblemFeedback(m,i){
 var p=pm(m.id),chosen=m.problem.opts[i],fb=$('probFb');
 if(!fb||!chosen)return;
 var tone=chosen.best?'ok':'bad',title=chosen.best?'Boa escolha!':'Vale reconsiderar';
 fb.innerHTML='<div class="fb '+tone+'"><b>'+title+'</b><p>'+esc(chosen.fb)+'</p></div>';
 var det=$('modDetail');
 det.querySelectorAll('#probOpts .opt').forEach(function(b){
  var k=+b.dataset.pi;
  if(m.problem.opts[k].best)b.classList.add('ok');
  if(k===i&&!m.problem.opts[k].best)b.classList.add('bad');
  b.disabled=true;
 });
}

function completeActivity(m){
 var p=pm(m.id);
 p.activity=true;touch(p);saveProgress();
 syncLesson(m);
 toast('Atividade concluída!');
}
function markDone(m){
 var p=pm(m.id);
 if(p.done){toast('Esta aula já está concluída.');return}
 if(!p.activity){toast('Conclua a atividade prática primeiro.');scrollToId('actSec');return}
 if(!p.quizDone){toast('Responda ao quiz do módulo primeiro.');scrollToId('quizSec');return}
 p.done=true;touch(p);saveProgress();
 syncLesson(m);
 toast('Módulo concluído! Bom trabalho.');
}
function goNext(m){
 var next=MODULES.filter(function(x){return x.n===m.n+1})[0];
 if(next){openModule(next.id);return}
 lessonId=null;renderModuleList();
 toast('Você chegou ao fim dos 10 módulos!');
}

function openModule(id,target){
 var m=MOD[id];if(!m)return;
 lessonId=id;
 var p=pm(id);
 if(!p.seen){p.seen=true;touch(p);saveProgress()}
 if((location.hash||'#inicio').slice(1)==='modulos'){renderLesson(id)}
 else{location.hash='#modulos'}
 if(target==='quiz'){setTimeout(function(){scrollToId('quizSec')},260)}
 else{setTimeout(function(){window.scrollTo(0,0)},20)}
}

/* ---------- Atividades ---------- */
function field(id,label,val,step){
 return '<div class="field"><label for="'+id+'">'+esc(label)+'</label><input type="number" id="'+id+'" min="0" step="'+(step||'1')+'" inputmode="decimal" value="'+val+'"></div>';
}
function resultCard(tone,title,rows,note){
 return '<div class="result-card'+(tone==='bad'?' bad':'')+'"><h3>'+esc(title)+'</h3>'+
  (rows?'<ul class="res-list">'+rows.map(function(r){return '<li><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></li>'}).join('')+'</ul>':'')+
  (note?'<p>'+esc(note)+'</p>':'')+'</div>';
}
function renderActivity(m,box){
 var a=m.activity,id=m.id,out='actOut-'+id,html='';
 if(a.kind==='final'){renderFinalActivity(m,box);return}
 html+='<p class="mute">'+esc(a.intro)+'</p><div class="act-grid">';
 if(a.kind==='budget'){
  a.fields.forEach(function(f){html+=field('a-'+id+'-'+f.k,f.label,f.v,5)});
  html+='</div><p class="hint">Total distribuído: <b id="budgetTotal-'+id+'">0</b> de R$ 100</p><div class="lesson-actions"><button class="btn" type="button" id="actGo-'+id+'">Ver resultado</button></div>';
 }else if(a.kind==='goal'){
  html+=field('a-'+id+'-meta','Valor da meta (R$)',a.meta,10)+field('a-'+id+'-guardado','Já tenho guardado (R$)',a.guardado,10)+field('a-'+id+'-meses','Prazo em meses',a.meses,1);
  html+='</div><div class="lesson-actions"><button class="btn" type="button" id="actGo-'+id+'">Calcular economia mensal</button></div>';
 }else if(a.kind==='table'){
  html+='<p class="hint">Receita do mês: <b>'+brl(a.receita)+'</b></p>';
  a.items.forEach(function(it){html+=field('a-'+id+'-'+it.k,it.label+' (R$)',it.v,5)});
  html+='</div><div class="lesson-actions"><button class="btn" type="button" id="actGo-'+id+'">Fechar o orçamento</button></div>';
 }else if(a.kind==='savings'){
  html+=field('a-'+id+'-diario','Gasto por dia (R$)',a.diario,0.5)+field('a-'+id+'-dias','Dias por semana',a.dias,1);
  html+='</div><div class="lesson-actions"><button class="btn" type="button" id="actGo-'+id+'">Calcular economia</button></div>';
 }else if(a.kind==='compare'){
  html+=field('a-'+id+'-avista','Preço à vista (R$)',a.avista,10)+field('a-'+id+'-parcelas','Número de parcelas',a.parcelas,1)+field('a-'+id+'-parcela','Valor da parcela (R$)',a.parcela,1);
  html+='</div><div class="lesson-actions"><button class="btn" type="button" id="actGo-'+id+'">Comparar pagamentos</button></div>';
 }else if(a.kind==='invoice'){
  html+='<div class="tblwrap"><table class="tbl"><thead><tr><th>Compra</th><th>Valor</th><th>Categoria</th></tr></thead><tbody>';
  a.items.forEach(function(it,i){
   html+='<tr><td>'+esc(it.d)+'</td><td>'+brl(it.v)+'</td><td><select id="a-'+id+'-cat'+i+'" class="sel-input"><option value="">Escolha…</option>'+a.cats.map(function(c){return '<option value="'+esc(c)+'">'+esc(c)+'</option>'}).join('')+'</select></td></tr>';
  });
  html+='</tbody></table></div></div>';
  html+='<div class="lesson-actions"><button class="btn" type="button" id="actGo-'+id+'">Fechar fatura</button></div>';
 }else if(a.kind==='reserve'){
  html+=field('a-'+id+'-gastos','Despesas essenciais por mês (R$)',a.gastos,10)+field('a-'+id+'-guardar','Quanto guardo por mês (R$)',a.guardar,5);
  html+='</div><p class="hint">Quais imprevistos a reserva deve cobrir?</p><div class="checks">';
  a.imprevistos.forEach(function(im,i){
   html+='<label class="check"><input type="checkbox" id="a-'+id+'-imp'+i+'" value="'+im.v+'"'+(im.ess?' checked':'')+'><span>'+esc(im.d)+' — '+brl(im.v)+'</span></label>';
  });
  html+='</div><div class="lesson-actions"><button class="btn" type="button" id="actGo-'+id+'">Montar minha reserva</button></div>';
 }else if(a.kind==='sales'){
  html+=field('a-'+id+'-custo','Custo total dos ingredientes (R$)',a.custo,5)+field('a-'+id+'-qtd','Unidades produzidas',a.qtd,1)+field('a-'+id+'-preco','Preço de venda por unidade (R$)',a.preco,0.5);
  html+='</div><div class="lesson-actions"><button class="btn" type="button" id="actGo-'+id+'">Calcular lucro</button></div>';
 }else if(a.kind==='inflation'){
  html+='<div class="tblwrap"><table class="tbl"><thead><tr><th>Item</th><th>Há 1 ano</th><th>Hoje</th><th>Aumento</th></tr></thead><tbody>';
  a.items.forEach(function(it,i){
   html+='<tr><td>'+esc(it.d)+'</td><td>'+brl(it.antes)+'</td><td><input type="number" id="a-'+id+'-p'+i+'" min="0" step="0.01" value="'+it.depois+'"></td><td id="a-'+id+'-d'+i+'">—</td></tr>';
  });
  html+='</tbody></table></div></div>';
  html+='<div class="lesson-actions"><button class="btn" type="button" id="actGo-'+id+'">Calcular inflação</button></div>';
 }
 html+='<div id="'+out+'" class="result" aria-live="polite"></div>';
 box.innerHTML=html;

 if(a.kind==='budget'){
  var totalEl=$('budgetTotal-'+id);
  function upd(){var t=0;a.fields.forEach(function(f){t+=num('a-'+id+'-'+f.k)});totalEl.textContent=brl(t)}
  a.fields.forEach(function(f){$('a-'+id+'-'+f.k).addEventListener('input',upd)});upd();
 }
 var go=$('actGo-'+id);
 if(go)go.onclick=function(){runActivity(m,box,a,out)};
}

function runActivity(m,box,a,outId){
 var out=$(outId),id=m.id;
 function show(html){out.innerHTML=html}
 function done(html){show(html);completeActivity(m)}
 if(a.kind==='budget'){
  var total=0,dist=[];
  a.fields.forEach(function(f){var v=num('a-'+id+'-'+f.k);dist.push([f.label,v]);total+=v});
  if(Math.abs(total-100)>0.01){show('<div class="fb bad"><b>Ajuste a distribuição</b><p>A soma está em '+brl(total)+'. Ela precisa chegar a exatamente R$ 100,00.</p></div>');return}
  var eco=num('a-'+id+'-economia');
  done(resultCard(eco>=20?'ok':'', 'Seu mês com R$ 100', dist.map(function(d){return [d[0],brl(d[1])]}).concat([['Guardado',brl(eco)]]),
   eco>=20?'Você reservou '+brl(eco)+' ('+pct(eco)+' da mesada). Uma boa referência é guardar pelo menos 20% — você está no caminho.':'Você reservou '+brl(eco)+'. Tente separar ao menos R$ 20 (20%) para criar o hábito de guardar antes de gastar.'));
 }else if(a.kind==='goal'){
  var meta=num('a-'+id+'-meta'),ja=num('a-'+id+'-guardado'),meses=Math.floor(num('a-'+id+'-meses'));
  if(meta<=0||meses<1){show('<div class="fb bad"><b>Dados incompletos</b><p>Informe um valor de meta maior que zero e um prazo de pelo menos 1 mês.</p></div>');return}
  var falta=Math.max(meta-ja,0),porMes=falta/meses;
  done(resultCard('','Sua meta em '+meses+' mês(es)',[['Valor da meta',brl(meta)],['Já guardado',brl(ja)],['Falta guardar',brl(falta)],['Por mês',brl(porMes)],['Por semana',brl(porMes/4)]],
   falta===0?'Você já tem o valor necessário. Que tal definir a próxima meta?':'Guardando '+brl(porMes)+' por mês (cerca de '+brl(porMes/4)+' por semana), a meta é alcançada no prazo. Se não couber no orçamento, aumente o prazo ou reduza o valor.'));
 }else if(a.kind==='table'){
  var tot=0,rows=[];
  a.items.forEach(function(it){var v=num('a-'+id+'-'+it.k);tot+=v;rows.push([it.label,brl(v)])});
  var saldo=a.receita-tot;
  rows.push(['Receita',brl(a.receita)]);rows.push(['Total de despesas',brl(tot)]);rows.push(['Saldo',(saldo<0?'− ':'')+brl(Math.abs(saldo))]);
  done(resultCard(saldo<0?'bad':'',saldo<0?'Mês no vermelho':'Mês no azul',rows,
   saldo<0?'Você gastou '+brl(-saldo)+' a mais do que recebeu. Corte algum gasto variável ou aumente a receita para fechar a conta.':'Sobraram '+brl(saldo)+' no mês. Você pode guardar esse valor ou usá-lo para uma meta.'));
 }else if(a.kind==='savings'){
  var dia=num('a-'+id+'-diario'),dias=Math.floor(num('a-'+id+'-dias'));
  if(dia<=0||dias<1||dias>7){show('<div class="fb bad"><b>Dados inválidos</b><p>Informe um gasto maior que zero e de 1 a 7 dias por semana.</p></div>');return}
  var sem=dia*dias,mes=sem*4,ano=mes*12;
  done(resultCard('','Quanto esse hábito custa',[['Por dia',brl(dia)],['Por semana',brl(sem)],['Por mês (4 semanas)',brl(mes)],['Em 12 meses',brl(ano)]],
   'Reduzir esse gasto pela metade liberaria '+brl(ano/2)+' por ano. Antes de cortar tudo, escolha uma redução que você consiga manter.'));
 }else if(a.kind==='compare'){
  var av=num('a-'+id+'-avista'),n=Math.floor(num('a-'+id+'-parcelas')),pa=num('a-'+id+'-parcela');
  if(av<=0||n<1||pa<=0){show('<div class="fb bad"><b>Dados incompletos</b><p>Informe o preço à vista, o número de parcelas e o valor da parcela.</p></div>');return}
  var tp=pa*n,dif=tp-av,rel=av?dif/av*100:0;
  done(resultCard(dif<=0?'':'bad', dif<=0?'Parcelado sai mais barato':'Parcelado custa mais caro',
   [['Total à vista',brl(av)],['Total parcelado',brl(tp)],['Diferença',(dif<0?'− ':'')+brl(Math.abs(dif))],['Custo do parcelamento',pct(Math.abs(rel))]],
   dif>0?'Você pagaria '+brl(dif)+' a mais ('+pct(rel)+' sobre o preço à vista). Se tem o valor disponível, pagar à vista evita esse custo.':'O total parcelado é '+brl(-dif)+' menor que o preço à vista. Confira se não há outras taxas antes de decidir.'));
 }else if(a.kind==='invoice'){
  var totals={},wrong=[],sum=0,missing=false;
  a.items.forEach(function(it,i){
   var sel=$('a-'+id+'-cat'+i);
   if(!sel.value)missing=true;
   totals[it.cat]=(totals[it.cat]||0)+it.v;
   if(sel.value!==it.cat)wrong.push(it.d);
   sum+=it.v;
  });
  if(missing){show('<div class="fb bad"><b>Falta classificar</b><p>Escolha uma categoria para cada compra da fatura.</p></div>');return}
  var top=Object.keys(totals).sort(function(x,y){return totals[y]-totals[x]})[0];
  done(resultCard(wrong.length?'bad':'', 'Fatura fechada',
   [['Total da fatura',brl(sum)],['Categoria mais pesada',top+' ('+brl(totals[top])+')'],['Classificações corretas',(a.items.length-wrong.length)+' de '+a.items.length]],
   (wrong.length?'Revise: '+wrong.join(', ')+'. ':'Você classificou tudo corretamente. ')+'Separar por categoria mostra onde o dinheiro está indo. Compras de lazer são as primeiras candidatas a corte quando a fatura aperta.'));
 }else if(a.kind==='reserve'){
  var gastos=num('a-'+id+'-gastos'),guarda=num('a-'+id+'-guardar');
  if(gastos<=0){show('<div class="fb bad"><b>Dados incompletos</b><p>Informe suas despesas essenciais por mês.</p></div>');return}
  var metaR=gastos*3,tempo=guarda>0?Math.ceil(metaR/guarda):Infinity;
  var covered=0,selected=[];
  a.imprevistos.forEach(function(im,i){
   var cb=$('a-'+id+'-imp'+i);
   if(cb&&cb.checked){covered+=im.v;selected.push(im)}
  });
  var sobrou=metaR-covered;
  var warning=selected.some(function(im){return !im.ess})?'Você incluiu um desejo na reserva de emergência. O lazer pode esperar; a reserva é para necessidades.':'Boa escolha: você priorizou necessidades. ';
  done(resultCard(sobrou<0?'bad':'','Sua reserva ideal',
   [['Despesas essenciais',brl(gastos)],['Meta de reserva (3 meses)',brl(metaR)],['Tempo para formar',tempo===Infinity?'impossível guardando zero':'~'+tempo+' mês(es)'],['Coberto pelos imprevistos',brl(covered)],['Saldo da reserva',(sobrou<0?'− ':'')+brl(Math.abs(sobrou))]],
   warning+(sobrou<0?'Os imprevistos escolhidos custam mais que a reserva. Priorize os essenciais e refaça a conta.':'A reserva cobre os imprevistos escolhidos e ainda sobram '+brl(sobrou)+'.')));
 }else if(a.kind==='sales'){
  var custo=num('a-'+id+'-custo'),qtd=Math.floor(num('a-'+id+'-qtd')),preco=num('a-'+id+'-preco');
  if(custo<=0||qtd<1||preco<=0){show('<div class="fb bad"><b>Dados incompletos</b><p>Informe custo, quantidade e preço de venda maiores que zero.</p></div>');return}
  var cunit=custo/qtd,fat=qtd*preco,lucro=fat-custo,margem=fat?lucro/fat*100:0;
  done(resultCard(lucro<0?'bad':'',lucro<0?'Prejuízo':'Lucro no mês',
   [['Custo por unidade',brl(cunit)],['Faturamento',brl(fat)],['Lucro',(lucro<0?'− ':'')+brl(Math.abs(lucro))],['Margem',pct(margem)]],
   lucro<0?'Cada unidade vendida dá prejuízo. O preço precisa ser maior que '+brl(cunit)+'. Ajuste o preço ou reduza o custo.':'Cada unidade deixa '+brl(preco-cunit)+'. Se o preço subir ou o custo cair, a margem melhora — mas confira se o cliente aceita o novo preço.'));
 }else if(a.kind==='inflation'){
  var antes=0,depois=0,rowsI=[];
  a.items.forEach(function(it,i){
   var novo=num('a-'+id+'-p'+i);
   antes+=it.antes;depois+=novo;
   var v=it.antes?((novo-it.antes)/it.antes*100):0;
   rowsI.push([it.d,brl(it.antes)+' → '+brl(novo)+' ('+pct(v)+')']);
   var cell=$('a-'+id+'-d'+i);if(cell)cell.textContent=pct(v);
  });
  var varTotal=antes?((depois-antes)/antes*100):0;
  var cestasAntes=antes?100/antes:0,cestasDepois=depois?100/depois:0;
  done(resultCard('','Preços e poder de compra',
   rowsI.concat([['Cesta total',brl(antes)+' → '+brl(depois)],['Variação da cesta',pct(varTotal)],['Com R$ 100 você comprava',cestasAntes.toFixed(2)+' cesta(s)'],['E agora compra',cestasDepois.toFixed(2)+' cesta(s)']]),
   'A cesta subiu '+pct(varTotal)+'. O mesmo dinheiro compra menos: esse é o efeito da inflação no dia a dia. Comparar preços e revisar o orçamento ajuda a reduzir o impacto.'));
 }
}

/* ---------- Simulação final (Módulo 10) ---------- */
var finalState=null;
function renderFinalActivity(m,box){
 finalState={step:0,costs:[],savings:0,scores:[],decisions:[]};
 drawFinalStep(m,box);
}
function drawFinalStep(m,box){
 var a=m.activity,st=finalState;
 if(!st){renderFinalActivity(m,box);return}
 if(st.step>=a.steps.length){drawFinalReport(m,box);return}
 var s=a.steps[st.step],gasto=st.costs.reduce(function(t,v){return t+v},0);
 var partial=a.renda-gasto;
 box.innerHTML='<p class="mute">'+esc(a.intro)+'</p>'+
  '<div class="quiz-top"><b>Decisão '+(st.step+1)+' de '+a.steps.length+'</b><span class="mute">Saldo parcial: '+brl(partial)+'</span></div>'+
  '<div class="bar b"><i style="width:'+Math.round(st.step/a.steps.length*100)+'%"></i></div>'+
  '<h3 class="qtext">'+esc(s.q)+'</h3><div class="opts" id="finalOpts">'+
  s.opts.map(function(o,i){return '<button class="opt" type="button" data-fi="'+i+'"><span class="k">'+'ABCD'[i]+'</span>'+esc(o.t)+'</button>'}).join('')+
  '</div><div id="finalFb"></div>';
 box.querySelectorAll('[data-fi]').forEach(function(btn){
  btn.onclick=function(){
   var o=s.opts[+btn.dataset.fi];
   st.decisions.push({q:s.q,t:o.t,cost:o.cost,fb:o.fb});
   st.scores.push(o.score||0);
   if(st.step===a.steps.length-1){st.savings=o.cost}
   else{st.costs.push(o.cost)}
   st.step++;
   if(st.step>=a.steps.length)drawFinalReport(m,box);else drawFinalStep(m,box);
  };
 });
}
function drawFinalReport(m,box){
 var a=m.activity,st=finalState;
 var desp=st.costs.reduce(function(t,v){return t+v},0);
 var saldo=a.renda-desp-st.savings;
 var max=a.steps.length*2,score=st.scores.reduce(function(t,v){return t+v},0);
 var aval=score>=max*0.75?'Excelente gestão: você priorizou necessidades, evitou juros e guardou parte da renda.':score>=max*0.5?'Bom caminho: algumas escolhas poderiam custar menos, mas o mês ficou sob controle.':'Vale revisar: escolhas caras ou desnecessárias comprometeram o orçamento. Refaça a simulação testando outro caminho.';
 if(saldo<0)aval+=' Atenção: o saldo ficou negativo, então o mês não fechou.';
 var rows=[['Saldo inicial',brl(a.renda)],['Total de receitas',brl(a.renda)],['Total de despesas',brl(desp)],['Valor economizado',brl(st.savings)],['Saldo final',(saldo<0?'− ':'')+brl(Math.abs(saldo))]];
 box.innerHTML=resultCard(saldo<0?'bad':'', 'Relatório do mês', rows, aval)+
  '<div class="result-card"><h3>Decisões tomadas</h3><ul class="res-list">'+st.decisions.map(function(d){
   return '<li class="decision"><span>'+esc(d.q)+'<small class="mute">'+esc(d.t)+'</small></span><b>'+brl(d.cost)+'</b></li>';
  }).join('')+'</ul></div>'+
  '<div class="lesson-actions"><button class="btn ghost" type="button" id="finalAgain">Refazer simulação</button></div>';
 var again=$('finalAgain');
 if(again)again.onclick=function(){renderFinalActivity(m,box)};
 completeActivity(m);
}

/* ---------- Quiz ---------- */
function renderQuiz(m,box){
 if(!box)return;
 var st={i:0,score:0,answered:false,sel:null};
 drawQuestion(m,box,st);
}
function drawQuestion(m,box,st){
 var q=m.quiz[st.i];
 box.innerHTML='<div class="quiz-top"><b>Pergunta '+(st.i+1)+' de '+m.quiz.length+'</b><span class="mute">'+st.score+' acerto(s)</span></div>'+
  '<div class="bar b"><i style="width:'+Math.round(st.i/m.quiz.length*100)+'%"></i></div>'+
  '<h3 class="qtext">'+esc(q.q)+'</h3><div class="opts" id="qOpts">'+
  q.o.map(function(t,i){return '<button class="opt" type="button" data-oi="'+i+'"><span class="k">'+'ABCD'[i]+'</span>'+esc(t)+'</button>'}).join('')+
  '</div><div id="qFb"></div><div class="lesson-actions"><button class="btn" type="button" id="qConfirm" disabled>Confirmar resposta</button></div>';
 box.querySelectorAll('[data-oi]').forEach(function(b){
  b.onclick=function(){
   if(st.answered)return;
   st.sel=+b.dataset.oi;
   box.querySelectorAll('[data-oi]').forEach(function(x){x.classList.remove('sel')});
   b.classList.add('sel');
   $('qConfirm').disabled=false;
  };
 });
 $('qConfirm').onclick=function(){
  if(st.answered)return;
  st.answered=true;
  var ok=st.sel===q.a;
  if(ok)st.score++;
  var head=box.querySelector('.quiz-top span');if(head)head.textContent=st.score+' acerto(s)';
  box.querySelectorAll('[data-oi]').forEach(function(b,i){
   b.disabled=true;b.classList.remove('sel');
   if(i===q.a)b.classList.add('ok');else if(i===st.sel)b.classList.add('bad');
  });
  $('qFb').innerHTML='<div class="fb '+(ok?'ok':'bad')+'"><b>'+(ok?'Resposta correta!':'Resposta incorreta')+'</b><p>'+esc(q.e)+'</p></div>';
  var btn=this;
  btn.textContent=st.i<m.quiz.length-1?'Próxima pergunta':'Ver resultado';
  btn.onclick=function(){
   st.i++;
   if(st.i<m.quiz.length){st.answered=false;st.sel=null;drawQuestion(m,box,st)}
   else finishQuiz(m,box,st);
  };
 };
}
function finishQuiz(m,box,st){
 var p=pm(m.id);
 p.quizDone=true;
 p.quizBest=Math.max(p.quizBest||0,st.score);
 touch(p);saveProgress();
 syncLesson(m);
 var percent=Math.round(st.score/m.quiz.length*100);
 var msg=percent>=80?'Excelente! Você domina o conteúdo.':percent>=60?'Bom resultado! Revise as questões que errou.':'Vale reler a aula e tentar de novo.';
 box.innerHTML='<div class="quiz-result">'+pixelImg(st.score===m.quiz.length?'trophy':'medalGold','quiz-trophy','')+'<div class="quiz-score"><b>'+st.score+'/'+m.quiz.length+'</b><span>'+percent+'% de acertos</span></div><h3>'+esc(msg)+'</h3><p class="mute">Seu melhor resultado neste módulo: '+(p.quizBest)+' de '+m.quiz.length+'.</p><div class="lesson-actions"><button class="btn ghost" type="button" id="qAgain">Refazer quiz</button><button class="btn" type="button" id="qDone">Concluir módulo</button></div></div>';
 $('qAgain').onclick=function(){renderQuiz(m,box)};
 $('qDone').onclick=function(){markDone(m)};
}

/* ---------- Assistente ---------- */
var chatCtx=null;
function setContext(m){
 chatCtx={moduleId:m.id,title:'Módulo '+m.n+' — '+m.t,content:m.contextoAssistente(),activity:m.activity.t+': '+m.activity.intro};
 renderCtx();
 location.hash='#assistente';
 toast('Assistente com o contexto do módulo '+m.n);
 setTimeout(function(){scrollMsgs()},200);
}
function renderCtx(){
 var bar=$('ctxBar'),name=$('ctxName');
 if(!bar)return;
 if(chatCtx){bar.hidden=false;name.textContent=chatCtx.title}
 else{bar.hidden=true;name.textContent=''}
}
function scrollMsgs(){var el=$('msgs');if(el)el.scrollTop=el.scrollHeight}

/* ---------- Home, progresso e render geral ---------- */
function renderHome(){
 var v=overallPct(),qs=quizStats(),done=doneCount(),pts=pointsOf();
 var sd=$('statDone');if(sd)sd.textContent=done+' de '+MODULES.length;
 var sp=$('statPts');if(sp)sp.textContent=pts.toLocaleString('pt-BR');
 var sa=$('statAvg');if(sa)sa.textContent=qs.avg+'%';
 var donePct=MODULES.length?Math.round(done/MODULES.length*100):0;
 var sb=$('statBar');if(sb)sb.style.width=donePct+'%';
 var sbw=$('statBarWrap');if(sbw)sbw.setAttribute('aria-label',donePct+'% do curso concluído');
 var sub=$('homeSub');
 if(sub){
  sub.textContent=done===MODULES.length
   ?'Você concluiu os 10 módulos! Continue praticando para manter o ritmo.'
   :done===0
    ?'Comece pelo Módulo 1 e construa um futuro ainda mais sólido!'
    :'Continue aprendendo sobre educação financeira e construa um futuro ainda mais sólido!';
 }
 renderModuleChart();
 renderPerformance();
 renderAchievementsHome();
 var hm=$('homeModules');if(hm)hm.innerHTML=MODULES.map(moduleCard).join('');
}
function renderModuleChart(){
 var el=$('moduleChart');if(!el)return;
 el.innerHTML=MODULES.map(function(m){
  var v=pctOf(m.id),s=statusOf(m.id);
  return '<div class="mchart'+(s.key==='done'?' done':'')+'">'+
   '<div class="mchart-track" style="--p:'+v+'%">'+
    (v>0?'<div class="mchart-fill" style="height:'+v+'%"></div>':'')+
    '<span class="mchart-dot">'+pixelImg(statusArt(s.key).key,'','')+'</span>'+
   '</div>'+
   '<span class="mchart-label">M'+m.n+'</span>'+
  '</div>';
 }).join('');
 el.setAttribute('aria-label','Progresso por módulo: '+MODULES.map(function(m){return 'M'+m.n+' '+pctOf(m.id)+'% ('+statusOf(m.id).label+')'}).join(', '));
}
function renderPerformance(){
 var el=$('perfList');if(!el)return;
 el.innerHTML=AREAS.map(function(a){
  var v=areaPct(a);
  return '<div class="perf-item">'+
   '<span class="perf-art">'+pixelImg(a.icon,'perf-ico',a.label)+'</span>'+
   '<div class="perf-main"><div class="perf-top"><span>'+esc(a.label)+'</span><span>'+v+'%</span></div>'+
   '<div class="perf-bar" role="img" aria-label="'+v+'% de progresso em '+esc(a.label)+'"><i style="width:'+v+'%"></i></div></div>'+
  '</div>';
 }).join('');
}
function renderAchievementsHome(){
 var list=achievements(),n=unlockedAchievements();
 var count=$('achCount');
 if(count)count.textContent='Você já desbloqueou '+n+' conquista'+(n===1?'':'s')+'!';
 var trophy=$('achTrophy');
 if(trophy)trophy.className='ach-trophy'+(n?'':' locked');
 var panel=$('achievements');
 if(panel)panel.setAttribute('aria-label','Suas conquistas: '+n+' de '+list.length+' desbloqueadas');
}
function renderWeek(){
 var el=$('weekCols');if(!el)return;
 var labels=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
 var today=new Date(),days=[];
 for(var i=6;i>=0;i--){
  var d=new Date(today.getFullYear(),today.getMonth(),today.getDate()-i);
  days.push({key:d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate(),label:labels[d.getDay()],v:0});
 }
 MODULES.forEach(function(m){
  var p=progress[m.id];
  if(!p||!p.updatedAt||!p.quizBest)return;
  var d=new Date(p.updatedAt),key=d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
  days.forEach(function(x){if(x.key===key)x.v+=p.quizBest*10});
 });
 var max=days.reduce(function(t,x){return Math.max(t,x.v)},0);
 el.innerHTML=days.map(function(x){
  return '<div'+(x.v===max&&max>0?' class="hi"':'')+'><i style="height:'+(x.v?(x.v/max*100):4)+'%"></i>'+x.label+'</div>';
 }).join('');
 el.setAttribute('aria-label','Pontos por dia: '+days.map(function(x){return x.label+' '+x.v}).join(', '));
}
function renderAchievementsGrid(){
 var list=achievements(),n=unlockedAchievements();
 var grid=$('achGrid');
 if(grid){
  grid.innerHTML=list.map(function(a){
   return '<div class="achievement'+(a.unlocked?'':' locked')+'" aria-label="'+esc(a.label)+': '+(a.unlocked?'desbloqueada':'bloqueada')+'">'+
    pixelImg(a.icon,'ach-ico',a.label)+
    '<div><b>'+esc(a.label)+'</b><span>'+esc(a.desc)+'</span></div>'+
   '</div>';
  }).join('');
 }
 var sum=$('achSummary');
 if(sum)sum.textContent=n+' de '+list.length+' desbloqueadas';
}
function renderProgress(){
 var done=doneCount(),pts=pointsOf(),qs=quizStats(),v=overallPct();
 renderWeek();
 var d=$('prDone');if(d)d.textContent=done+' de '+MODULES.length;
 var pEl=$('pts');if(pEl)pEl.textContent=pts.toLocaleString('pt-BR');
 var a=$('prAcc');if(a)a.textContent=qs.avg+'%';
 var donePct=MODULES.length?Math.round(done/MODULES.length*100):0;
 var prBar=$('prBar');if(prBar)prBar.style.width=donePct+'%';
 var prBarWrap=$('prBarWrap');if(prBarWrap)prBarWrap.setAttribute('aria-label',donePct+'% do curso concluído');
 var mods=$('prMods');
 if(mods)mods.innerHTML=MODULES.map(function(m){
  var mv=pctOf(m.id),s=statusOf(m.id);
  return '<div class="pr-row">'+pixelImg(moduleArt(m),'pr-art',moduleArtAlt(m))+
   '<div class="pr-body"><div class="pr-top"><span>Módulo '+m.n+' · '+esc(m.t)+'</span><span>'+mv+'%</span></div>'+
   '<div class="bar'+(s.key==='doing'?' b':'')+'" role="img" aria-label="'+mv+'% concluído em '+esc(m.t)+'"><i style="width:'+mv+'%"></i></div></div></div>';
 }).join('');
 renderAchievementsGrid();
}
function refreshAll(){
 renderHome();renderQuizHub();renderProgress();
 if(!lessonId)renderModuleList();
}

/* ---------- Chat ---------- */
var msgs=$('msgs');
function add(t,c){var d=document.createElement('div');d.className='m '+c;d.textContent=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;return d}
var greetEl=add('Oi, '+((session&&session.name)||'estudante')+'! Sou seu assistente de educação financeira. Pergunte o que quiser e eu explico de um jeito simples.','ai');
var KB=[[/juros/,'Juros são o “aluguel” do dinheiro. Se você guarda, recebe juros. Se deve, paga.\n\nExemplo: R$ 100 a 2% ao mês viram R$ 102 no mês 1 e R$ 104,04 no mês 2. É isso que chamamos de juros compostos.'],[/orçamento|orcamento|50/,'Orçamento é um plano para o seu dinheiro. Com a regra 50-30-20, metade vai para necessidades, 30% para desejos e 20% para metas.\n\nSe você recebe R$ 300, são R$ 150, R$ 90 e R$ 60.'],[/reserva|emerg/,'Reserva de emergência é um dinheiro guardado para imprevistos, como consertar o celular. Comece pequeno: R$ 20 por semana já cria o hábito.'],[/compra|consum|impuls/,'Antes de comprar, use o teste: preciso, cabe no orçamento e vou usar? Se tiver dúvida, espere 48 horas.'],[/cart[aã]o|cr[eé]dito/,'Cartão de crédito não é dinheiro extra: é uma compra que você paga depois. Se não pagar o total da fatura, os juros são muito altos.'],[/infla/,'Inflação é o aumento geral dos preços. Com o mesmo dinheiro, você compra menos. Comparar preços e revisar o orçamento ajuda a reduzir o impacto.'],[/meta|planej/,'Uma meta útil tem valor e prazo. Divida o valor pelo número de meses para saber quanto guardar por mês. Se não couber no orçamento, aumente o prazo.'],[/lucro|venda|empreend/,'Lucro é o que sobra do faturamento depois de descontar os custos. Se os ingredientes custam R$ 60 e você vende R$ 120, o lucro é R$ 60.']];
var CH=['O que são juros compostos?','Como montar um orçamento?','Para que serve a reserva de emergência?'];
function mockReply(t){var l=t.toLowerCase(),r='Boa pergunta! Pense assim: dinheiro é uma ferramenta para realizar objetivos. Comece anotando quanto entra e quanto sai, e depois escolha uma meta pequena.';KB.forEach(function(k){if(k[0].test(l))r=k[1]});return r}
var chatHistory=[];
function ask(t){
 if(!t.trim())return;
 add(t,'me');
 var w=add('Pensando…','ai');
 var body={message:t,history:chatHistory};
 if(chatCtx)body.context={moduleId:chatCtx.moduleId,title:chatCtx.title,content:chatCtx.content,activity:chatCtx.activity};
 fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
 .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
 .then(function(d){w.textContent=d.reply||'Não consegui responder agora. Tente reformular a pergunta.';chatHistory.push({role:'user',text:t},{role:'model',text:d.reply||''});chatHistory=chatHistory.slice(-10)})
 .catch(function(e){console.error(e);w.textContent=mockReply(t)+'\n\n(Modo demonstração: o servidor não respondeu.)'})
 .then(function(){scrollMsgs()});
}
$('chips').innerHTML=CH.map(function(c){return '<button class="chip" type="button">'+c+'</button>'}).join('');
$('chips').addEventListener('click',function(e){if(e.target.classList.contains('chip'))ask(e.target.textContent)});
$('chatForm').addEventListener('submit',function(e){e.preventDefault();var i=$('q');ask(i.value);i.value=''});
var ctxClear=$('ctxClear');
if(ctxClear)ctxClear.onclick=function(){chatCtx=null;renderCtx();toast('Contexto do módulo removido.')};

/* ---------- Navegação ---------- */
function toast(t){var e=$('toast');e.textContent=t;e.classList.add('on');setTimeout(function(){e.classList.remove('on')},2200)}
var V=['inicio','modulos','quiz','assistente','progresso'];
function route(){
 var h=(location.hash||'#inicio').slice(1);if(V.indexOf(h)<0)h='inicio';
 document.body.setAttribute('data-view',h);
 V.forEach(function(v){$('v-'+v).classList.toggle('on',v===h)});
 document.querySelectorAll('#nav a').forEach(function(a){if(a.getAttribute('href')==='#'+h)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 if(h==='modulos'){if(lessonId)renderLesson(lessonId);else renderModuleList()}
 if(h==='quiz')renderQuizHub();
 if(h==='inicio')renderHome();
 if(h==='progresso')renderProgress();
 if(h==='assistente'){renderCtx();setTimeout(scrollMsgs,50)}
 window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);

/* ---------- Menu do perfil ---------- */
var profileBtn=$('profileBtn'),profileMenu=$('profileMenu');
function closeProfile(){
 if(!profileMenu)return;
 profileMenu.hidden=true;
 if(profileBtn)profileBtn.setAttribute('aria-expanded','false');
}
if(profileBtn&&profileMenu){
 profileBtn.addEventListener('click',function(e){
  e.stopPropagation();
  var open=profileMenu.hidden;
  profileMenu.hidden=!open;
  profileBtn.setAttribute('aria-expanded',open?'true':'false');
 });
 document.addEventListener('click',function(e){
  if(!profileMenu.hidden&&!e.target.closest('.profile'))closeProfile();
 });
 document.addEventListener('keydown',function(e){
  if(e.key==='Escape')closeProfile();
 });
}
var helpMenu=$('helpMenu');
if(helpMenu)helpMenu.addEventListener('click',function(){
 closeProfile();chatCtx=null;renderCtx();location.hash='#assistente';toast('Pergunte o que quiser ao assistente.');
});
/* ---------- Navegação ilustrada ---------- */
/* Ao clicar em Módulos, volta para a lista (mesmo se uma aula estiver aberta). */
document.querySelectorAll('#nav a').forEach(function(link){
 link.addEventListener('click',function(e){
  if(link.getAttribute('href')!=='#modulos')return;
  var same=location.hash==='#modulos';
  lessonId=null;
  if(same){
   e.preventDefault();
   renderModuleList();
   window.scrollTo({top:0,behavior:'smooth'});
  }
 });
});
$('homeModules').addEventListener('click',function(e){var b=e.target.closest('[data-mod]');if(b)openModule(b.dataset.mod)});
$('modList').addEventListener('click',function(e){var b=e.target.closest('[data-mod]');if(b)openModule(b.dataset.mod)});
$('quizHub').addEventListener('click',function(e){var b=e.target.closest('[data-quiz]');if(b)openModule(b.dataset.quiz,'quiz')});
var bell=$('bell');if(bell)bell.onclick=function(){toast('Tudo em dia por aqui. Continue de onde parou!')};

/* ---------- Login e cadastro ---------- */
var tabLogin=$('tab-login'),tabRegister=$('tab-register');
var paneLogin=$('pane-login'),paneRegister=$('pane-register');
var loginMsg=$('loginMsg'),regMsg=$('regMsg');

function setAuth(on){document.documentElement.setAttribute('data-auth',on?'in':'out')}
function cleanName(v){return (v||'').replace(/\s+/g,' ').trim()}
function msg(el,t){el.textContent=t||''}
function switchPane(p){
 var isLogin=p==='login';
 tabLogin.setAttribute('aria-selected',isLogin?'true':'false');
 tabRegister.setAttribute('aria-selected',isLogin?'false':'true');
 paneLogin.hidden=!isLogin;paneRegister.hidden=isLogin;
 msg(loginMsg,'');msg(regMsg,'');
 (isLogin?$('loginName'):$('regName')).focus();
}
tabLogin.addEventListener('click',function(){switchPane('login')});
tabRegister.addEventListener('click',function(){switchPane('register')});

function makeSalt(){
 var b=new Uint8Array(16),i;
 if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(b);
 else for(i=0;i<16;i++)b[i]=Math.floor(Math.random()*256);
 return Array.prototype.map.call(b,function(x){return ('0'+x.toString(16)).slice(-2)}).join('');
}
function hashPass(pass,salt){
 var s=salt+':'+pass;
 if(window.crypto&&crypto.subtle&&crypto.subtle.digest){
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(buf){
   return Array.prototype.map.call(new Uint8Array(buf),function(b){return ('0'+b.toString(16)).slice(-2)}).join('');
  });
 }
 var h=5381;
 for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;
 return Promise.resolve('fb'+(h>>>0).toString(16));
}
function applyUser(name){
 $('userName').textContent=name;
 $('userNameSide').textContent=name;
 var av=$('userAvatar');if(av){av.title=name;av.setAttribute('aria-label','Avatar de '+name)}
 greetEl.textContent='Oi, '+name+'! Sou seu assistente de educação financeira. Pergunte o que quiser e eu explico de um jeito simples.';
 loadProgress();
 if(currentUser)currentUser.progresso=progressUser();
 lessonId=null;
 refreshAll();
}
function startSession(user){
 var nome=user.nome||user.name;
 currentUser=user;
 session={name:nome,since:Date.now()};
 writeJSON(SESSION_KEY,session);
 $('loginPass').value='';
 $('regPass').value='';
 $('regPass2').value='';
 msg(loginMsg,'');msg(regMsg,'');
 applyUser(nome);
 setAuth(true);
 if(location.hash!=='#inicio')location.hash='#inicio';else route();
 toast('Bem-vindo(a), '+nome+'!');
}
function signOut(){
 closeProfile();
 if(session)new Usuario({nome:session.name}).sair();
 currentUser=null;
 session=null;
 chatCtx=null;renderCtx();
 setAuth(false);
 switchPane('login');
 $('loginName').value='';
 $('loginName').focus();
}
$('logout').addEventListener('click',signOut);

paneRegister.addEventListener('submit',function(e){
 e.preventDefault();
 var name=cleanName($('regName').value);
 var p1=$('regPass').value,p2=$('regPass2').value;
 if(name.length<2)return msg(regMsg,'Digite seu nome (pelo menos 2 letras).');
 if(name.length>40)return msg(regMsg,'Use um nome com até 40 caracteres.');
 if(p1.length<6)return msg(regMsg,'A senha precisa ter pelo menos 6 caracteres.');
 if(p1!==p2)return msg(regMsg,'As senhas não coincidem.');
 new Usuario({nome:name}).criarConta(name,p1).then(function(res){
  if(!res.ok){
   if(res.motivo==='existe'){
    switchPane('login');
    $('loginName').value=name;
    return msg(loginMsg,'Você já tem conta. Digite sua senha para entrar.');
   }
   return msg(regMsg,'Não foi possível salvar neste navegador.');
  }
  startSession(res.usuario);
 }).catch(function(){msg(regMsg,'Não foi possível criar a conta agora. Tente de novo.')});
});

paneLogin.addEventListener('submit',function(e){
 e.preventDefault();
 var name=cleanName($('loginName').value);
 var pass=$('loginPass').value;
 if(!name)return msg(loginMsg,'Digite seu nome.');
 if(!pass)return msg(loginMsg,'Digite sua senha.');
 new Usuario({nome:name}).entrar(name,pass).then(function(res){
  if(!res.ok){
   if(res.motivo==='nao_encontrado')return msg(loginMsg,'Não encontrei esse nome. Crie uma conta na aba ao lado.');
   if(res.motivo==='senha'){$('loginPass').value='';return msg(loginMsg,'Senha incorreta. Tente de novo.');}
   return msg(loginMsg,'Não foi possível entrar agora. Tente de novo.');
  }
  startSession(res.usuario);
 }).catch(function(){msg(loginMsg,'Não foi possível entrar agora. Tente de novo.')});
});

/* ---------- Início ---------- */
loadProgress();
refreshAll();
if(session&&session.name){currentUser=new Usuario({nome:session.name});setAuth(true);applyUser(session.name)}
else{setAuth(false)}
route();
renderCtx();
