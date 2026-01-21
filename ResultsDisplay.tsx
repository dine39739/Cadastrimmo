import React from 'react';
import type { AggregatedGroup } from '../types';

interface ResultsDisplayProps {
  aggregatedGroups: Map<string, AggregatedGroup> | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ aggregatedGroups }) => {
  if (!aggregatedGroups || aggregatedGroups.size === 0) {
    return null;
  }

  // FIX: Explicitly type 'acc' as number to resolve the TypeScript error where it was inferred as 'unknown'.
  const totalUniqueLots = Array.from(aggregatedGroups.values()).reduce((acc: number, group: AggregatedGroup) => acc + group.lots.length, 0);

  if (totalUniqueLots === 0) {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Résultats de l'Extraction</h2>
            <p className="text-slate-600 bg-yellow-100 p-4 rounded-md">Aucun lot unique trouvé correspondant aux filtres.</p>
        </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        Liste des Lots Uniques Extraits ({totalUniqueLots} lots trouvés)
      </h2>
      <div className="space-y-6">
        {/* FIX: Explicitly type 'group' as AggregatedGroup to access its properties. This resolves errors for properties 'section', 'plan', and 'lots'. */}
        {Array.from(aggregatedGroups.values()).map((group: AggregatedGroup) => (
          <div key={`${group.section}-${group.plan}`}>
            <h3 className="text-lg font-semibold text-sky-800 bg-sky-100 p-3 rounded-t-md border-l-4 border-sky-500">
              Section : {group.section || 'N/A'} / Plan : {group.plan || 'N/A'} ({group.lots.length} lots uniques)
            </h3>
            <div className="overflow-x-auto shadow-md rounded-b-md">
              <table className="w-full min-w-[650px] text-sm text-left text-slate-500">
                <thead className="text-xs text-white uppercase bg-blue-500">
                  <tr>
                    <th scope="col" className="px-6 py-3">Lot</th>
                    <th scope="col" className="px-6 py-3">Quote-part(s)</th>
                    <th scope="col" className="px-6 py-3">Indivisaires (Nom et Adresse)</th>
                  </tr>
                </thead>
                <tbody>
                  {group.lots.map((item, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.lot || 'N/A'}</td>
                      <td className="px-6 py-4" dangerouslySetInnerHTML={{ __html: item.quotePartAggregated ? item.quotePartAggregated.replace(/ \| /g, '<br>') : 'Inconnue(s)' }} />
                      <td className="px-6 py-4">
                        {item.proprietaires && item.proprietaires.length > 0 ? (
                          <ul className="space-y-2">
                            {item.proprietaires.map((owner, ownerIndex) => (
                              <li key={ownerIndex} className="pb-2 border-b border-dashed border-slate-200 last:border-b-0 last:pb-0">
                                <strong className="block text-slate-800">{owner.nomComplet || 'Nom Inconnu'}</strong>
                                <span className="text-xs text-slate-500">{owner.adresse || 'Adresse Inconnue'}</span>
                              </li>
                            ))}
                          </ul>
                        ) : 'Propriétaire(s) Inconnu(s)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;