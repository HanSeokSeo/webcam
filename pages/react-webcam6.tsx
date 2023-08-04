import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Webcam from "react-webcam"
import Image from "next/legacy/image"
import RefreshConnectDevices from "public/asset/icons/RefreshIcon"
import { useInterval } from "usehooks-ts"
import debounce, { getCurrentDateTime, trimTextToLength } from "utils"

interface CapturedFile {
  name: string
  imgSrc: string | null | undefined
}

function ReactWebcam() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [capturedFiles, setCapturedFiles] = useState<CapturedFile[]>([])

  const [deviceList, setDeviceList] = useState<InputDeviceInfo[]>([])
  const [qrayDeviceId, setQrayDeviceId] = useState<string | undefined>(undefined)
  const [isQrayDevice, setIsQrayDevice] = useState<boolean>(false)
  const [isIntervalRunning, setIsIntervalRunning] = useState<boolean>(false)

  const [isQrayDeviceStreamOn, setIsQrayDeviceStreamOn] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const getQrayStream: (qrayDeviceId: string | undefined) => void = async (qrayDeviceId: string | undefined) => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: qrayDeviceId } },
      })

      console.log(stream.getVideoTracks()[0])
      console.log(`
        isMuted: ${stream.getVideoTracks()[0].muted}, 
        state: ${stream.getVideoTracks()[0].readyState}, 
        active: ${stream.active}
        `)

      const isMuted = stream.getVideoTracks()[0].muted // muted가 false면 stream이 true

      if (!isMuted) {
        setIsQrayDevice(true)
      } else {
        setIsQrayDevice(false)
      }

      if (!isMuted && videoRef.current && !isQrayDeviceStreamOn) {
        videoRef.current.srcObject = null
        videoRef.current.srcObject = stream
        videoRef.current
          .play()
          .then()
          .catch(e => console.log(e))
        setIsQrayDeviceStreamOn(true)
        console.log("stream is true")
      } else if (isMuted && isQrayDeviceStreamOn) {
        stream.getTracks().forEach(t => {
          t.stop()
        })
        setIsQrayDeviceStreamOn(false)
        console.log("stream is false")
      } else {
        console.log("something or nothing")
      }
    } catch (error) {
      console.log("error in mediaStream", error)
      setIsQrayDevice(false)
      setIsQrayDeviceStreamOn(false)
    }
  }

  const getQrayDevices = async () => {
    try {
      await navigator.mediaDevices.enumerateDevices().then(devices => {
        console.log(devices)
        const newQrayDevice = devices.filter(device => device.label.toUpperCase().includes("QRAY"))
        const newQrayDeviceId = newQrayDevice[0]?.deviceId

        if (newQrayDeviceId && newQrayDevice.length < 2) {
          setDeviceList(newQrayDevice)
          setQrayDeviceId(newQrayDeviceId)
          setIsQrayDevice(true)
          console.log("Found a valid QRAY device:", newQrayDevice)
        } else {
          console.log("No valid QRAY device found.")
        }
      })
    } catch (error) {
      console.log("Error in enumerateDevices:", error)
    }
  }

  useInterval(() => {
    setCount(count => count + 1)
    console.log(count)

    getQrayDevices()

    if (qrayDeviceId) {
      getQrayStream(qrayDeviceId)
    }
  }, 1000)

  return (
    <>
      <div className="flex flex-col items-center w-screen h-screen">
        <div className="flex items-center justify-center w-full border-2 border-blue-500 h-96 relative">
          <div className="ml-3 mt-3 absolute top-0 left-0">QrayStream {isQrayDeviceStreamOn ? "ON" : "OFF"}</div>
          {isQrayDevice ? (
            <video autoPlay ref={videoRef} className="h-full" />
          ) : (
            <div className="flex flex-col items-center justify-center text-2xl">
              <p>Qray device is not connected.</p>
              <p>After connecting the cables and turn on the power</p>
              <p>press the 'Connect' button below.</p>
              <p>Or check two kind of Qray Devices are connected</p>

              <div className="w-[250px] h-[150px] relative flex-col mt-6">
                <Image
                  src="/asset/images/qray_yellow.jpeg"
                  alt="Qray normal connection"
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full h-40 min-w-7xl ">
          <div className="flex flex-col w-2/5">
            <div className="flex h-1/2">
              {/* <div>{count}</div> */}
              <button className="flex items-center justify-center w-1/2 px-4 py-2 m-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 active:bg-blue-700">
                {isPlaying ? "Stop" : "Start"}{" "}
              </button>
              <button className="w-1/2 px-4 py-2 m-2 bg-yellow-500 rounded-md hover:bg-yellow-600 active:bg-yellow-700">
                Capture{" "}
              </button>
            </div>
            <div className="flex h-1/2">
              <button className="w-full px-4 py-2 m-2 bg-red-500 rounded-md hover:bg-red-600 active:bg-red-700">
                Record
              </button>
            </div>
          </div>
          <div className="w-3/5 py-2">
            <div className="flex items-center space-x-2 h-[20%]">
              <div className="text-[1.25rem]">Connected Devices</div>
              <RefreshConnectDevices className="w-5 h-5 p-[0.15rem] bg-white rounded-full cursor-pointer hover:bg-slate-600" />
            </div>

            <div className="overflow-y-scroll h-[80%]">
              <ul className="pl-2 mt-2 ">
                {deviceList.map((device, key) => (
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
