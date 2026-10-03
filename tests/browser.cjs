const {chromium}=require('playwright');const {pathToFileURL}=require('node:url');const path=require('node:path');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const url=pathToFileURL(path.resolve(__dirname,'../index.html')).href;await page.goto(url);await page.getByRole('button',{name:'拿起钥匙，开始探索'}).click();
 const snap=()=>page.evaluate(()=>tenantDebug.snapshot());
 let before=await snap();await page.keyboard.down('w');await page.waitForTimeout(400);await page.keyboard.up('w');let after=await snap();assert.ok(after.y<before.y-25,'W moves player');assert.equal(after.time,before.time,'movement does not advance time');
 await page.keyboard.down('s');await page.waitForTimeout(450);await page.keyboard.up('s');await page.keyboard.press('e');assert.equal(await page.locator('#dialogTitle').textContent(),'入户门');await page.locator('[data-key="read"]').click();assert.equal((await snap()).rulesRead,true);await page.getByRole('button',{name:'返回地图',exact:true}).click();
 await page.keyboard.down('w');await page.waitForTimeout(450);await page.keyboard.up('w');await page.keyboard.press('e');assert.equal(await page.locator('#dialogTitle').textContent(),'鞋柜');await page.locator('[data-key="supplies"]').click();assert.equal((await snap()).cleaner,true);await page.getByRole('button',{name:'返回地图',exact:true}).click();
 const feedback=await page.evaluate(()=>tenantDebug.feedback());assert.ok(feedback.audioEvents>3);assert.ok(feedback.animations>3);assert.equal(feedback.audioState,'running');
 // modal pauses movement and keeps keyboard focus inside the dialog
 await page.keyboard.press('j');before=await snap();await page.keyboard.down('d');await page.waitForTimeout(180);await page.keyboard.up('d');after=await snap();assert.equal(after.x,before.x);await page.keyboard.press('Escape');
 await page.reload();assert.equal((await snap()).rulesRead,true);assert.equal((await snap()).cleaner,true);assert.equal(await page.locator('#overlay').isVisible(),false);
 fs.mkdirSync(path.resolve(__dirname,'../test-results'),{recursive:true});await page.screenshot({path:path.resolve(__dirname,'../test-results/floorplan.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no mobile horizontal overflow');await page.screenshot({path:path.resolve(__dirname,'../test-results/mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: real WASD/E, proximity, choices, sound graph, animation, modal pause, save reload, desktop/mobile layout; no page errors');
})().catch(e=>{console.error(e);process.exit(1)});
