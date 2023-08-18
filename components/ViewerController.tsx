import RefreshConnectDevices from "public/asset/icons/RefreshIcon"

interface ConnectedDeviceInfo {
  deviceInfo: MediaDeviceInfo
  checked: boolean
}

function ViewerController({
  isPlaying,
  deviceList,
  handleCheckboxChange,
}: {
  isPlaying: boolean
  deviceList: ConnectedDeviceInfo[]
  handleCheckboxChange: any
}) {
  return (
    <div className="flex w-full h-40 min-w-7xl ">
      <div className="flex flex-col w-2/5">
        <div className="flex h-1/2">
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
          <div className="text-[1.25rem]">Connected Device List</div>
          <RefreshConnectDevices className="w-5 h-5 p-[0.15rem] bg-white rounded-full cursor-pointer hover:bg-slate-600" />
        </div>

        <div className="overflow-y-scroll h-[80%]">
          <ul className="pl-2 mt-2">
            {deviceList.map((device, key) => (
              <li key={key} className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={device.checked}
                  className="mr-2 w-5 h-5"
                  onChange={() =>
                    handleCheckboxChange(device.deviceInfo.deviceId)
                  }
                />
                {device.deviceInfo.label || `Device ${key + 1}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ViewerController