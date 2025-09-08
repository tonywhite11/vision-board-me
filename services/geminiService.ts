
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-image-preview';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const base64ToGenerativePart = (base64: string, mimeType: string) => {
    return {
        inlineData: {
            data: base64,
            mimeType: mimeType
        }
    }
};

const getBase64FromResponse = (response: GenerateContentResponse): string | null => {
    for (const candidate of response.candidates || []) {
        for (const part of candidate.content.parts) {
            if (part.inlineData?.data) {
                const mimeType = part.inlineData.mimeType;
                if(mimeType.startsWith('image/')) {
                    return part.inlineData.data;
                }
            }
        }
    }
    return null;
}


export const generateImageFromText = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imageBase64 = getBase64FromResponse(response);
        if (imageBase64) {
            return `data:image/png;base64,${imageBase64}`;
        }
        throw new Error("No image generated from prompt.");

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image.");
    }
};


export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
    const [header, data] = base64Image.split(',');
    if (!header || !data) throw new Error("Invalid base64 image string");
    
    const mimeTypeMatch = header.match(/data:(.*);base64/);
    if (!mimeTypeMatch) throw new Error("Could not determine MIME type from base64 string");
    const mimeType = mimeTypeMatch[1];

    try {
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    base64ToGenerativePart(data, mimeType),
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imageBase64 = getBase64FromResponse(response);
         if (imageBase64) {
            return `data:image/png;base64,${imageBase64}`;
        }
        throw new Error("No image generated from edit.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image.");
    }
};
