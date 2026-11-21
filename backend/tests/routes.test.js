const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const Item = require('../models/Item');
const User = require('../models/User');
const router = require('../routes/fetchItems');
process.env.JWT_SECRET = 'test-only-key-not-used-outside-tests-123456789';
const id = '012345678901234567890123';
async function withServer(fn) {
 const app=express();app.use(express.json());app.use('/getitems',router);
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try {await fn('http://127.0.0.1:'+server.address().port,{Authorization:'Bearer '+jwt.sign({id},process.env.JWT_SECRET),'Content-Type':'application/json'});} finally {await new Promise(r=>server.close(r));}
}
test('cart lookup ignores a supplied different user ID',async()=>{
 const original=User.findById;let lookup;
 User.findById=value=>{lookup=value;return {populate:async()=>({cart:[]})};};
 try {await withServer(async(base,headers)=>{const response=await fetch(base+'/getitems/cart?UserId=someone-else',{headers});assert.equal(response.status,200);assert.equal(lookup,id);});}finally{User.findById=original;}
});
test('deleting an item rejects arbitrary filters',async()=>{
 await withServer(async(base,headers)=>{const response=await fetch(base+'/getitems/deleteitem',{method:'POST',headers,body:JSON.stringify({currItem:{name:{$ne:null}}})});assert.equal(response.status,400);});
});
test('removing an absent cart item does not remove another item',async()=>{
 const originalItem=Item.findOne,originalUser=User.findById;let saved=false;
 Item.findOne=async()=>({_id:'missing'});User.findById=async()=>({cart:[{equals:()=>false}],save:async()=>{saved=true;}});
 try {await withServer(async(base,headers)=>{const response=await fetch(base+'/getitems/removeItemFromCart',{method:'POST',headers,body:JSON.stringify({itemName:'missing'})});assert.equal(response.status,404);assert.equal(saved,false);});}finally{Item.findOne=originalItem;User.findById=originalUser;}
});
