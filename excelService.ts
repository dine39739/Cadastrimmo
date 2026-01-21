
import type { Lot } from '../types';

declare const XLSX: any;

export const exportToExcel = (aggregatedLots: Lot[]): void => {
  if (!aggregatedLots || aggregatedLots.length === 0) {
    alert("Aucune donnée à exporter. Veuillez d'abord effectuer l'analyse.");
    return;
  }

  const dataForExport = [];

  const maxProprietaires = aggregatedLots.reduce((max, lot) => {
    const numProps = lot.proprietaires ? lot.proprietaires.length : 0;
    return Math.max(max, numProps);
  }, 0);

  for (const lot of aggregatedLots) {
    const baseRow: { [key: string]: string | number } = {
      'Section': lot.section,
      'Plan': lot.plan,
      'Lot': lot.lot,
      'Quote-part(s) Agrégée': lot.quotePartAggregated,
    };

    if (lot.proprietaires && lot.proprietaires.length > 0) {
      lot.proprietaires.forEach((proprietaire, index) => {
        baseRow[`Propriétaire ${index + 1} - Nom`] = proprietaire.nomComplet || 'N/A';
        baseRow[`Propriétaire ${index + 1} - Adresse`] = proprietaire.adresse || 'N/A';
      });
    }

    // Ensure all rows have the same number of columns for proprietors
    for (let i = (lot.proprietaires?.length || 0); i < maxProprietaires; i++) {
        baseRow[`Propriétaire ${i + 1} - Nom`] = '';
        baseRow[`Propriétaire ${i + 1} - Adresse`] = '';
    }

    dataForExport.push(baseRow);
  }

  try {
    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lots_Aggreges");

    const filename = `Analyse_Lots_Consolides_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch(error) {
    console.error("Error exporting to Excel:", error);
    alert("Une erreur est survenue lors de la génération du fichier XLSX.");
  }
};
