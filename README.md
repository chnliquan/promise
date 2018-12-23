# promise
a simple promise implementation

## 使用方法

```shell
$ cd example
$ node base.js
$ node Promise.all.js
...
...
```

## 单线程
JavaScript 语言的一大特点就是单线程，也就是说，同一个时间只能做一件事。单线程就意味着，所有任务需要排队，前一个任务结束，才会执行后一个任务。如果前一个任务耗时很长，后一个任务就不得不一直等着

所有任务可以分成两种，一种是 **同步任务（synchronous）**，另一种是 **异步任务（asynchronous）**。同步任务指的是，在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务；异步任务指的是，不进入主线程、而进入 **任务队列（task queue）** 的任务，只有 **任务队列** 通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行

具体来说，异步执行的运行机制如下：
1. 所有同步任务都在主线程上执行，形成一个 **执行栈（execution context stack）**
2. 主线程之外，还存在一个 **任务队列（task queue）**。只要异步任务有了运行结果，就在 **任务队列** 之中放置一个事件
3. 一旦 **执行栈** 中的所有同步任务执行完毕，系统就会读取 **任务队列**，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行
4. 主线程不断重复上面的第三步

## 使用 Promise 异步编程
以常见的`Ajax`请求函数为例，当前端需要像服务器请求数据`A`后继续请求`B`，通过回调函数进行接口调用的形式如下：

```js
ajax('/p/getSomething.json', () => {
  ajax('/p/getAnother.json', () => {
    ajax('/p/getLast.json', () => {
      // ...
    })
  })
})
```
从上面的例子可以看出，代码中嵌套了大量的回调函数，这对于代码的理解以及后期的维护都是很不可取的

使用`Promise`进行异步编程重构之后代码的形式如下：

```js
ajax('/p/getSomething.json').then(value => {
  return ajax('/p/getAnother.json')
}).then(value => {
  return ajax('/p/getLast.json')
}).then(value => {
  // ...
})
```

可以看出通过`Promise`进行异步函数编程解决了回调函数多层嵌套的问题，通过链式调用可以将请求一直向后传递

再比如，我们需要返回服务器上一本书其中一个章节的内容：

```js
function getJSON(url) {
  return ajax(url).then(JSON.parse)
}
```

`getJSON()`函数用于获取 json 数据

```js
let storyPromise

function getChapter(i) {
  storyPromise = storyPromise || getJSON('story.json')

  return storyPromise.then(story => {
    return getJSON(story.chapterUrls[i])
  })
}

getChapter(0).then(chapter => {
  console.log(chapter)
  return getChapter(1)
}).then(chapter => {
  console.log(chapter)
})
```

直到`getChapter()`被调用，我们才下载`story.json`，但是下次`getChapter()`被调用时，我们重复使用`storyPromise`，因此`story.json`仅获取一次

## 原理
`Promise`原理总结下来其实就是两点：
- 维护一个 **内部状态**
- 维护一个 **内部数组**

### 内部状态
一个`Promise`对象会在内部维护三种状态：

- **fulfilled**：异步过程完成
- **rejected**：异步过程失败
- **pending**：异步过程待定



![](https://user-gold-cdn.xitu.io/2018/1/4/160c1030ec7dd190?imageslim)



> 注：一旦从`pending`状态转换为`fulfilled`或`rejected`之后, 这个`Promise`对象的状态就不会再发生任何变化

```js
class Promise {
  constructor() {
    this.status = 'pending'
    this.data = void 0
  }
  
  const resolve = value => {
    if (this.status !== 'pending') {
      return
    }

    this.status = 'fulfilled'
  }
  
  // ...
}
```

从上述代码种可以看到，当执行`resolve`或者`reject`函数时首先会判断当前的状态，如果状态已经确定了就直接跳出，如果没有确定会根据当前异步结果设置最终的状态

### 内部数组
在`Promise`对象中，通过 **观察者模式** 维护一个数组，这个数组在同步执行过程中（调用`then()`方法）收集成功和失败的回调函数，在异步任务真正完成的时候触发这个数组中所收集的所有回调函数

```js
class Promise {
  constructor() {
    // ..
    this.callbacks = []     // 回调集合

    const resolve = value => {
      setTimeout(() => {
        // 如果状态已经确定则跳出
        if (this.status !== 'pending') {
          return
        }

        this.status = 'fulfilled'
        this.data = value

        this.callbacks.forEach(event => {
          event.onFulfilled(value)
        })
      })
    }

    const reject = reason => {
      setTimeout(() => {
        if (this.status !== 'pending') {
          return // 如果状态已经确定则跳出
        }

        this.status = 'rejected'
        this.data = reason

        this.callbacks.forEach(event => {
          event.onRejected(reason)
        })
      })
    }
    
    // ...
  }
  
  then() {
    // ...
    
    if (this.status === 'pending') {
      return promise = new Promise((resolve, reject) => {
        this.callbacks.push({
          onFulfilled(value) {
            try {
              onFulfilled(value)
            } catch (e) {
              return reject(e)
            }
          },

          onRejected(reason) {
            try {
              onRejected(reason)
            } catch (e) {
              return reject(e)
            }
          }
        })
      })
    }
  }
}
```

[完整代码](https://github.com/chnliquan/promise/blob/master/src/promise.js)

## 兼容其他 promise 库
为了使我们的 promise 对象兼容其他库的实现，既其他库执行`Promise.prototype.then()`、`Promise.all()`等等得到的预期使相同的，这就需要根据 [promises/A+](https://promisesaplus.com/) 规范进行 **thenable** 的处理，[完整代码](https://github.com/chnliquan/promise/blob/master/src/promisesA+.js)
