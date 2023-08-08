//* 텍스트를 일정한 크기로 자르기
export function trimTextToLength(str: string | undefined, maxLength: number) {
  return str?.length! > maxLength ? str?.substring(0, maxLength) + "..." : str
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

//* debounce 구현
export default function debounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
  let timeoutId: NodeJS.Timeout

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      callback.apply(this, args)
    }, delay)
  }
}

// export function getAgentSystem() {
//   const uaData = (navigator as Navigator & { useAgentData?: any }).userAgent

//   console.log(uaData)

//   if (uaData) {
//     const platform = uaData.platform

//     if (platform.startsWith("win")) return "windows"
//     if (platform.startsWith("mac")) return "macos"
//     if (platform.startsWith("linux")) return "linux"
//     return "unknown"
//   }
// }

// export function getAgentSystem(): string {
//   if ("userAgentData" in navigator) {
//     const uaData = (navigator as Navigator & { userAgentData?: NavigatorUserAgentData }).userAgentData

//     if (uaData) {
//       console.log("Browser Name:", uaData.brands[0].brand)
//       console.log("Browser Version:", uaData.brands[0].version)
//       console.log("Platform:", uaData.platform)
//       console.log("Is Mobile?", uaData.mobile)

//       return uaData.platform || "unknown"
//     } else {
//       console.log("navigator.userAgentData is not supported in this browser.")
//     }
//   } else {
//     console.log("navigator.userAgentData is not supported in this browser.")
//   }

//   return "unknown"
// }

export function getAgentSystem(): string {
  const ua = navigator.userAgent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

  const platform = navigator.platform.toLowerCase()
  if (platform.startsWith("win")) return "windows"
  if (platform.startsWith("mac")) return "macos"
  if (platform.startsWith("linux")) return "linux"

  return isMobile ? "mobile" : "unknown"
}
