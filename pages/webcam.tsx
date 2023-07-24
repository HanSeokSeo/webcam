import { useEffect, useRef, useState } from "react"
import { Button } from "reactstrap"

function WebCam() {
  const [playing, setPlaying] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const getWebcam = (callback: (stream: MediaStream) => void): void => {
    try {
      const constraints: MediaStreamConstraints = {
        video: true,
        audio: false,
      }
      navigator.mediaDevices.getUserMedia(constraints).then(callback)
    } catch (err) {
      console.log(err)
      return undefined
    }
  }

  const Styles = {
    Video: { width: "100%", height: "100%", background: "rgba(245, 240, 215, 0.5)" },
    None: { display: "none" },
  }

  useEffect(() => {
    getWebcam((stream: MediaStream) => {
      setPlaying(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    })
  }, [])

  const startOrStop = (): void => {
    if (playing) {
      const cam: MediaStream | null | undefined = videoRef.current?.srcObject as MediaStream | null | undefined

      if (cam) {
        cam.getTracks().forEach(track => {
          track.stop()
        })
      }
    } else {
      getWebcam((stream: MediaStream) => {
        setPlaying(true)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
    }
    setPlaying(!playing)
  }

  return (
    <>
      <div className="w-screen h-screen p-12">
        <video ref={videoRef} autoPlay style={Styles.Video} />
        <Button color="warning" onClick={() => startOrStop()}>
          {playing ? "Stop" : "Start"}{" "}
        </Button>
      </div>
    </>
  )
}

export default WebCam
