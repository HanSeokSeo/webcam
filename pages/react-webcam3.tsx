import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Webcam from "react-webcam"
import RefreshConnectDevices from "asset/icons/RefreshIcon"
import Image from "next/image"
import { useInterval } from "usehooks-ts"
import { getCurrentDateTime, trimTextToLength } from "utils"

interface CapturedFile {
  name: string
  imgSrc: string | null | undefined
}

function ReactWebcam() {
  const [playing, setPlaying] = useState<boolean>(true)
  const [capturedFiles, setCapturedFiles] = useState<CapturedFile[]>([])
  const [devices, setDevices] = useState<InputDeviceInfo[]>([])
  const [qrayDeviceId, setQrayDeviceId] = useState<string>("")
  const [isQrayOn, setIsQrayOn] = useState<boolean>(true)
  const [isQrayDeviceStreamOn, setIsQrayDeviceStreamOn] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)

  const webcamRef = useRef<Webcam | null>(null)

  const videoConstraints: MediaStreamConstraints = {
    video: { deviceId: { exact: qrayDeviceId } },
  }

  // 스트림할 디바이스 선택
  const checkQrayDeviceStream: (qrayDeviceId: string | undefined) => void = async (qrayDeviceId: string | undefined) => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia(videoConstraints)

      if (stream.active) {
        setIsQrayDeviceStreamOn(true)
      } else {
        setIsQrayDeviceStreamOn(false)
      }

      console.log(
        `count: ${count}, qrayDeviceId: ${trimTextToLength(qrayDeviceId, 10)}, mediaStream: ${
          stream.active
        }, isQrayDeviceStreamOm: ${isQrayDeviceStreamOn}`,
      )

      if (isQrayDeviceStreamOn) {
        setIsQrayOn(true)
      } else {
        setIsQrayOn(false)
      }
    } catch (error) {
      console.log("error in mediaStream", error)
    }
  }

  const getDevices = (e: MediaDevices) => {
    e.enumerateDevices().then(devices => {
      const qrayDevice = devices.filter(device => device.label === "QRAYPEN C (636c:9050)")
      const qrayDeviceId = qrayDevice[0]?.deviceId

      setDevices(devices)
      setQrayDeviceId(qrayDeviceId)
      console.log(devices)
      console.log(`qrayDeviceId: ${trimTextToLength(qrayDeviceId, 10)}, count: ${count}`)
    })
  }

  useInterval(() => {
    let detectedMediaDevices = navigator.mediaDevices
    getDevices(detectedMediaDevices)

    setCount(count => count + 1)
  }, 3000)

  return (
    <>
      <div className="flex flex-col items-center w-screen h-screen">
        <div className="flex items-center justify-center w-full border-2 border-blue-500 h-96">
          {isQrayOn ? (
            <Webcam
              ref={webcamRef}
              className="h-full"
              videoConstraints={videoConstraints.video}
              audio={false}
              screenshotFormat="image/jpeg"
            />
          ) : (
            "The qray power is off. Please turn on the power."
          )}
        </div>

        <div className="flex w-full h-40 min-w-7xl ">
          <div className="flex flex-col w-2/5">
            <div className="flex h-1/2">
              <button className="flex items-center justify-center w-1/2 px-4 py-2 m-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 active:bg-blue-700">
                {playing ? "Stop" : "Start"}{" "}
              </button>
              <button className="w-1/2 px-4 py-2 m-2 bg-yellow-500 rounded-md hover:bg-yellow-600 active:bg-yellow-700">
                Capture{" "}
              </button>
            </div>
            <div className="flex h-1/2">
              <button className="w-full px-4 py-2 m-2 bg-red-500 rounded-md hover:bg-red-600 active:bg-red-700">Record</button>
            </div>
          </div>
          <div className="w-3/5 py-2">
            <div className="flex items-center space-x-2 h-[20%]">
              <div className="text-[1.25rem]">Connected Devices</div>
              <RefreshConnectDevices className="w-5 h-5 p-[0.15rem] bg-white rounded-full cursor-pointer hover:bg-slate-600" />
            </div>

            <div className="overflow-y-scroll h-[80%]">
              <ul className="pl-2 mt-2 ">
                {devices.map((device, key) => (
                  <li key={key}>{device.label || `Device ${key + 1}`}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full overflow-x-auto border-2 border-red-500 h-80">
          {capturedFiles.map((photo, idx) => {
            if (photo && photo.imgSrc != null && photo.imgSrc != undefined) {
              return (
                <div className="min-w-[320px] min-h-[240px] border-2 border-blue-500" key={idx}>
                  <Image src={photo.imgSrc} alt="Captured" width={320} height={240} />
                  <div className="m-1">{photo.name}</div>
                </div>
              )
            }
          })}
        </div>
      </div>
    </>
  )
}

export default ReactWebcam
