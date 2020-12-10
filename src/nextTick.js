function nextTick(fn) {
  if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
    return process.nextTick(fn)
  } else {
    // 实现浏览器上的 nextTick
    var count = 1
    // https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
    var observer = new MutationObserver(fn)
    var textNode = document.createTextNode(String(count))

    observer.observe(textNode, {
      characterData: true,
    })

    count += 1
    textNode.data = String(count)
  }
}
