
import React from 'react';
import { Icon } from './Icon';

interface CodeDisplayProps {
  language: string;
  code: string;
  isLoading: boolean;
  placeholder: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, isLoading, placeholder }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
            <Icon name="loader" className="h-10 w-10 animate-spin text-green-500 mx-auto" />
            <p className="mt-2">Generating code...</p>
        </div>
      </div>
    );
  }

  if (!code) {
    return (
        <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
                <Icon name="code" className="h-12 w-12 mx-auto" />
                <p className="mt-2">{placeholder}</p>
            </div>
        </div>
    );
  }

  return (
    <pre className="w-full h-full overflow-auto bg-green-50 p-4 rounded-lg text-sm text-green-900 whitespace-pre-wrap break-words border border-green-200">
      <code>{code}</code>
    </pre>
  );
};

export default CodeDisplay;