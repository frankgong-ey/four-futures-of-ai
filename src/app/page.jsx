export default function Home() {
  return (
    <main className="min-h-screen w-screen grid place-content-center bg-black text-white">
      <a 
        href="/vb"
        className="px-12 py-6 text-2xl md:text-4xl font-normal border border-white/50 hover:bg-white/10 hover:border-white/70 transition-all cursor-pointer"
        style={{
          fontFamily: 'var(--font-eyinterstate)',
          borderRadius: 0,
          backgroundColor: 'transparent',
        }}
      >
        Explore Value Blueprints
      </a>
    </main>
  );
}


