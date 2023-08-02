import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Webcam from "react-webcam"
import Image from "next/legacy/image"
import { userInfo } from "os"
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
  const [isRunning, setIsRunning] = useState<boolean>(false)

  const [isQrayDeviceStreamOn, setIsQrayDeviceStreamOn] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const getQrayStream: (qrayDeviceId: string | undefined) => void = async (qrayDeviceId: string | undefined) => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: qrayDeviceId } },
      })
      console.log("stream", stream)
      console.log("isQrayDeviceStreamOn", isQrayDeviceStreamOn)

      if (stream.active) setIsQrayDevice(true)

      if (stream.active && videoRef.current && !isQrayDeviceStreamOn) {
        videoRef.current.srcObject = null
        videoRef.current.srcObject = stream
        videoRef.current.play()
        console.log("stream is true")
        setIsQrayDeviceStreamOn(true)
        setIsPlaying(true)
      } else if (!stream.active && isQrayDeviceStreamOn) {
        stream.getTracks().forEach(t => {
          t.stop()
        })
        console.log("stream is false")
        setIsQrayDevice(false)
        setIsQrayDeviceStreamOn(false)
        setIsPlaying(false)
      } else {
        console.log("something or nothing")
      }
    } catch (error) {
      console.log("error in mediaStream", error)
      setIsQrayDevice(false)
    }
  }

  /* 최초 연결시에 큐레이의 deviceID를 get하는 용도 
  deviceID의 변경이 있는 경우만 작동. device 의 물리적인 버튼을 누르는 경우,
  sleep 모드로 변경되는 경우에는 실행될 필요가 없음
  */
  const getQrayDevices = async () => {
    if (isPlaying == false) {
      console.log("11")
      try {
        await navigator.mediaDevices.enumerateDevices().then(devices => {
          const newQrayDevice = devices.filter(device => device.label.toUpperCase().includes("QRAYPEN C"))
          const newQrayDeviceId = newQrayDevice[0]?.deviceId

          if (qrayDeviceId !== undefined && newQrayDeviceId !== undefined && qrayDeviceId !== newQrayDeviceId) {
            console.log("22")
            setDeviceList(newQrayDevice)
            setQrayDeviceId(newQrayDeviceId)
            setIsQrayDevice(!!newQrayDeviceId)

            console.log("DeviceList", devices)
            console.log("newQrayDeviceId :", trimTextToLength(newQrayDeviceId, 20))
            console.log("oldQrayDeviceId :", trimTextToLength(qrayDeviceId, 20))
          } else {
            console.log("33")
            console.log("newQrayDevice", newQrayDevice)
            if (newQrayDeviceId.length != 0) {
              setDeviceList(newQrayDevice)
              setQrayDeviceId(newQrayDeviceId)
              getQrayStream(qrayDeviceId)
            }
          }
        })
      } catch (error) {}
    } else {
      console.log("44")
      try {
        console.log("55")
        await navigator.mediaDevices.enumerateDevices().then(devices => {
          const newQrayDevice = devices.filter(device => device.label.toUpperCase().includes("QRAYPEN C"))
          const newQrayDeviceId = newQrayDevice[0]?.deviceId

          setDeviceList(newQrayDevice)
          setQrayDeviceId(newQrayDeviceId)
          setIsQrayDevice(!!newQrayDeviceId)

          console.log("DeviceList", devices)
          console.log("newQrayDeviceId :", trimTextToLength(newQrayDeviceId, 20))
          console.log("oldQrayDeviceId :", trimTextToLength(qrayDeviceId, 20))
        })
      } catch (error) {
        console.log("Error in enumerateDevices", error)
        setIsQrayDevice(false)
      }
    }
  }

  const debouncedGetQrayDevices: () => void = debounce(getQrayDevices, 500)

  /* 최초 접속하면서 deviceID를 get하고 나면 useInterval 작동
  getQrayStream 함수를 통해 stream이 계속해서 true인지를 확인한다.
  useInterval이 작동한다는 것은 바로 qrayDevice의 stream이
  바로 표시된다는 의미이다.
  */
  useInterval(
    () => {
      setCount(count => count + 1)
      console.log(count)

      if (qrayDeviceId === "" || undefined) {
        console.log("1")
        getQrayDevices()
      } else {
        console.log("2")
        getQrayStream(qrayDeviceId)
      }
    },
    isRunning ? 500 : null,
  )

  useEffect(() => {
    getQrayDevices()
  }, [])

  useEffect(() => {
    if (isQrayDevice) {
      console.log("Qray Device Found!")
      setIsRunning(true)
    } else if (!isQrayDeviceStreamOn || !isQrayDevice) {
      console.log("Qray Device not Found!")
      setIsRunning(false)
    }
  }, [isQrayDevice])

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

              <div className="w-[250px] h-[150px] relative flex-col mt-6">
                <Image
                  src="/asset/images/qray_yellow.jpeg"
                  alt="Qray normal connection"
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              </div>
              <button
                className="px-4 py-2 mt-6 text-black transition-colors duration-300 bg-white rounded cursor-pointer btn-connect hover:bg-gray-500 hover:text-black"
                onClick={debouncedGetQrayDevices}>
                Connect
              </button>
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