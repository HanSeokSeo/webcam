import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Webcam from "react-webcam"
import Image from "next/legacy/image"
import { useInterval } from "usehooks-ts"
import debounce, { getAgentSystem, getCurrentDateTime, startStream, stopStream, trimTextToLength } from "utils"
import { useDidMountEffect } from "utils"

import ImageListContainer from "@/components/ImageListContainer"
import ViewerController from "@/components/ViewerController"

interface CapturedFile {
  name: string
  imgSrc: string | null | undefined
}

interface ConnectedDeviceInfo {
  deviceInfo: MediaDeviceInfo
  checked: boolean
}

function Cams() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [capturedFiles, setCapturedFiles] = useState<CapturedFile[]>([])

  const [deviceList, setDeviceList] = useState<ConnectedDeviceInfo[]>([]) // 현재 연결된 기기 목록
  const [selectedDeviceId, setSeletedDeviceId] = useState<string | undefined>(undefined) // 현재 체크된 기기 아아디
  const [previousDeviceId, setPreviousDeviceId] = useState<string | undefined>(undefined) // 바로 직전에 체크되었던 기기 아이디

  const [isDeviceChecked, setIsDeviceChecked] = useState<boolean>(false)
  const [platform, setPlatform] = useState<string>("unknown")

  const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined)

  const [isQrayDeviceStreamOn, setIsQrayDeviceStreamOn] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // 연결된 기기를 통해 들어오는 stream 가져오기
  async function getDeviceStream(checkedDeviceId: string | undefined) {
    try {
      await navigator.mediaDevices
        .getUserMedia({
          video: { deviceId: { exact: checkedDeviceId } },
        })
        .then((stream) => {
          startStream(videoRef, stream) // stream을 video tag에 연결
          setLocalStream(stream)
          setIsQrayDeviceStreamOn(true)
        })
    } catch (error) {
      setIsDeviceChecked(false)
      setIsQrayDeviceStreamOn(false)
      console.log("error in mediaStream", error)
    }
  }

  // 기기의 체크 상태에 따른 각종 상태값 변경
  function handleCheckboxChange(changedDeviceId: string) {
    const upDatedDeviceList: ConnectedDeviceInfo[] = []

    // 중복으로 체크 버튼 누른 경우 체크 해제
    if (changedDeviceId === selectedDeviceId) {
      deviceList.forEach((device) => {
        const newElement = { deviceInfo: device.deviceInfo, checked: false }
        upDatedDeviceList.push(newElement)
      })

      stopStream(videoRef, changedDeviceId)
      setIsQrayDeviceStreamOn(false)
      setSeletedDeviceId(undefined)
    } else {
      // 다른 기기를 체크했을 경우 기존의 stream을 끊고 새로운 기기의 stream 가져오기
      stopStream(videoRef, selectedDeviceId)
      getDeviceStream(changedDeviceId)

      deviceList.forEach((device) => {
        const checkedValue = device.deviceInfo.deviceId === changedDeviceId ? true : false
        const newElement = {
          deviceInfo: device.deviceInfo,
          checked: checkedValue,
        }
        upDatedDeviceList.push(newElement)
      })
      setSeletedDeviceId(changedDeviceId)
    }

    if (selectedDeviceId === undefined) {
      setIsDeviceChecked(true)
      console.log(`"Checked Device"`)
    } else {
      setIsDeviceChecked(false)
      console.log(`"Unchecked Device"`)
    }
    setPreviousDeviceId(selectedDeviceId === undefined ? undefined : selectedDeviceId)
    setDeviceList(upDatedDeviceList)
  }

  // 컴에 연결된 기기 중에서 선택한 기기 확인
  async function getConnectedDevices() {
    const newDeviceList: ConnectedDeviceInfo[] = []

    try {
      await navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices.forEach((deviceInfo) => {
          const checkedValue = deviceInfo.deviceId === selectedDeviceId ? true : false
          if (deviceInfo.kind === "videoinput") {
            const newElement = { deviceInfo, checked: checkedValue }
            newDeviceList.push(newElement)
          }
        })
      })
      setDeviceList(newDeviceList)
    } catch (error) {
      console.log("Error in enumerateDevices : ", error)
    }
  }

  function checkDeviceStream() {
    if (localStream != undefined) {
      const { active } = localStream
      const { muted } = localStream.getVideoTracks()[0]

      console.log(localStream)
      console.log(localStream.getVideoTracks()[0])
      console.log(`os: ${platform}, isMuted: ${localStream.getVideoTracks()[0].muted}, active: ${localStream.active}`)

      switch (platform) {
        case "windows":
          if (!muted && !isQrayDeviceStreamOn) {
            console.log("스트림 최초 체크인 for windows")
            setIsDeviceChecked(true)
          } else if (!muted && isQrayDeviceStreamOn) {
            console.log("스트림 체크인 for windows")
          } else if (muted && active) {
            console.log("스트림 체크인 for windows")
          } else {
            console.log("스트림 체크아웃 for windows")
            setIsDeviceChecked(false)
          }
          break
        case "macos":
          if (active && !isQrayDeviceStreamOn) {
            console.log("스트림 최초 체크인 for mac")
            setIsDeviceChecked(true)
          } else if (active && isQrayDeviceStreamOn) {
            console.log("스트림 체크인 for mac")
          } else {
            console.log("스트림 체크아웃 for mac")
            stopStream(videoRef, selectedDeviceId)
            setIsQrayDeviceStreamOn(false)
            setIsDeviceChecked(false)
          }
          break
        default:
          console.log("unknown os")
      }
    }
  }

  useInterval(() => {
    setCount((count) => count + 1)
    console.log(count)
    console.log(deviceList)

    if (selectedDeviceId) {
      isQrayDeviceStreamOn ? checkDeviceStream() : getDeviceStream(selectedDeviceId)
    } else {
      getConnectedDevices()
    }
  }, 2000)

  // 최초 실행시 카메라 허용과 OS 탐지
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })

    const detectedPlatform = getAgentSystem()
    if (detectedPlatform) {
      setPlatform(detectedPlatform)
      getConnectedDevices()
    }
  }, [])

  return (
    <>
      <div className="flex justify-center w-full h-full">
        <ImageListContainer capturedFiles={capturedFiles} />
        <div className="border-2 border-red-500 w-[75%]">
          <div className="flex items-center justify-center w-full border-2 border-blue-500 h-96 relative">
            <div className="ml-3 mt-3 absolute top-0 left-0">QrayStream {isQrayDeviceStreamOn ? "ON" : "OFF"}</div>
            <video autoPlay ref={videoRef} muted className={`h-full ${isQrayDeviceStreamOn ? "" : "hidden"}`} />
            <div
              className={`flex flex-col items-center justify-center text-2xl ${isQrayDeviceStreamOn ? "hidden" : ""}`}
            >
              <p>Qray device is not connected.</p>
              <p>After connecting the cables and turn on the power.</p>

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
          </div>
          <ViewerController isPlaying={isPlaying} deviceList={deviceList} handleCheckboxChange={handleCheckboxChange} />
        </div>
      </div>
    </>
  )
}

export default Cams
