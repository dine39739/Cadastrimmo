
import React from 'react';

interface FilterInputsProps {
  section: string;
  setSection: (section: string) => void;
  plan: string;
  setPlan: (plan: string) => void;
  disabled: boolean;
}

const FilterInputs: React.FC<FilterInputsProps> = ({ section, setSection, plan, setPlan, disabled }) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="section-input" className="block text-sm font-semibold text-slate-700 mb-1">
            Section à Rechercher (Obligatoire)
          </label>
          <input
            type="text"
            id="section-input"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="Ex: CN, CE"
            disabled={disabled}
            className="w-full px-3 py-2 text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>
        <div>
          <label htmlFor="plan-input" className="block text-sm font-semibold text-slate-700 mb-1">
            Numéro(s) de Plan (Optionnel)
          </label>
          <input
            type="text"
            id="plan-input"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Ex: 32, 21 (séparés par virgule)"
            disabled={disabled}
            className="w-full px-3 py-2 text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterInputs;
