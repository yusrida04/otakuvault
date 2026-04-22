import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-gray-500 text-sm font-body">
        <p>
          <span className="text-gradient font-semibold">OtakuVault</span> — Track Your Anime, Manhwa & Games 🎮
        </p>
      </footer>
    </div>
  );
}
