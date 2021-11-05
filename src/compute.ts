export function compute() {
  const timeStart = new Date().getTime()
  const len = 128000000
  const a = new Uint8Array(len)
  const b = new Uint8Array(len)
  let sum = 0
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i]
  }
  const timeEnd = new Date().getTime()
  return timeEnd - timeStart
}
