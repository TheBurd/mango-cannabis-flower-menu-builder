import React from 'react';
import { SupportedStates, Theme } from '../types';
import { STATE_THC_ICONS } from '../constants';

interface WelcomeModalProps {
  isOpen: boolean;
  onStateSelect: (state: SupportedStates) => void;
  onClose: () => void;
  theme: Theme;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onStateSelect, onClose, theme }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleStateSelect = (state: SupportedStates) => {
    onStateSelect(state);
  };

  const stateOptions = [
    {
      state: SupportedStates.OKLAHOMA,
      description: "Rectangular THC symbol with red border. Features comprehensive pricing tiers from Superior to Value.",
      features: ["Superior Shelf is $15 in this state", "Multiple shake shelves", "Red rectangular THC compliance symbol"]
    },
    {
      state: SupportedStates.MICHIGAN,
      description: "Green THC triangle symbol. Features premium flower options with competitive pricing structure.",
      features: ["Superior Shelf is $6 in this state", "Only one Shake shelf - Legendary", "Green triangular THC compliance symbol"]
    },
    {
      state: SupportedStates.NEW_MEXICO,
      description: "Red THC diamond symbol. Features streamlined pricing with focused shelf configurations.",
      features: ["Only one shake shelf - Unnamed", "Red diamond THC compliance symbol"]
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={`max-w-4xl w-full max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🥭 Welcome to Flower Menu Builder!</h1>
              <p className="text-orange-100 text-lg">Let's get started by selecting your state's bulk flower tiers</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close welcome modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Choose Your State</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              This will set up the appropriate shelf configurations, pricing tiers, and compliance symbols for your location.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {stateOptions.map(({ state, description, features }) => (
              <div
                key={state}
                className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col h-full ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 hover:border-orange-400' 
                    : 'border-gray-200 bg-gray-50 hover:border-orange-400'
                }`}
                onClick={() => handleStateSelect(state)}
              >
                <div className="text-center mb-4">
                  <img 
                    src={STATE_THC_ICONS[state]} 
                    alt={`${state} THC Icon`}
                    className="w-16 h-16 mx-auto mb-3"
                  />
                  <h3 className="text-lg font-bold text-orange-500">{state}</h3>
                </div>
                
                <p className={`text-sm mb-4 leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {description}
                </p>
                
                <ul className="space-y-1 flex-grow">
                  {features.map((feature, index) => (
                    <li key={index} className={`text-xs flex items-start ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span className="text-orange-500 mr-2 mt-0.5">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleStateSelect(state)}
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Select {state}
                </button>
              </div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                  Don't worry, you can change this later!
                </h4>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
                  You can switch states anytime from the header dropdown. The app will remember your choice for future sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-between items-center ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="text-sm text-gray-500">
                          🥭 Mango Cannabis Flower Menu Builder v1.1.0
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}; 