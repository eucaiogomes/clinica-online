import React from 'react';
import AtrExercise from './exercises/AtrExercise';
import ProblemSolvingExercise from './exercises/ProblemSolvingExercise';
import SocraticExercise from './exercises/SocraticExercise';
import RelaxationExercise from './exercises/RelaxationExercise';
import { useAmbientAudio } from './components/Shared';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const emailDaUrl = params.get('email') || '';
  const exercicioDaUrl = params.get('exercicio') || 'rpd'; // default

  const { playing, toggle: toggleAudio, start: startAudio } = useAmbientAudio();

  // Props compartilhadas
  const sharedProps = { emailDaUrl, playing, toggleAudio, startAudio };

  // Router simples
  switch (exercicioDaUrl.toLowerCase()) {
    case 'resolucao':
      return <ProblemSolvingExercise {...sharedProps} />;
    case 'socratico':
      return <SocraticExercise {...sharedProps} />;
    case 'respiracao':
      return <RelaxationExercise {...sharedProps} />;
    case 'rpd':
    case 'atr':
    default:
      return <AtrExercise {...sharedProps} />;
  }
}
