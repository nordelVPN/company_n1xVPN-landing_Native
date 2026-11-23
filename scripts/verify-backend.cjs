const {spawn,spawnSync}=require('node:child_process');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const php=process.env.PHP_BINARY||'php';
const report={checks:[],errors:[]};
(async()=>{
 let server;
 const dir=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'n1x-qa-'));
 try{
  for(const file of ['common','bot','webhook','webhook-admin']){
   const r=spawnSync(php,['-l','tg-bot/'+file+'.php'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);report.checks.push('lint '+file);
  }
  const code=`require 'tg-bot/common.php'; $f=$argv[1]; saveUser($f,['id'=>42,'first_name'=>'QA']); $a=json_decode(file_get_contents($f),true);saveUser($f,['id'=>42,'first_name'=>'Updated']);$b=json_decode(file_get_contents($f),true);if(count($b)!==1||$b[0]['createdAt']!==$a[0]['createdAt']||$b[0]['firstName']!=='Updated')exit(1);foreach(['broken','{}','[{}]'] as $bad){file_put_contents($f,$bad);try{saveUser($f,['id'=>43]);exit(2);}catch(Throwable $e){}if(file_get_contents($f)!==$bad)exit(3);}`;
  const r=spawnSync(php,['-r',code,path.join(dir,'users.json')],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);report.checks.push('atomic storage, update, createdAt, corrupt JSON preservation');
  const net=require('node:net');const socket=net.createServer();await new Promise(r=>socket.listen(0,'127.0.0.1',r));const port=socket.address().port;await new Promise(r=>socket.close(r));
  server=spawn(php,['-S','127.0.0.1:'+port,'tg-bot/webhook.php'],{env:{...process.env,TELEGRAM_BOT_TOKEN:'qa-placeholder',TELEGRAM_WEBHOOK_SECRET:'qa-secret',WISHLIST_FILE:path.join(dir,'http.json')},stdio:'ignore'});
  const url='http://127.0.0.1:'+port;let ready=false;
  for(let i=0;i<50;i++){try{await fetch(url+'/health');ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}assert(ready);
  for(const [route,method,body,secret,status] of [
   ['/health','GET',null,false,200],['/webhook','GET',null,false,404],['/common.php','GET',null,false,404],
   ['/webhook','POST','{}',false,403],['/webhook','POST','broken',true,400],['/webhook','POST','{}',true,400],['/webhook','POST','{"update_id":1}',true,200],['/webhook','POST','x'.repeat(65537),true,413]
  ]){const response=await fetch(url+route,{method,...(body?{body}:{}),headers:secret?{'X-Telegram-Bot-Api-Secret-Token':'qa-secret'}:{}});assert.equal(response.status,status);report.checks.push(method+' '+route+' '+status);}
 }catch(e){report.errors.push(e.stack);process.exitCode=1;}
 finally{server?.kill();fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync('docs/qa/backend',{recursive:true});fs.writeFileSync('docs/qa/backend/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();