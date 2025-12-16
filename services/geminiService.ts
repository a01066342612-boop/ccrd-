import { GoogleGenAI, Modality, Schema, Type } from "@google/genai";
import { MessageLength, FontOptions } from "../types";

// Initialize Gemini Client
// @ts-ignore - process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Generation ---
export const generateCardMessage = async (theme: string, recipient: string, sender: string, length: MessageLength): Promise<{ message: string, senderLabel: string }> => {
  try {
    let lengthConstraint = "40단어 내외로 적당하게 (3~4문장)";
    
    switch (length) {
      case 'xshort':
        lengthConstraint = "10단어 이내. 딱 1문장으로 핵심 인사말만.";
        break;
      case 'short':
        lengthConstraint = "20단어 내외. 2~3문장으로 간결하고 임팩트 있게.";
        break;
      case 'medium':
        lengthConstraint = "40단어 내외. 4~5문장으로 적당한 길이감.";
        break;
      case 'long':
        lengthConstraint = "70단어 내외. 6~8문장으로 마음을 담아 충분히.";
        break;
      case 'xlong':
        lengthConstraint = "100단어 이상. 10문장 이상의 정성스러운 장문의 편지 형식.";
        break;
    }

    const prompt = `작성자 ${sender}가 수신자 ${recipient}에게 보내는 따뜻한 ${theme} 카드 메시지를 작성해줘. 
    
    [필수 조건]
    1. 결과는 반드시 JSON 형식으로 반환해야 함.
    2. 'content' 필드: 오직 메시지 본문만 작성. **"To. ${recipient}" 나 "From. ${sender}" 는 절대로 포함하지 말 것.** 인사말로 시작해서 끝인사로 마무리하는 본문 텍스트만.
    3. 'ending' 필드: 보내는 사람 이름 앞에 붙일 적절한 문구 (예: From, 올림, 드림, 사랑하는, 너의 친구 등).
    4. 한국어로 작성.
    5. 본문 길이: ${lengthConstraint}
    
    예시 출력:
    {
      "content": "생일 축하해! 오늘 하루 세상에서 가장 행복한 사람이 되길 바래. 맛있는 거 많이 먹고 즐거운 시간 보내!",
      "ending": "너의 친구"
    }`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            ending: { type: Type.STRING }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    
    return {
        message: json.content || `행복한 하루 보내세요!`,
        senderLabel: json.ending || "From"
    };

  } catch (error) {
    console.error("Text Gen Error:", error);
    // Fallback
    return {
        message: `${theme} 축하합니다! 행복 가득한 날 되세요.`,
        senderLabel: "From"
    };
  }
};

// --- English Caption Generation ---
export const generateEnglishCaption = async (theme: string): Promise<string> => {
    try {
        const prompt = `Create a very short, elegant, 1-line phrase in English for a ${theme} card. 
        Examples: "Merry Christmas", "Happy Birthday to You", "Best Wishes", "Love You Always", "Sincere Condolences".
        No quotes in output. Just the text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return (response.text || theme).replace(/["']/g, "").trim();
    } catch (error) {
        return "Best Wishes";
    }
};

// --- Font Recommendation ---
export const recommendFont = async (theme: string, messageContent: string): Promise<string> => {
    try {
        // Prepare simplified font list string to save tokens and clarity
        const availableFonts = FontOptions.map(f => `${f.name} (Value: ${f.value})`).join(', ');
        
        const prompt = `Select the single best matching Korean font from the list below for a greeting card.
        Context - Theme: "${theme}", Message Mood: "${messageContent.substring(0, 50)}...".
        
        Available Fonts: ${availableFonts}.
        
        Guidelines:
        - "Handwriting/Cute" (Nanum Pen Script, Hi Melody, Gaegu, Single Day, Cute Font, Gamja Flower, Sunflower) -> Good for casual, birthday, love, friends.
        - "Serif/Traditional" (Noto Serif KR, Nanum Myeongjo, Gungsuh-style, Yeon Sung, Song Myung) -> Good for thank you, new year, elders, respectful.
        - "Bold/Display" (Black Han Sans, Jua, Do Hyeon, Bagel Fat One) -> Good for emphasis, cheer up, celebration titles.
        - "Clean/Modern" (Noto Sans KR, Gowun Dodum) -> Safe fallback.
        
        Return ONLY the font value in JSON format.
        Example: {"font": "Nanum Pen Script"}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        font: { type: Type.STRING }
                    }
                }
            }
        });

        const json = JSON.parse(response.text || "{}");
        const recommended = json.font;
        
        // Validate
        const isValid = FontOptions.some(f => f.value === recommended);
        return isValid ? recommended : FontOptions[0].value;
    } catch (error) {
        console.error("Font Rec Error:", error);
        return FontOptions[0].value;
    }
};

// --- Sticker Generation ---
export const generateThemeStickers = async (theme: string): Promise<string[]> => {
    try {
        const prompt = `Generate a JSON array of 20 distinct emojis or unicode symbols that strongly relate to the theme: "${theme}". 
        They should be varied (objects, faces, symbols).
        Example output: ["🎄", "🎅", "🎁", "❄️", "⛄", "🔔", "🕯️", "🍪", "🍷", "🌟", ...]
        Return ONLY the JSON array.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const stickers = JSON.parse(response.text || "[]");
        return stickers.length > 0 ? stickers : ["✨", "❤️", "🎁", "😊"];
    } catch (error) {
        console.error("Sticker Gen Error:", error);
        // Fallback with 20 items (expanded from 10)
        return ["✨", "❤️", "🎈", "🎉", "🌟", "🎂", "🎁", "😊", "🌈", "🍀", "🌸", "🎵", "📷", "💌", "🧸", "🍫", "🎀", "🌻", "🍰", "🍭"];
    }
};

// --- Background Color Generation (New) ---
export const generateThemeBackgroundColor = async (theme: string): Promise<string> => {
    try {
        const prompt = `Suggest a single, beautiful, soft pastel or elegant hex color code for the background of a "${theme}" greeting card.
        Return ONLY the hex code in JSON format.
        Example: {"color": "#FFE4E1"} or {"color": "#F0F8FF"}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        color: { type: Type.STRING }
                    }
                }
            }
        });
        
        const json = JSON.parse(response.text || "{}");
        return json.color || "#ffffff";
    } catch (error) {
        return "#f8fafc";
    }
};

// --- Image Generation ---
export const generateCardImage = async (theme: string, subject: string, style: string): Promise<string> => {
  try {
    // Construct the prompt with the selected style
    const description = subject 
      ? `${subject}` 
      : `${theme} celebration scene`;

    const prompt = `Generate a high-quality image for a greeting card. 
    Style: ${style}. 
    Subject: ${description}. 
    Mood: Warm, Happy, Celebration.
    Important: FULL BLEED, EDGE TO EDGE. Do NOT include any white borders, frames, or margins around the image. The image must fill the entire canvas. 
    
    CRITICAL: DO NOT INCLUDE ANY TEXT, WORDS, LETTERS, OR TYPOGRAPHY IN THE IMAGE. The image must be purely visual/illustrative.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    // Iterate to find the image part
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data returned.");
  } catch (error) {
    console.error("Image Gen Error:", error);
    // Fallback placeholder
    return `https://picsum.photos/seed/${theme}${Date.now()}/600/600`;
  }
};