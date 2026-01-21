
import React, { useState } from 'react';

interface DebugInfoProps {
  log: string;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ log }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!log) return null;

    return (
        <div className="mt-6">
            <details onToggle={(e) => setIsOpen((e.currentTarget as HTMLDetailsElement).open)} open={isOpen}>
                <summary className="cursor-pointer font-semibold text-slate-600 hover:text-slate-800">
                    {isOpen ? 'Cacher les informations de débogage' : 'Afficher les informations de débogage'}
                </summary>
                <div className="mt-2 p-4 bg-slate-800 text-slate-100 font-mono text-xs rounded-md max-h-64 overflow-y-auto">
                    <pre>{log}</pre>
                </div>
            </details>
        </div>
    );
};

export default DebugInfo;
