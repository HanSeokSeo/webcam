import { trimTextToLength } from "utils"

const str = "Next.js 프로젝트 환경 설정"
const cut = trimTextToLength(str, 5)
cut === "Next...." // true

describe("trimTextToLength 함수", () => {
  test("10 글자를 초과하는 문자열을 잘라야 합니다.", () => {
    const initialString = "This is a 34 character long string"
    const cutResult = trimTextToLength(initialString, 10)
    expect(cutResult).toEqual("This is a ...")
  })

  test("10 글자보다 짧은 문자열은 잘라서는 안 됩니다.", () => {
    const initialString = "7 chars"
    const cutResult = trimTextToLength(initialString, 10)
    expect(cutResult).toEqual("7 chars")
  })
})
