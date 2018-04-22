#4. Asynchronous Control Flow Patterns with ES2015 and Beyond
    
## Promise
Promise是对允许一个函数返回一个称之为promise的对象的抽象，它表示异步操作的最终结果。
当异步操作没有完成时，我们称promise为pending状态，成功时为fulfilled，出错失败为reject。一旦一个promise的状态是二者其一，
则其状态变为settled。  
可以使用promise的then方法来接收fulfillment值或者rejection错误：  
```javascript
promise.then([onFulfilled], [onRejected])
```
其中onFulfilled为一个接收最终结果的函数，onRejected为另一个接收rejection错误的函数。  
为了了解promise是如何改变我们的代码：
```javascript
asyncOperation(arg, (err, result) => {
    if(err) {
        //handle error
    }
    //do stuff with result
});
```
Promise允许我们将这个典型的CPS代码转变为具有更好结构和更优雅的代码：  
```javascript
asyncOperation(arg)
    .then(result => {
        //do stuff with result
    }, err => {
        //handle error
});
```
then()的一个关键属性是它同步返回另一个promise。  
这一特性运行我们构建promises链，允许简单聚集和在多个配置中安排异步操作。同样的，如果我们不指定onFulfilled()或者onRejected()
fulfillment值或者rejection原因会自动的转发到promises链的下一个promise。有了promises链，顺序执行任务变成很简单：  
```javascript
asyncOperation(arg)
    .then(result1 => {
        //returns another promise
        return asyncOperation(arg2);
    })
    .then(result2 => {
        //returns a value
        return 'done';
    })
    .then(undefined, err => {
        //any error in the chain is caught here
    });
```
下图从另一个视角来看promises链是如何工作的：  
![promiseschain](images/)  
promises另一个重要的特性是onFulfilled()和onRejected()函数被保证是异步的，即使我们同步resolve一个promise值。  
  
***最重要的部分*** 如何在onFulfilled()和onRejected()函数中有异常抛出，由then()返回的promise会自动reject那个抛出的异常。  
## Promises/A+ implementations
ES2015 promises APIs:  
Constructor(new Promise(function(resolve, reject) {})):创造了一个新的promise, 
根据作为参数传递的函数的行为来实现或拒绝。构造函数的参数解释如下：  
- resolve(obj): This will resolve the promise with a fulfillment value, which will
be obj if obj is a value. It will be the fulfillment value of obj if obj is a promise
or a thenable.
- reject(err):This rejects the promise with the reason err.
###Promise对象的静态方法
- Promise.resolve(obj)：根据一个thenable或者值来创建一个新的promise
- Promise.reject(err)：创建一个reject的promise，err为原因
- Promise.all(iterable)：创建一个新的promise，当迭代器对象的每一个成员都fulfilled,完成返回fulfullment值的迭代器，当任何一个
rejects时，reject。迭代器中的每一项可以为promise，thenable或者一个值。
- Promise.race(iterable): 当迭代器任何一个promise resolve或者reject时即返回，返回那个promise的值或者错误原因。
###Methods of a promise instance
- promise.then(onFulfilled, onRejected): promise的基本方法
- promise.catch(onRejected): promise.then(undefined, onRejected)的语法糖
## Promisifying a Node.js style function
```javascript
module.exports.promisify = function(callbackBasedApi) {
  return function promisified() {
    const args = [].slice.call(arguments);
    return new Promise((resolve, reject) => {
        args.push((err, result) => {
           if(err) {
               return reject(err);
           } 
           if(arguments.length <= 2) {
               resolve(result);
           } else {
               resolve([].slice.call(arguments, 1));
           }
        });
        callbackBasedApi.apply(null, args);
    })
  }
}
```
## Sequential execution
### Sequential iteration
### Sequential iteration – the pattern
```javascript
let tasks = [ /* ... */ ]
let promise = Promise.resolve();
tasks.forEach(task => {
    promise = promise.then(() => {
        return task();
    });
});
promise.then(() => {
    //All tasks completed
});
```
## Parallel execution
## Limited parallel execution
## Exposing callbacks and promises in public APIs
一种方法： 仅提供基于callbacks的API，让开发者根据需要去promisify。  
第二种方法：提供一个面向callback的API，但是callback参数时可选的，如果提供了callback，则按正常运行，如果没有则返回一个promise对象。
```javascript
module.exports = function asyncDivision (dividend, divisor, cb) {
    return new Promise((resolve, reject) => { // [1]
        process.nextTick(() => {
            const result = dividend / divisor;
            if (isNaN(result) || !Number.isFinite(result)) {
                const error = new Error('Invalid operands');
                if (cb) { cb(error); } // [2]
                    return reject(error);
            }
            if (cb) { cb(null, result); } // [3]
                resolve(result);
        });
    });
};
```