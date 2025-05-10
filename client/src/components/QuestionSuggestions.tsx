import React from 'react';
import { useI18n } from '../i18n/I18nContext';

interface QuestionSuggestionsProps {
  onSelectQuestion: (question: string) => void;
}

const QuestionSuggestions: React.FC<QuestionSuggestionsProps> = ({ onSelectQuestion }) => {
  const { t } = useI18n();

  const questions = [
    t('chat.suggestions.questions.0'),
    t('chat.suggestions.questions.1'),
    t('chat.suggestions.questions.2'),
  ];

  return (
    <div className="w-full max-w-lg mb-8">
      <h3 className="text-sm text-gray-400 mb-3 text-center">{t('chat.suggestions.title')}</h3>
      <div className="flex flex-col gap-2">
        {questions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(suggestion)}
            className="text-left px-4 py-3 rounded-xl bg-[#1f2d36] border border-[#2a3b47] text-white hover:bg-[#2C3E50] transition-colors duration-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionSuggestions;
