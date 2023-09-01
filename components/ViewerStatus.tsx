function ViewerStatus({
  count,
  platform,
  isDeviceChecked,
  isQrayDeviceStreamOn,
  isMuted,
  isActive,
  isCaptureMode,
  setIsCaptureMode,
  setIsNeededCheckingStream,
}: {
  count: number
  platform: string
  isDeviceChecked: boolean
  isQrayDeviceStreamOn: boolean
  isMuted: boolean | string
  isActive: boolean | string
  isCaptureMode: boolean
  setIsCaptureMode: React.Dispatch<React.SetStateAction<boolean>>
  setIsNeededCheckingStream: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const backToCaptureMode = () => {
    setIsCaptureMode(true)
  }
  return (
    <div className="flex-col w-1/5 p-2 justify-between flex">
      <div className="">
        <div className="text-xl my-1">DEVICE STATUS</div>
        <ul>
          <li className="list-none list-inside indent-1.5 before:content-['•'] before:text-lg before:pr-1">
            COUNT : {count}
          </li>
          <li className="list-none list-inside indent-1.5 before:content-['•'] before:text-lg before:pr-1">
            PLATFORM : {platform}
          </li>
          <li className="list-none list-inside indent-1.5 before:content-['•'] before:text-lg before:pr-1">
            DEVICE_CHECK : {isDeviceChecked ? "ON" : "OFF"}
          </li>
          <li className="list-none list-inside indent-1.5 before:content-['•'] before:text-lg before:pr-1">
            QRAY_STREAM : {isQrayDeviceStreamOn ? "ON" : "OFF"}
          </li>
          <li className="list-none list-inside indent-1.5 before:content-['•'] before:text-lg before:pr-1">
            MUTED: {typeof isMuted === "boolean" ? (isMuted ? "TRUE" : "FALSE") : "undefined"}
          </li>
          <li className="list-none list-inside indent-1.5 before:content-['•'] before:text-lg before:pr-1">
            ACTIVE: {typeof isActive === "boolean" ? (isActive ? "TRUE" : "FALSE") : "undefined"}
          </li>
        </ul>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <div className="mr-2 text-lg font-bold">{isCaptureMode ? "Capture Mode" : "View Mode"}</div>
        <div>
          <button
            className={`${
              isCaptureMode ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700"
            } text-white font-bold py-1 px-2 rounded text-sm`}
            onClick={backToCaptureMode}
            disabled={isCaptureMode}
          >
            Back to Capture mode
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewerStatus
