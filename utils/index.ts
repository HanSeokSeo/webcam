//* 텍스트를 일정한 크기로 자르기
export function trimTextToLength(str: string, maxLength: number) {
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str
}
