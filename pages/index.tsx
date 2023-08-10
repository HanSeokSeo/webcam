import Link from "next/link"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 ">
      <Link href="/qraycam" className="text-3xl">
        qraycam
      </Link>
      {/* <Link href="/react-webcam">react-webcam</Link> */}
    </main>
  )
}
