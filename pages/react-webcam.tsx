import { MouseEventHandler, useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import RefreshConnectDevices from "asset/icons/RefreshIcon"
import Image from "next/image"
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
  const [selectedDevice, setSelectedDevice] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)

  const webcamRef = useRef<Webcam | null>(null)

  // 스트림할 디바이스 선택
  const getUserMedia = async (constraints?: MediaStreamConstraints) => {
    console.log("1")
    await navigator.mediaDevices.getUserMedia(constraints).then(mediaStream => {
      console.log("midiaStream", mediaStream)
      if (webcamRef.current?.video) {
        webcamRef.current.video.srcObject = mediaStream
      }

      const videoTrack = mediaStream.getVideoTracks()[0]

      console.log("videoTrack", videoTrack)
    })
  }

  // const videoConstraints = {
  //   size: { width: 1024, height: 768 },
  //   deviceSet: {
  //     audio: false,
  //     video: { deviceId: { exact: "b7ffddb260b02dcccf3e46249a3ad2318685441b12963022e31a8c26c019e3c4" } },
  //   },
  // }

  const videoConstraints = {
    width: 1280,
    height: 720,
  }

  const toggleCam = (): void => {
    if (playing) {
      const cam = webcamRef.current?.video

      if (cam && cam.srcObject) {
        const stream = cam.srcObject as MediaStream
        stream.getTracks().forEach(track => {
          track.stop()
        })
        setPlaying(!playing)
      }
    } else {
      getUserMedia(videoConstraints)
      setPlaying(!playing)
    }
  }

  const capturePhoto = useCallback(() => {
    setIsProcessing(true)
    console.log("1")

    const cam = webcamRef.current?.video
    const stream = cam?.srcObject as MediaStream

    console.log(stream)

    const imageSrc = webcamRef.current?.getScreenshot()
    const currentTime = getCurrentDateTime()

    const newPicInfo = {
      name: currentTime,
      imgSrc: imageSrc,
    }
    setCapturedFiles(prev => [...prev, newPicInfo])
  }, [])

  const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    setDevices([...mediaDevices])
  }, [])

  const recordStream = () => {}

  const handleRefreshClick: MouseEventHandler<SVGElement> = () => {
    navigator.mediaDevices.enumerateDevices().then(devices => handleDevices(devices))
  }
  // 연결되어있는 디바이스 리스트
  const mediaDevices = () => {
    return navigator.mediaDevices.enumerateDevices()
  }

  useInterval(() => {
    mediaDevices().then(devices => {
      console.log("devices", devices)
      setDevices(devices)
    })
  }, 3000)

  return (
    <>
      <div className="flex flex-col items-center w-screen h-screen">
        <Webcam width={1280} ref={webcamRef} videoConstraints={videoConstraints} audio={false} screenshotFormat="image/jpeg" />

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
                Capture
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
            <div className="flex items-center space-x-2">
              <div className="text-[1.25rem]">Connected Devices</div>
              <RefreshConnectDevices
                className="w-5 h-5 p-[0.15rem] bg-white rounded-full cursor-pointer hover:bg-slate-600"
                onClick={handleRefreshClick}
              />
            </div>

            <ul className="pl-2 mt-2">
              {devices.map((device, key) => (
                <li key={key}>{device.label || `Device ${key + 1}`}</li>
              ))}
            </ul>
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
