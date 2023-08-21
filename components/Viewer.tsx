import React from "react"
import Image from "next/legacy/image"

interface ViewerProps {
  videoRef: React.RefObject<HTMLVideoElement>
  isQrayDeviceStreamOn: boolean
}

function Viewer({ videoRef, isQrayDeviceStreamOn }: ViewerProps) {
  return (
    <div className="flex items-center justify-center w-full border-2 border-blue-500 relative">
      <div className="ml-3 mt-3 absolute top-0 left-0">QrayStream {isQrayDeviceStreamOn ? "ON" : "OFF"}</div>
      <video autoPlay ref={videoRef} muted className={`h-full ${isQrayDeviceStreamOn ? "" : "hidden"}`} />
      <div className={`flex flex-col items-center justify-center text-2xl ${isQrayDeviceStreamOn ? "hidden" : ""}`}>
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
  )
}

export default Viewer
