
import type { ExtractedLot, AggregatedGroup, Lot, Proprietaire } from '../types';

export const filterAndNormalizeData = (data: ExtractedLot[], section: string, planInputString: string): ExtractedLot[] => {
  const planList = planInputString.split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => p.replace(/^0+/, '')); // Remove leading zeros for matching

  const normalizedSection = section.trim().toUpperCase();

  return data.filter(item => {
    if (!item || !item["La section (Sec)"]) return false;

    const itemSection = (item["La section (Sec)"] || '').trim().toUpperCase();
    if (itemSection !== normalizedSection) {
      return false;
    }

    if (planList.length > 0) {
      const itemPlan = (item["Le numéro de plan (N° Plan)"] || '').trim().replace(/^0+/, '');
      return planList.includes(itemPlan);
    }

    return true;
  });
};


export const groupAndAggregateLots = (data: ExtractedLot[]): Map<string, AggregatedGroup> => {
    const aggregatedGroups = new Map<string, AggregatedGroup>();

    data.forEach(item => {
        if (!item || !item["Le numéro de lot"]) return;

        const sectionKey = (item["La section (Sec)"] || 'N/A').trim().toUpperCase();
        const planKey = (item["Le numéro de plan (N° Plan)"] || 'N/A').trim().replace(/^0+/, '');
        const lotKey = (item["Le numéro de lot"] || 'N/A').trim().toUpperCase();
        
        let proprietairesData = item["Les propriétaires (nom + adresse complète)"];
        const proprietairesArray: Proprietaire[] = Array.isArray(proprietairesData) ? proprietairesData : (proprietairesData ? [proprietairesData] : []);

        const sortedProprietaires = proprietairesArray
            .filter(p => p && (p.nomComplet || p.adresse))
            .map(p => ({
                nomComplet: p.nomComplet?.trim() || '',
                adresse: p.adresse?.trim() || ''
            }))
            .sort((a, b) => {
                const nameA = a.nomComplet.toUpperCase();
                const nameB = b.nomComplet.toUpperCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return a.adresse.toUpperCase().localeCompare(b.adresse.toUpperCase());
            });

        const proprietairesKey = sortedProprietaires.map(p => `${p.nomComplet.toUpperCase()}|${p.adresse.toUpperCase()}`).join(';');
        
        const groupKey = `${sectionKey}-${planKey}`;
        const uniqueLotKey = `${lotKey}-${groupKey}-${proprietairesKey}`;

        if (!aggregatedGroups.has(groupKey)) {
            aggregatedGroups.set(groupKey, {
                section: sectionKey,
                plan: planKey,
                lots: []
            });
        }
        
        const currentGroup = aggregatedGroups.get(groupKey)!;
        
        let existingLot = currentGroup.lots.find(l => 
             l.lot.toUpperCase() === lotKey &&
             l.proprietaires.map(p => `${p.nomComplet.toUpperCase()}|${p.adresse.toUpperCase()}`).join(';') === proprietairesKey
        );

        const quotePart = (item["La quote-part (C Part)"] || '').trim();

        if (existingLot) {
            // Lot with same owners exists, just add quote part if new
            if (quotePart && !existingLot.quoteParts.includes(quotePart)) {
                existingLot.quoteParts.push(quotePart);
                existingLot.quotePartAggregated = existingLot.quoteParts.join(' | ');
            }
        } else {
            // New unique lot
            const newLot: Lot = {
                lot: item["Le numéro de lot"],
                proprietaires: sortedProprietaires,
                section: item["La section (Sec)"],
                plan: item["Le numéro de plan (N° Plan)"],
                quoteParts: quotePart ? [quotePart] : [],
                quotePartAggregated: quotePart || 'Inconnue(s)',
            };
            currentGroup.lots.push(newLot);
        }
    });

    return aggregatedGroups;
};
