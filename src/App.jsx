import React, { useState, useEffect } from 'react';
import AtrExercise from './exercises/AtrExercise';
import AdminPanel from './pages/AdminPanel';
import { useAmbientAudio } from './components/Shared';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  // Listener simples para mudanças de rota se necessário (embora o reload já resolva)
  useEffect(() => {
    const handleLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const params = new URLSearchParams(window.location.search);
  const emailDaUrl = params.get('email') || '';

  const { playing, toggle: toggleAudio, start: startAudio } = useAmbientAudio();

  // Props compartilhadas
  const sharedProps = { emailDaUrl, playing, toggleAudio, startAudio };

  if (path === '/admin') {
    return <AdminPanel />;
  }

  return <AtrExercise {...sharedProps} />;
}
