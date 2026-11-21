const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const { loadConfig } = require('../config');
process.env.JWT_SECRET = 'test-only-key-not-used-outside-tests-123456789';
function run(token) {
 const req={headers:{authorization:token?'Bearer '+token:''}};
 const res={status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
 let passed=false;authenticate(req,res,()=>{passed=true;});return {req,res,passed};
}
test('missing or placeholder signing key fails fast',()=>{assert.throws(()=>loadConfig({}));assert.throws(()=>loadConfig({JWT_SECRET:'replace-with-a-long-placeholder-value'}));});
test('missing and forged tokens are rejected',()=>{assert.equal(run().res.code,401);assert.equal(run('forged').res.code,401);});
test('valid token establishes verified user identity',()=>{const id='012345678901234567890123';const result=run(jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'1h'}));assert.equal(result.passed,true);assert.equal(result.req.userId,id);});
test('expired tokens are rejected',()=>{assert.equal(run(jwt.sign({id:'012345678901234567890123'},process.env.JWT_SECRET,{expiresIn:-1})).res.code,401);});
test('tokens without a valid user ID are rejected',()=>{assert.equal(run(jwt.sign({id:{bad:'id'}},process.env.JWT_SECRET)).res.code,401);});
