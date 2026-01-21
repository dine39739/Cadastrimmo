import { GoogleGenAI, GenerateContentResponse, Part } from '@google/genai';
import type { ExtractedLot, Lot } from '../types';

const cleanJsonString = (jsonText: string): string => {
  return jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
};

const parseGeminiResponse = (cleanedJson: string): any => {
    try {
        const parsedData = JSON.parse(cleanedJson);
        return Array.isArray(parsedData) ? parsedData : [parsedData];
    } catch (e) {
        console.error("JSON parsing error:", e);
        throw new Error("La réponse de l'IA n'est pas un JSON valide.");
    }
}

export const extractDataFromFileWithGemini = async (
  fileContent: string,
  mimeType: 'application/pdf' | 'text/html',
  section: string,
  fileName: string,
  apiKey: string
): Promise<ExtractedLot[]> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const userPrompt = `Tu es un expert en analyse de documents cadastraux français.
FICHIER: ${fileName}
SECTION RECHERCHEE: ${section}

INSTRUCTIONS GENERALES:
1. Le document est un relevé de propriété, soit un PDF, soit du code source HTML.
2. Si c'est du HTML, interprète le contenu textuel comme s'il était affiché, en utilisant les balises <table>, <tr>, <td> pour comprendre la structure.

3. **Identification des Propriétaires (Étape Cruciale)**:
   a. Scanne attentivement TOUTE la partie supérieure du document (l'en-tête, avant les tableaux) pour trouver les informations sur les propriétaires.
   b. Cherche des libellés comme "Propriétaire/Indivision". L'adresse est souvent juste en dessous.
   c. Cherche également des noms de personnes qui peuvent être listés séparément, parfois à côté de codes (ex: MCXTC6) ou dans d'autres colonnes de l'en-tête.
   d. **Combine les informations**: L'objectif est de créer une liste complète de propriétaires. S'il y a une seule adresse pour plusieurs noms (cas d'une indivision), attribue cette même adresse à chaque nom. Par exemple, si tu trouves "Propriétaire/Indivision" avec "9 AV MAURICE RAVEL..." en dessous, ET que tu trouves les noms "GALLOT/MICHEL..." et "GALLOT/ANDRÉ" dans la même zone, tu dois créer DEUX propriétaires, chacun avec l'adresse "9 AV MAURICE RAVEL...".

4. Ensuite, trouve les tables de "PROPRIÉTÉS BATTES" et "PROPRIÉTÉS NON BATTIES".
5. Dans ces tables, cherche TOUTES les lignes où la section correspond à "${section}".
6. Pour chaque ligne correspondante, extrais les champs suivants:
   - "Les propriétaires (nom + adresse complète)": **Utilise la liste COMPLÈTE des propriétaires identifiés à l'étape 3** et associe-les à ce lot. La structure doit être un tableau d'objets avec "nomComplet" et "adresse".
   - "La section (Sec)": La section alphabétique (ex: CR).
   - "Le numéro de plan (N° Plan)": Le numéro de parcelle (ex: 282).
   - "Le numéro de lot": Le numéro de lot. S'il n'est pas explicite, cherche un identifiant comme "N°PORTE" ou "N°INVAR". Si aucun n'est trouvé, laisse ce champ vide.
   - "La quote-part (C Part)": La quote-part ou contenance (ex: "HA A CA 3 36").

FORMAT DE SORTIE ATTENDU:
Réponds OBLIGATOIREMENT et UNIQUEMENT avec un tableau JSON valide (commençant par '[' et finissant par ']'). N'ajoute aucun commentaire ou texte en dehors du JSON.
DOCUMENT:`;

  const textPart: Part = { text: userPrompt };
  let requestContents;

  if (mimeType === 'application/pdf') {
      const pdfPart: Part = { inlineData: { data: fileContent, mimeType: 'application/pdf' } };
      requestContents = { parts: [textPart, pdfPart] };
  } else { // text/html
      const htmlTextPart: Part = { text: fileContent };
      requestContents = { parts: [textPart, htmlTextPart] };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: requestContents,
        config: {
            temperature: 0.1,
            responseMimeType: "application/json",
        }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("L'IA n'a pas retourné de données.");
    }

    const cleanedJson = cleanJsonString(jsonText);
    return parseGeminiResponse(cleanedJson);

  } catch (error) {
    console.error('Gemini API Error (Extraction):', error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue de l'API Gemini";
    throw new Error(`Erreur Gemini: ${errorMessage}`);
  }
};


export const synthesizeResultsWithGemini = async (
  data: Lot[],
  apiKey: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  const simplifiedData = data.map(item => ({
    lot: item.lot,
    proprietaires: item.proprietaires,
    section: item.section,
    plan: item.plan,
    quoteParts: item.quoteParts,
  }));

  const userPrompt = `Analyse ces données immobilières et fournis une synthèse concise et structurée en français. Utilise des listes à puces pour la clarté.

1.  **Résumé Général**: Donne le nombre total de lots uniques et le nombre de groupes de propriétaires distincts.
2.  **Répartition par Propriétaire**: Liste les groupes de propriétaires les plus fréquents et le nombre de lots qu'ils détiennent.
3.  **Observations Clés**: Fais des observations sur les quotes-parts (ex: lots détenus en pleine propriété, en indivision, etc.) et sur les adresses.
4.  **Conclusion**: Fournis une brève conclusion sur la structure de propriété.

Données: ${JSON.stringify(simplifiedData, null, 2)}`;
  
  try {
     const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userPrompt,
        config: {
            temperature: 0.3,
        }
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("L'IA n'a pas pu générer la synthèse.");
    }
    return text;
  } catch (error)
 {
    console.error('Gemini API Error (Synthesis):', error);
     const errorMessage = error instanceof Error ? error.message : "Erreur inconnue de l'API Gemini";
    throw new Error(`Erreur Gemini lors de la synthèse: ${errorMessage}`);
  }
};