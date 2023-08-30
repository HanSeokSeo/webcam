import Link from "next/link"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 ">
      <Link href="/cams" className="text-3xl">
        cams
      </Link>
      {/* <Link href="/react-webcam">react-webcam</Link> */}
    </main>
  )
}
