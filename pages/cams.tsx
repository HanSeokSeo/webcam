import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Webcam from "react-webcam"
import Image from "next/legacy/image"
import { useInterval } from "usehooks-ts"
import debounce, { getAgentSystem, getCurrentDateTime, startStream, stopStream, trimTextToLength } from "utils"
import { useDidMountEffect } from "utils"

import ImageListContainer from "@/components/ImageList"
import Viewer from "@/components/Viewer"
import ViewerController from "@/components/ViewerController"
import StatusDisplay from "@/components/ViewerStatus"

interface CapturedPhotos {
  name: string
  imgSrc: string | null | undefined
}

interface ConnectedDeviceInfo {
  deviceInfo: MediaDeviceInfo
  checked: boolean
}

function Cams() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhotos[]>([])

  const [deviceList, setDeviceList] = useState<ConnectedDeviceInfo[]>([]) // 현재 연결된 기기 목록
  const [selectedDeviceId, setSeletedDeviceId] = useState<string | undefined>(undefined) // 현재 체크된 기기 아아디
  const [previousDeviceId, setPreviousDeviceId] = useState<string | undefined>(undefined) // 바로 직전에 체크되었던 기기 아이디

  const [isDeviceChecked, setIsDeviceChecked] = useState<boolean>(false)

  const [platform, setPlatform] = useState<string>("unknown")

  const [isNeededCheckingStream, setIsNeededCheckingStream] = useState<boolean>(false)

  const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined)

  const [isQrayDeviceStreamOn, setIsQrayDeviceStreamOn] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)
  const [checkCase, setCheckCase] = useState<string | undefined>(undefined)

  const [isMuted, setIsMuted] = useState<boolean | string>("undefined")
  const [isActive, setIsActive] = useState<boolean | string>("undefined")

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // 연결된 기기를 통해 들어오는 stream 가져오기
  const getDeviceStream = async (checkedDeviceId: string | undefined, platform: string) => {
    try {
      await navigator.mediaDevices
        .getUserMedia({
          video: { deviceId: { exact: checkedDeviceId } },
        })
        .then((stream) => {
          if (stream !== undefined) {
            if (platform === "Windows") {
              const { muted } = stream.getVideoTracks()[0]

              if (!muted) {
                startStream(videoRef, stream) // stream을 video tag에 연결
                setLocalStream(stream)
                setIsQrayDeviceStreamOn(true)
              } else {
                setIsQrayDeviceStreamOn(false)
              }
            } else if (platform === "macOS") {
              const { active } = stream

              if (active) {
                startStream(videoRef, stream) // stream을 video tag에 연결
                setLocalStream(stream)
                setIsQrayDeviceStreamOn(true)
              } else {
                setIsQrayDeviceStreamOn(false)
              }
            }
          }
        })
    } catch (error) {
      console.log("error in mediaStream", error)
    }
  }

  // 기기의 체크 상태에 따른 각종 상태값 변경
  const handleCheckboxChange = (changedDeviceId: string) => {
    const upDatedDeviceList: ConnectedDeviceInfo[] = []

    // case: initial, 최초로 체크 버튼을 눌렀을 경우
    if (selectedDeviceId === undefined) {
      deviceList.forEach((device) => {
        const checkedValue = device.deviceInfo.deviceId === changedDeviceId ? true : false
        const newElement = {
          deviceInfo: device.deviceInfo,
          checked: checkedValue,
        }
        upDatedDeviceList.push(newElement)
      })
      setCheckCase("initial")
      setSeletedDeviceId(changedDeviceId)
      setIsDeviceChecked(true)
      console.log("Initial Check")
    } else if (changedDeviceId !== selectedDeviceId) {
      // 체크가 되어 있는 상태에서 다른 기기를 체크한 경우
      deviceList.forEach((device) => {
        const checkedValue = device.deviceInfo.deviceId === changedDeviceId ? true : false
        const newElement = {
          deviceInfo: device.deviceInfo,
          checked: checkedValue,
        }
        upDatedDeviceList.push(newElement)
      })
      setCheckCase("single")
      setSeletedDeviceId(changedDeviceId)
      setIsDeviceChecked(true)
      console.log("Sigle Check")
    } else {
      // 중복으로 체크 버튼 누른 경우 체크 해제
      deviceList.forEach((device) => {
        const newElement = { deviceInfo: device.deviceInfo, checked: false }
        upDatedDeviceList.push(newElement)
      })
      setCheckCase("double")
      setSeletedDeviceId(undefined)
      setIsDeviceChecked(false)
      setIsMuted("undefined")
      setIsActive("undefined")
      console.log("Double Check")
    }

    setPreviousDeviceId(selectedDeviceId === undefined ? undefined : selectedDeviceId)
    setDeviceList(upDatedDeviceList)
    setLocalStream(undefined)
    setIsNeededCheckingStream(!isNeededCheckingStream)
  }

  // 컴에 연결된 기기 중에서 선택한 기기 확인
  const getConnectedDevices = async () => {
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

  // useInterval 중 기기의 스트림 체크하기
  const checkDeviceStream = (localStream: MediaStream | undefined) => {
    if (localStream != undefined) {
      const { active } = localStream
      const { muted } = localStream.getVideoTracks()[0]
      setIsMuted(typeof muted === "boolean" ? muted : "undefined")
      setIsActive(typeof active === "boolean" ? active : "undefined")

      console.log(localStream)
      console.log(localStream.getVideoTracks()[0])
      console.log(`os: ${platform}, isMuted: ${localStream.getVideoTracks()[0].muted}, active: ${localStream.active}`)

      switch (platform) {
        case "Windows":
          if (!muted && !isQrayDeviceStreamOn) {
            console.log("스트림 최초 체크인 for windows")
            setIsDeviceChecked(true)
          } else if (!muted && isQrayDeviceStreamOn) {
            console.log("스트림 체크인 for windows")
          } else {
            console.log("스트림 체크아웃 for windows")
            stopStream(videoRef, selectedDeviceId)
            setIsQrayDeviceStreamOn(false)
            setLocalStream(undefined)
          }
          break
        case "macOS":
          if (active && !isQrayDeviceStreamOn) {
            setIsQrayDeviceStreamOn(true)
            console.log("스트림 최초 체크인 for mac")
          } else if (active && isQrayDeviceStreamOn) {
            console.log("스트림 체크인 for mac")
          } else {
            console.log("스트림 체크아웃 for mac")
            stopStream(videoRef, selectedDeviceId)
            setIsQrayDeviceStreamOn(false)
            setLocalStream(undefined)
          }
          break
        default:
          console.log("Linux or unknown os")
      }
    }
  }

  const capturePhoto = useCallback((refAttr: React.RefObject<HTMLButtonElement>) => {
    refAttr.blur()

    const cam = videoRef.current

    if (cam && cam.srcObject) {
      const stream = cam.srcObject as MediaStream
      const canvas = document.createElement("canvas")
      canvas.width = cam.videoWidth
      canvas.height = cam.videoHeight

      const ctx = canvas.getContext("2d")

      if (ctx) {
        ctx.drawImage(cam, 0, 0, cam.videoWidth, cam.videoHeight)

        const imageSrc = canvas.toDataURL()
        const currentTime = getCurrentDateTime()
        const newPhotoInfo = {
          name: currentTime,
          imgSrc: imageSrc,
        }

        setCapturedPhotos((prev) => [...prev, newPhotoInfo])
      }
    }
  }, [])

  useInterval(() => {
    setCount((count) => count + 1)
    console.log(count)
    console.log(deviceList)
    console.log("localStream:", localStream)
    console.log(`isNeededCheckingStream: ${isNeededCheckingStream}`)
    console.log(`isDeviceChecked: ${isDeviceChecked}, checkCase: ${checkCase}`)
    console.log(`selectedDeviceId: ${trimTextToLength(selectedDeviceId, 30)}`)
    console.log(`previouseDeviceId: ${trimTextToLength(previousDeviceId, 30)}`)
    getConnectedDevices()

    if (isNeededCheckingStream) {
      localStream === undefined ? getDeviceStream(selectedDeviceId, platform) : checkDeviceStream(localStream)
    } else {
      if (isDeviceChecked) {
        switch (checkCase) {
          case "initial":
            console.log("1")
            getDeviceStream(selectedDeviceId, platform)
            break
          case "single":
            console.log("2")
            stopStream(videoRef, previousDeviceId)
            getDeviceStream(selectedDeviceId, platform)
        }
        setIsNeededCheckingStream(true)
      } else {
        setIsQrayDeviceStreamOn(false)
      }
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

    window.addEventListener("keydown", capturePhoto, true)
  }, [])

  return (
    <>
      <div className="flex justify-center w-full h-full">
        <ImageListContainer capturedPhotos={capturedPhotos} />
        <div className="w-[75%]">
          <div className="flex h-4/5 border-slate-500 border-2">
            <StatusDisplay
              count={count}
              platform={platform}
              isDeviceChecked={isDeviceChecked}
              isQrayDeviceStreamOn={isQrayDeviceStreamOn}
              isMuted={isMuted}
              isActive={isActive}
            />
            <Viewer videoRef={videoRef} isQrayDeviceStreamOn={isQrayDeviceStreamOn} />
          </div>
          <ViewerController
            isPlaying={isPlaying}
            deviceList={deviceList}
            handleCheckboxChange={handleCheckboxChange}
            capturePhoto={capturePhoto}
          />
        </div>
      </div>
    </>
  )
}

export default Cams
