const Promise = require('./promise.js');

const promise = new Promise((_resolve, _reject)=>{
    // setTimeout(() => {
    //     // _resolve('success');
    //     _reject('fail');
    // }, 2000);
    
    _resolve('success');

    // throw 'error';
});

promise.then((_value) => {
    console.log(_value);
}, (_e) => {
    console.log(_e);
}).finally(() => {
	console.log('finally');
});

// var promise1 = Promise.resolve(3);
// var promise2 = 42;
// var promise3 = new Promise(function(resolve, reject) {
// 	setTimeout(resolve, 100, 'foo');
// });

// Promise.all([promise1, promise2, promise3]).then(function(values) {
// 	console.log(values);
// });

// var promise1 = new Promise(function(resolve, reject) {
//     setTimeout(resolve, 500, 'one');
// });
// var promise2 = new Promise(function(resolve, reject) {
//     setTimeout(resolve, 100, 'two');
// });

// Promise.race([promise1, promise2]).then(function(value) {
//   console.log(value);
//   // Both resolve, but promise2 is faster
// });