import { compute } from './compute'

function getCanvas() {
  return document.getElementById('canvas')
}

window.onload = start

function mean(data: number[]): number {
  let sum = 0
  for (const item of data) {
    sum += item
  }
  return sum / data.length
}

async function start() {
  const timeInUI = compute()
  const statistics: {
    type: 'ui' | 'worker'
    core: number
    avgTime: number
    timeDetail: number[]
  }[] = [
    {
      type: 'ui',
      core: 0,
      avgTime: timeInUI,
      timeDetail: [],
    },
  ]
  // 不同core时，执行计算，统计平均耗时
  for (let core = 1; core <= navigator.hardwareConcurrency; core++) {
    const workers: Worker[] = []
    for (let i = 0; i < core; i++) {
      const worker = new Worker(new URL('./worker.ts', import.meta.url))
      workers.push(worker)
    }
    const tasks = workers.map((worker: Worker, index: number) => {
      return async (): Promise<number> => {
        return await waitWorkerExecure(worker, index)
      }
    })
    const timeList = await Promise.all(tasks.map((task) => task()))
    const avgTime = mean(timeList)
    statistics.push({
      type: 'worker',
      core: core,
      avgTime,
      timeDetail: timeList,
    })
    // 关闭workers
    for (const worker of workers) {
      worker.terminate()
    }
    // 清空workers
    workers.splice(0, workers.length)
  }
  // 打印测试结果
  for (const item of statistics) {
    console.log(
      `type: ${item.type}, core: ${item.core}, avg time: ${
        item.avgTime
      }, time detail: ${JSON.stringify(item.timeDetail)}`
    )
  }
}

// 等待worker执行结束
async function waitWorkerExecure(worker: Worker, workerId: number) {
  return new Promise<number>((resolve) => {
    // 通知worker开始计算
    worker.postMessage(workerId)
    // 返回计算耗时
    worker.onmessage = (
      ev: MessageEvent<{ workerId: number; time: number }>
    ) => {
      const { time } = ev.data
      resolve(time)
    }
  })
}
