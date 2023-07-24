import { useEffect } from "react"

function Qraycam() {
  useEffect(() => {
    // 웹 소켓 연결
    const socket = new WebSocket("ws://localhost:4000") // 웹 소켓 서버 주소를 적절히 변경해야 합니다.

    // 웹 소켓 이벤트 핸들러
    socket.onopen = () => {
      console.log("웹소켓서버와 연결 성공")
    }

    // 2-2) 메세지 수신 이벤트 처리
    socket.onmessage = function (event) {
      console.log(`서버 웹소켓에게 받은 데이터: ${event.data}`)
    }

    // 컴포넌트 언마운트 시 웹 소켓 연결 해제
    return () => {
      socket.close()
    }
  }, [])
  return <div>Hello React!</div>
}

export default Qraycam
