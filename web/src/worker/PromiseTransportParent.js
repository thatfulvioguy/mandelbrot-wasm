
// The parent-side part of a Promise-based transport over WebWorkers
export default class PromiseTransportParent {

  nextMsgId = 0

  msgsAwaitingReponse = new Map()

  constructor(worker) {
    this.worker = worker

    this.worker.onmessage = (replyMessageEvent) => {
      const { msgId, data, error } = replyMessageEvent.data

      if (!this.msgsAwaitingReponse.has(msgId)) {
        console.log(`Got reply for unknown msgId ${msgId}. Seems like a bug.`)
        return
      }

      const { resolve, reject } = this.msgsAwaitingReponse.get(msgId)
      this.msgsAwaitingReponse.delete(msgId)

      if (error !== undefined) {
        reject(error)
      } else {
        resolve(data)
      }
    }
  }

  sendMessage(type, data) {
    return new Promise((resolve, reject) => {
      const msgId = this.nextMsgId++

      this.msgsAwaitingReponse.set(msgId, { resolve, reject })

      this.worker.postMessage({ msgId, type, data })
    })
  }



}
