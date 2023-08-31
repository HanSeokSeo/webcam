import Image from "next/legacy/image"
interface CapturedPhotos {
  name: string
  imgSrc: string
}

function ImageList({
  capturedPhotos,
  showClickedImage,
}: {
  capturedPhotos: CapturedPhotos[]
  showClickedImage: (src: string) => void
}) {
  const reversedPhotos = [...capturedPhotos].reverse()

  return (
    <div className="flex flex-col overflow-y-scroll scrollbar-thin border-slate-500 border-l-2 border-y-2 h-screen w-[25%]">
      {reversedPhotos.map((photo, idx) => {
        if (photo && photo.imgSrc != null && photo.imgSrc != undefined) {
          return (
            <div className="flex flex-col border-slate-500 border-b-2 p-2" key={idx}>
              <Image
                src={photo.imgSrc}
                alt="Captured"
                width={400}
                height={300}
                onClick={() => showClickedImage(photo.imgSrc)}
              />
              <div className="m-1">{photo.name}</div>
            </div>
          )
        }
      })}
    </div>
  )
}

export default ImageList
