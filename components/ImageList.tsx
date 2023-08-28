import Image from "next/legacy/image"
interface CapturedPhotos {
  name: string
  imgSrc: string | null | undefined
}

function CaptureListContainer({ capturedPhotos }: { capturedPhotos: CapturedPhotos[] }) {
  return (
    <div className="flex flex-col overflow-y-auto border-2 border-red-500 h-screen w-[25%]">
      {capturedPhotos.map((photo, idx) => {
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
  )
}

export default CaptureListContainer
