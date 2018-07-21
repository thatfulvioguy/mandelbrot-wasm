
// The parent-side part of a Promise-based transport over WebWorkers
export default function onWorkerMessage(handler) {
  self.onmessage = (messageEvent) => {
    const { msgId, type, data } = messageEvent.data

    Promise.resolve(handler(type, data))
      .then((response) => {
        if (response && typeof response === 'object' && response.hasOwnProperty('transferrables') &&
          response.hasOwnProperty('data')) {
          const { data, transferrables } = response
          self.postMessage({ msgId, data }, transferrables)
        } else {
          self.postMessage({ msgId, data: response })
        }
      })
      .catch((error) => {
        self.postMessage({ msgId, error })
      })
  }
}
