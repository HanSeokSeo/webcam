//* 텍스트를 일정한 크기로 자르기
export function trimTextToLength(str: string, maxLength: number) {
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str
}

// export function getCurrentTime() {
//   const now = new Date()
//   const hours = now.getHours().toString().padStart(2, "0")
//   const minutes = now.getMinutes().toString().padStart(2, "0")
//   const seconds = now.getSeconds().toString().padStart(2, "0")

//   return `${hours}:${minutes}:${seconds}`
// }

export function getCurrentDateTime(): string {
  const now: Date = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }

  return now.toLocaleString(undefined, options)
}
