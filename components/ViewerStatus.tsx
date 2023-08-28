function StatusDisplay({
  count,
  platform,
  isDeviceChecked,
  isQrayDeviceStreamOn,
  isMuted,
  isActive,
}: {
  count: number
  platform: string
  isDeviceChecked: boolean
  isQrayDeviceStreamOn: boolean
  isMuted: boolean | string
  isActive: boolean | string
}) {
  return (
    <div className="w-1/5 p-2">
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
          MUTED: {typeof isMuted === "boolean" ? (isMuted ? "TRUE" : "FLASE") : "undefined"}
        </li>
        <li className="list-none list-inside indent-1.5 before:content-['•'] before:text-lg before:pr-1">
          ACTIVE: {typeof isActive === "boolean" ? (isActive ? "TRUE" : "FLASE") : "undefined"}
        </li>
      </ul>
    </div>
  )
}

export default StatusDisplay
