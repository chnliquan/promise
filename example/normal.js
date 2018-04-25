const Promise = require('../src/promise')

const _promise1 = new Promise((_resovle, _reject) => {
  setTimeout(_resovle, 2000, 'promise1---->resolved')
})

_promise1.then(_value => {
  console.log(_value)
  console.log('\n')
}).finally(()=>{
  console.log('promise1---->finally')
})

const _promise2 = new Promise((_resovle, _reject) => {
  setTimeout(() => {
    _reject('promise2---->rejected')
  }, 2000)
})

_promise2.then(_value => {
  console.log(_value)
}).catch(_reason => {
  console.log(_reason)
  console.log('\n')
}).finally(()=>{
  console.log('promise2---->finally')
})
