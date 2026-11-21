const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
const router = express.Router();
router.use(require('../middleware/authenticate'));
const route = fn => async (req,res) => { try { await fn(req,res); } catch (error) { res.status(error.name === 'ValidationError' ? 400 : 500).json({error:'Request failed'}); } };
const itemData = body => ({name:body.name,price:body.price,img:body.img,type:body.type});
router.get('/all',route(async(req,res)=>res.json(await Item.find({}))));
router.get('/cart',route(async(req,res)=>{
 const user=await User.findById(req.userId).populate('cart');
 return user?res.json(user.cart):res.status(404).json({error:'User not found'});
}));
router.post('/addtoDB',route(async(req,res)=>{
 const data=Array.isArray(req.body)?req.body:[req.body];
 if(data.length===0||data.length>100)return res.status(400).json({error:'Provide 1 to 100 items'});
 const items=await Item.create(data.map(itemData));res.status(201).json({message:'Items added',items});
}));
router.post('/editItem',route(async(req,res)=>{
 if(typeof req.body.DBitemName!=='string')return res.status(400).json({error:'Original item name required'});
 const result=await Item.updateOne({name:req.body.DBitemName},{$set:itemData(req.body)},{runValidators:true});
 return result.matchedCount?res.json({message:'Item updated'}):res.status(404).json({error:'Item not found'});
}));
router.post('/deleteitem',route(async(req,res)=>{
 const id=req.body.currItem?._id;
 if(!mongoose.isValidObjectId(id))return res.status(400).json({error:'Item ID required'});
 const result=await Item.deleteOne({_id:id});
 return result.deletedCount?res.json({message:'Item deleted'}):res.status(404).json({error:'Item not found'});
}));
for(const [path,remove] of [['/addtoUserCart',false],['/removeItemFromCart',true]]) {
 router.post(path,route(async(req,res)=>{
  if(typeof req.body.itemName!=='string')return res.status(400).json({error:'Item name required'});
  const item=await Item.findOne({name:req.body.itemName});
  if(!item)return res.status(404).json({error:'Item not found'});
  const user=await User.findById(req.userId);
  if(!user)return res.status(404).json({error:'User not found'});
  if(remove){const index=user.cart.findIndex(id=>id.equals(item._id));if(index<0)return res.status(404).json({error:'Item not in cart'});user.cart.splice(index,1);}
  else user.cart.push(item._id);
  await user.save();res.json({message:remove?'Item removed':'Item added'});
 }));
}
router.get('/filter',route(async(req,res)=>{
 const value=req.query.value;
 if(typeof value!=='string'||value.length>100)return res.status(400).json({error:'Provide a search string of up to 100 characters'});
 const escaped=value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const clauses=[{name:{$regex:escaped,$options:'i'}},{type:value}];
 if(value.trim()!==''&&Number.isFinite(Number(value)))clauses.push({price:Number(value)});
 res.json({filtered:await Item.find({$or:clauses})});
}));
module.exports=router;
