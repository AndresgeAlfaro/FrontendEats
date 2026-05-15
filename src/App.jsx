import { useEffect, useState } from 'react';
import CletaApp from './cleta/CletaApp';
import LegacyDotnetApp from './LegacyDotnetApp';

function routingMode() {
  const raw = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (!raw || raw === '/') return 'supabase';
  if (raw === 'dotnet' || raw === 'api-local' || raw === 'sqlite') return 'dotnet';
  return 'supabase';
}

export default function App() {
  const [mode, setMode] = useState(routingMode);

  useEffect(() => {
    const onHash = () => setMode(routingMode());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (mode === 'dotnet') {
    return <LegacyDotnetApp />;
  }

  return (
    <div className="position-relative min-vh-100">
      <CletaApp />
      <div
        className="position-fixed bottom-0 end-0 px-2 py-1 small rounded-top shadow-sm bg-white bg-opacity-75 border border-bottom-0"
        style={{ zIndex: 1040 }}
      >
        <a href="#dotnet" className="link-secondary text-decoration-none">
          Consola API .NET (SQLite)
        </a>
      </div>
    </div>
  );
}
