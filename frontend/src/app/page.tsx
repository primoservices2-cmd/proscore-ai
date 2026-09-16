import Link from 'next/link';
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-6xl font-black mb-4">Pro<span className="text-neon-green">Score</span> AI</h1>
      <p className="text-xl text-slate-400 mb-8 max-w-xl">Pronostics sportifs haute précision générés par intelligence artificielle.</p>
      <div className="flex gap-4">
        <Link href="/dashboard" className="px-8 py-4 bg-neon-green text-dark-900 font-bold rounded-xl">Voir les Pronostics</Link>
        <Link href="/subscribe" className="px-8 py-4 border border-slate-700 rounded-xl">S'abonner</Link>
      </div>
    </div>
  );
}
