// app/page.tsx
import ConnectButton from "@/components/ConnectButton";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-4">
      <ConnectButton />
    </main>
  );
}
