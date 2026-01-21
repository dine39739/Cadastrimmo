
export interface Proprietaire {
  nomComplet: string;
  adresse: string;
}

export interface Lot {
  lot: string;
  proprietaires: Proprietaire[];
  section: string;
  plan: string;
  quoteParts: string[];
  quotePartAggregated: string;
}

// Type for the raw data expected from Gemini's initial extraction
export interface ExtractedLot {
  "Les propriétaires (nom + adresse complète)": Proprietaire[] | Proprietaire;
  "La section (Sec)": string;
  "Le numéro de plan (N° Plan)": string;
  "Le numéro de lot": string;
  "La quote-part (C Part)": string;
  // This field is sometimes present, handle it gracefully.
  "L'adresse du bien"?: string; 
}


export interface AggregatedGroup {
  section: string;
  plan: string;
  lots: Lot[];
}
