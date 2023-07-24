import Link from "next/link"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 ">
      <Link href="/webcam">webcam</Link>
      <Link href="/react-webcam">react-webcam</Link>
      <Link href="/qraycam">qraycam</Link>
    </main>
  )
}
