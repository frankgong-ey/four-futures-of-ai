export default function Home() {
  console.log('ROOT PAGE RENDERED');
  return (
    <main className="min-h-screen w-screen grid place-content-center bg-black text-white p-8">
      <div className="max-w-[960px] text-center">
        <h1 className="text-4xl md:text-6xl font-light mb-6">Four Futures of AI</h1>
        <p className="opacity-80 mb-8">An immersive, scroll-driven exhibit built with WebGL.</p>
        <a className="underline opacity-90 hover:opacity-100" href="/home">Enter Chapter I →</a>
      </div>
    </main>
  );
}


