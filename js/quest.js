const QUESTIONS=[
 {q:'Which state is famous for Kathakali?',opts:['Kerala','Punjab','Gujarat','Assam'],a:0},
 {q:'Dal Baati Churma is strongly associated with which state?',opts:['Odisha','Rajasthan','Karnataka','West Bengal'],a:1},
 {q:'The Charminar is in which city?',opts:['Pune','Hyderabad','Jaipur','Lucknow'],a:1},
 {q:'Pattachitra is a traditional art form strongly associated with?',opts:['Odisha','Kerala','Punjab','Maharashtra'],a:0},
 {q:'Which city is home to the Golden Temple?',opts:['Amritsar','Varanasi','Mysuru','Kochi'],a:0},
 {q:'Which dance is associated with Tamil Nadu?',opts:['Bharatanatyam','Bihu','Garba','Lavani'],a:0},
 {q:'Bandhani is a textile tradition strongly associated with?',opts:['Gujarat','Assam','Odisha','Kerala'],a:0},
 {q:'Muga silk is especially associated with which region?',opts:['Assam','Punjab','Goa','Rajasthan'],a:0}
];
let qi=Number(sessionStorage.getItem('sutra_quest_index')||0);let answered=false;
function todayKey(){return new Date().toISOString().slice(0,10)}
function renderQuestion(){
 const q=QUESTIONS[qi%QUESTIONS.length], number=document.getElementById('quizNumber'),question=document.getElementById('quizQuestion'),options=document.getElementById('quizOptions'),result=document.getElementById('quizResult'),next=document.getElementById('nextQuestion');if(!q||!options)return;
 answered=false;number.textContent=`QUESTION ${String((qi%QUESTIONS.length)+1).padStart(2,'0')}`;question.textContent=q.q;result.textContent='';next.style.display='none';
 const claimed=localStorage.getItem('sutra_daily_quiz_answered_'+(SutraAuth.user().email||'guest').toLowerCase())===todayKey();
 options.innerHTML=q.opts.map((x,i)=>`<button class="quiz-option ${claimed?'disabled':''}" ${claimed?'disabled':''} onclick="answerQuestion(${i})">${String.fromCharCode(65+i)}. ${x}</button>`).join('');
 if(claimed)result.textContent='Today’s quiz reward is already claimed. Explore a Heritage Node or return tomorrow.';
}
function answerQuestion(index){
 if(answered)return; const q=QUESTIONS[qi%QUESTIONS.length];answered=true;
 const buttons=[...document.querySelectorAll('.quiz-options button')];buttons.forEach((b,n)=>{if(n===q.a)b.classList.add('correct');if(n===index&&n!==q.a)b.classList.add('wrong');});
 if(index===q.a){
   const today=todayKey();
   if(localStorage.getItem('sutra_daily_quiz_answered_'+(SutraAuth.user().email||'guest').toLowerCase())!==today){localStorage.setItem('sutra_daily_quiz_answered_'+(SutraAuth.user().email||'guest').toLowerCase(),today);SutraWallet.add(25,'Daily quiz');document.getElementById('quizResult').textContent='Correct! +25 Sutra Coins ✦';}
   else document.getElementById('quizResult').textContent='Correct! Daily reward already claimed today.';
 } else document.getElementById('quizResult').textContent=`Not quite. The answer is ${q.opts[q.a]}.`;
 document.getElementById('nextQuestion').style.display='inline-flex';
}
function nextQuestQuestion(){qi=(qi+1)%QUESTIONS.length;sessionStorage.setItem('sutra_quest_index',qi);renderQuestion()}
window.answerQuestion=answerQuestion;window.nextQuestQuestion=nextQuestQuestion;
document.addEventListener('DOMContentLoaded',()=>{if(document.body.dataset.page==='quest')renderQuestion();});
