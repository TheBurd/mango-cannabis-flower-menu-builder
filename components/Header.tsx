
import React from 'react';
import { SupportedStates } from '../types';
import { MANGO_MAIN_ORANGE, MANGO_SUPPORT_ORANGE } from '../constants';
import { Select } from './common/Select';

interface HeaderProps {
  appName: string;
  currentOklahomaState: SupportedStates;
  onStateChange: (newState: SupportedStates) => void;
}

export const Header: React.FC<HeaderProps> = ({ appName, currentOklahomaState, onStateChange }) => {
  const stateOptions = Object.values(SupportedStates).map(s => ({ value: s, label: s }));

  return (
    <header 
        className="no-print p-4 flex justify-between items-center text-white shadow-lg"
        style={{ background: `linear-gradient(90deg, ${MANGO_MAIN_ORANGE}, ${MANGO_SUPPORT_ORANGE})`}}
    >
      <h1 className="text-3xl font-bold tracking-tight" style={{fontFamily: "'Poppins', sans-serif"}}>{appName}</h1>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Region:</span>
        <Select
            options={stateOptions}
            value={currentOklahomaState}
            onChange={(e) => onStateChange(e.target.value as SupportedStates)}
            className="bg-white/20 text-white border-white/30 rounded-md shadow-sm focus:ring-white focus:border-white"
            itemClassName="text-gray-700 hover:bg-orange-100"
         />
      </div>
    </header>
  );
};
