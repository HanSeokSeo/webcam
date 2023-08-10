import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import RefreshConnectDevices from "public/asset/icons/RefreshIcon"
import { useInterval } from "usehooks-ts"
import { getCurrentDateTime } from "utils"

interface CapturedFile {
  name: string
  imgSrc: string | null | undefined
}

function ReactWebcam() {
  const [playing, setPlaying] = useState<boolean>(true)
  const [capturedFiles, setCapturedFiles] = useState<CapturedFile[]>([])
  const [devices, setDevices] = useState<InputDeviceInfo[]>([])
  const [qrayDeviceId, setQrayDeviceId] = useState<string>("")
  const [isQrayOn, setIsQrayOn] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const userMediaConstraints = useMemo(() => {
    return {
      audio: false,
      video: true,
    }
  }, [])

  // const webcamConstraints = {
  //   deviceId: qrayDeviceId,
  // }

  const toggleCam = (): void => {
    if (playing) {
      const cam = videoRef.current

      if (cam && cam.srcObject) {
        const stream = cam.srcObject as MediaStream
        stream.getTracks().forEach(track => {
          track.stop()
        })
        setPlaying(!playing)
      }
    } else {
      setPlaying(!playing)
    }
  }

  const capturePhoto = useCallback(() => {
    // Get the video element from the ref
    const cam = videoRef.current

    // Check if the video element and its srcObject exist
    if (cam && cam.srcObject) {
      // Cast the srcObject to MediaStream
      const stream = cam.srcObject as MediaStream

      // Create a canvas element to capture the photo
      const canvas = document.createElement("canvas")
      canvas.width = cam.videoWidth
      canvas.height = cam.videoHeight

      // Draw the current frame of the video onto the canvas
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(cam, 0, 0, cam.videoWidth, cam.videoHeight)

        // Get the image data as a data URL
        const imageSrc = canvas.toDataURL()

        // Get the current date and time as a string
        const currentTime = getCurrentDateTime()

        // Create a new object with the photo information
        const newPicInfo = {
          name: currentTime,
          imgSrc: imageSrc,
        }

        // Update the 'capturedFiles' state with the new photo info
        setCapturedFiles(prev => [...prev, newPicInfo])
      }
    }
  }, [setCapturedFiles])

  const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    setDevices([...mediaDevices])
  }, [])

  const recordStream = () => {}

  const handleRefreshClick: MouseEventHandler<SVGElement> = () => {
    navigator.mediaDevices.enumerateDevices().then(devices => handleDevices(devices))
  }

  // 스트림할 디바이스 선택
  const getUserMedia = async (constraints?: MediaStreamConstraints) => {
    await navigator.mediaDevices.getUserMedia(constraints).then(mediaStream => {
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      console.log("mediaStream", mediaStream)
      setIsQrayOn(mediaStream.active)
    })
  }

  // 연결되어있는 디바이스 리스트
  const mediaDevices = () => {
    return navigator.mediaDevices.enumerateDevices()
  }

  useInterval(() => {
    mediaDevices().then(devices => {
      console.log(devices)
      setDevices(devices)
      const qrayDevice = devices.filter(device => device.label.toUpperCase().includes("QRAYPEN C"))
      const deviceId = qrayDevice[0]?.deviceId
      setQrayDeviceId(deviceId)
      console.log(deviceId)
    })

    getUserMedia(userMediaConstraints)
  }, 500)

  useEffect(() => {}, [isQrayOn])

  return (
    <>
      <div className="flex flex-col items-center w-screen h-screen">
        <div className="flex items-center justify-center w-full border-2 border-blue-500 h-96">
          {isQrayOn ? (
            <video ref={videoRef} className="h-full" autoPlay />
          ) : (
            "The qray power is off. Please turn on the power."
          )}
        </div>

        <div className="flex w-full h-40 min-w-7xl ">
          <div className="flex flex-col w-2/5">
            <div className="flex h-1/2">
              <button
                className="flex items-center justify-center w-1/2 px-4 py-2 m-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 active:bg-blue-700"
                onClick={() => toggleCam()}>
                {playing ? "Stop" : "Start"}{" "}
              </button>
              <button
                className="w-1/2 px-4 py-2 m-2 bg-yellow-500 rounded-md hover:bg-yellow-600 active:bg-yellow-700"
                onClick={capturePhoto}>
                Capture{" "}
              </button>
            </div>
            <div className="flex h-1/2">
              <button
                className="w-full px-4 py-2 m-2 bg-red-500 rounded-md hover:bg-red-600 active:bg-red-700"
                onClick={recordStream}>
                Record
              </button>
            </div>
          </div>
          <div className="w-3/5 py-2">
            <div className="flex items-center space-x-2 h-[20%]">
              <div className="text-[1.25rem]">Connected Devices</div>
              <RefreshConnectDevices
                className="w-5 h-5 p-[0.15rem] bg-white rounded-full cursor-pointer hover:bg-slate-600"
                onClick={handleRefreshClick}
              />
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
