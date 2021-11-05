import { compute } from './compute'

addEventListener('message', (ev: MessageEvent<number>) => {
  const workerId = ev.data
  const time = compute()
  postMessage({
    workerId,
    time,
  })
})

export {}
