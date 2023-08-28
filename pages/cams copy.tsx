import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Webcam from "react-webcam"
import Image from "next/legacy/image"
import { useInterval } from "usehooks-ts"
import debounce, { getAgentSystem, getCurrentDateTime, startStream, stopStream, trimTextToLength } from "utils"
import { useDidMountEffect } from "utils"

import ImageListContainer from "@/components/ImageList"
import Viewer from "@/components/Viewer"
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
  const [isMuted, setIsMuted] = useState<boolean>(true)

  const [isNeededCheckingStream, setIsNeededCheckingStream] = useState<boolean>(false)

  const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined)

  const [isQrayDeviceStreamOn, setIsQrayDeviceStreamOn] = useState<boolean>(false)
  const [count, setCount] = useState<number>(0)
  const [checkCase, setCheckCase] = useState<string | undefined>(undefined)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // 연결된 기기를 통해 들어오는 stream 가져오기
  async function getDeviceStream(checkedDeviceId: string | undefined) {
    try {
      await navigator.mediaDevices
        .getUserMedia({
          video: { deviceId: { exact: checkedDeviceId } },
        })
        .then((stream) => {
          if (stream !== undefined) {
            const { active } = stream

            if (active) {
              startStream(videoRef, stream) // stream을 video tag에 연결
              setLocalStream(stream)
              setIsQrayDeviceStreamOn(true)
            } else {
              setIsQrayDeviceStreamOn(false)
            }
          }
        })
    } catch (error) {
      // setIsDeviceChecked(false)
      // setIsQrayDeviceStreamOn(false)
      console.log("error in mediaStream", error)
    }
  }

  // 기기의 체크 상태에 따른 각종 상태값 변경
  function handleCheckboxChange(changedDeviceId: string) {
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
      console.log("Double Check")
    }
    setPreviousDeviceId(selectedDeviceId === undefined ? undefined : selectedDeviceId)
    setDeviceList(upDatedDeviceList)
    setLocalStream(undefined)
    setIsNeededCheckingStream(!isNeededCheckingStream)
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

  function checkDeviceStream(localStream: MediaStream | undefined) {
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
          console.log("unknown os")
      }
    }
  }

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
      localStream === undefined ? getDeviceStream(selectedDeviceId) : checkDeviceStream(localStream)
    } else {
      if (isDeviceChecked) {
        switch (checkCase) {
          case "initial":
            console.log("1")
            getDeviceStream(selectedDeviceId)
            break
          case "single":
            console.log("2")
            stopStream(videoRef, previousDeviceId)
            getDeviceStream(selectedDeviceId)
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
  }, [])

  return (
    <>
      <div className="flex justify-center w-full h-full">
        <ImageListContainer capturedFiles={capturedFiles} />
        <div className="border-2 border-red-500 w-[75%]">
          <Viewer videoRef={videoRef} isQrayDeviceStreamOn={isQrayDeviceStreamOn} />
          <ViewerController isPlaying={isPlaying} deviceList={deviceList} handleCheckboxChange={handleCheckboxChange} />
        </div>
      </div>
    </>
  )
}

export default Cams