import React, { useState } from 'react';
import { CardData, CardTheme, FontOptions, ImageStyleOptions, Decoration, ImageMaskOptions, CardDesignOptions, MessageBoxStyleOptions, ImageBorderOptions } from './types';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import { generateCardMessage, generateCardImage, generateEnglishCaption, generateThemeStickers, generateThemeBackgroundColor } from './services/geminiService';

const App: React.FC = () => {
  const [cardData, setCardData] = useState<CardData>({
    theme: CardTheme.Christmas,
    customTheme: '',
    
    backgroundColor: 'auto',

    recipient: '', 
    recipientPosition: { x: 0, y: 0 },
    sender: '',
    senderLabel: 'From', 
    senderPosition: { x: 0, y: 0 },
    
    englishCaption: 'Merry Christmas', 
    englishCaptionPosition: { x: 0, y: 0 },

    message: '',
    messageLength: 'medium',
    
    imageUrl: null,
    font: FontOptions[1].value, 
    fontSize: 16, 
    alignment: 'text-center',
    
    imageStyle: ImageStyleOptions[0].value,
    imageSubject: '',
    imageWidth: 100,  
    imageHeight: 300, 
    imagePosition: { x: 0, y: 0 },
    
    imageMask: 'none',
    customImageRadius: 24,
    
    // photoFrame removed
    imageBorder: 'none',

    design: 'rectangle', 
    
    messageBoxStyle: 'none',
    messagePosition: { x: 0, y: 0 },
    messageBoxWidth: 90,
    messageBoxPadding: 24,

    stickerSet: [],
    customStickerTopic: '',
    decorations: [],
  });

  const [loadingStates, setLoadingStates] = useState({
    text: false,
    image: false,
    caption: false,
    stickers: false,
    background: false,
  });

  const [isViewMode, setIsViewMode] = useState(false);

  const updateCardData = (updates: Partial<CardData>) => {
    setCardData(prev => ({ ...prev, ...updates }));
  };

  const getEffectiveTheme = () => {
    return cardData.theme === CardTheme.Other 
      ? (cardData.customTheme || '특별한 날') 
      : cardData.theme;
  };

  const handleGenerateText = async () => {
    setLoadingStates(prev => ({ ...prev, text: true }));
    try {
      const theme = getEffectiveTheme();
      const recipient = cardData.recipient || "소중한 분";
      const sender = cardData.sender || "저";
      
      const result = await generateCardMessage(theme, recipient, sender, cardData.messageLength);
      updateCardData({ 
          message: result.message,
          senderLabel: result.senderLabel
      });
    } catch (error) {
      alert("텍스트 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoadingStates(prev => ({ ...prev, text: false }));
    }
  };

  const handleGenerateCaption = async () => {
    setLoadingStates(prev => ({ ...prev, caption: true }));
    try {
        const theme = getEffectiveTheme();
        const caption = await generateEnglishCaption(theme);
        updateCardData({ englishCaption: caption });
    } catch (error) {
        console.error(error);
    } finally {
        setLoadingStates(prev => ({ ...prev, caption: false }));
    }
  };

  const handleGenerateImage = async () => {
    setLoadingStates(prev => ({ ...prev, image: true }));
    try {
      const theme = getEffectiveTheme();
      const imageUrl = await generateCardImage(theme, cardData.imageSubject, cardData.imageStyle);
      updateCardData({ imageUrl });
    } catch (error) {
      alert("이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoadingStates(prev => ({ ...prev, image: false }));
    }
  };

  const handleGenerateStickers = async () => {
      setLoadingStates(prev => ({ ...prev, stickers: true }));
      try {
          const topic = cardData.customStickerTopic || getEffectiveTheme();
          const stickers = await generateThemeStickers(topic);
          updateCardData({ stickerSet: stickers });
      } catch (error) {
          console.error(error);
      } finally {
          setLoadingStates(prev => ({ ...prev, stickers: false }));
      }
  };

  const handleGenerateBackgroundColor = async () => {
      setLoadingStates(prev => ({ ...prev, background: true }));
      try {
          const topic = getEffectiveTheme();
          const color = await generateThemeBackgroundColor(topic);
          updateCardData({ backgroundColor: color });
      } catch (error) {
          console.error(error);
      } finally {
          setLoadingStates(prev => ({ ...prev, background: false }));
      }
  };

  const handleAddSticker = (content: string) => {
      const newDecoration: Decoration = {
          id: Date.now().toString() + Math.random().toString(),
          content,
          x: 0, // Will be centered or placed randomly in preview
          y: 0,
          scale: 1,
          rotation: (Math.random() - 0.5) * 30, // Random initial tilt
      };
      updateCardData({ decorations: [...cardData.decorations, newDecoration] });
  };

  // Random Template Generator
  const handleRandomTemplate = () => {
    const randomDesign = CardDesignOptions[Math.floor(Math.random() * CardDesignOptions.length)].value;
    const randomBoxStyle = MessageBoxStyleOptions[Math.floor(Math.random() * MessageBoxStyleOptions.length)].value;
    const randomFont = FontOptions[Math.floor(Math.random() * FontOptions.length)].value;
    const randomImageStyle = ImageStyleOptions[Math.floor(Math.random() * ImageStyleOptions.length)].value;
    const randomMask = ImageMaskOptions[Math.floor(Math.random() * ImageMaskOptions.length)].value;
    const randomBorder = ImageBorderOptions[Math.floor(Math.random() * ImageBorderOptions.length)].value;
    
    // Sometimes random background color, sometimes auto
    const useRandomColor = Math.random() > 0.5;
    const randomColor = useRandomColor ? '#' + Math.floor(Math.random()*16777215).toString(16) : 'auto';

    updateCardData({
        design: randomDesign,
        messageBoxStyle: randomBoxStyle,
        font: randomFont,
        imageStyle: randomImageStyle,
        imageMask: randomMask,
        imageBorder: randomBorder,
        backgroundColor: randomColor
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden relative">
      {/* View Mode Overlay (App Presentation Mode) */}
      {isViewMode && (
         <div className="absolute inset-0 z-50 bg-slate-900 overflow-y-auto">
            <PreviewPanel 
              data={cardData} 
              isViewMode={true} 
              onToggleViewMode={() => setIsViewMode(false)} 
              onUpdateData={updateCardData}
            />
         </div>
      )}

      {/* Editor Panel - Widened to 50% (md:w-1/2) */}
      <div className={`w-full md:w-1/2 lg:w-5/12 h-1/2 md:h-full z-10 transition-all ${isViewMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <EditorPanel 
          data={cardData} 
          onChange={updateCardData}
          onGenerateText={handleGenerateText}
          onGenerateImage={handleGenerateImage}
          onGenerateCaption={handleGenerateCaption}
          onGenerateStickers={handleGenerateStickers}
          onGenerateBackgroundColor={handleGenerateBackgroundColor}
          onAddSticker={handleAddSticker}
          onRandomTemplate={handleRandomTemplate}
          isGeneratingText={loadingStates.text}
          isGeneratingImage={loadingStates.image}
          isGeneratingCaption={loadingStates.caption}
          isGeneratingStickers={loadingStates.stickers}
          isGeneratingBackground={loadingStates.background}
        />
      </div>

      {/* Preview Panel - Adjusted to match (md:w-1/2) */}
      <div className={`w-full md:w-1/2 lg:w-7/12 h-1/2 md:h-full bg-slate-200/50 transition-all ${isViewMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <PreviewPanel 
          data={cardData} 
          isViewMode={false}
          onToggleViewMode={() => setIsViewMode(true)}
          onUpdateData={updateCardData}
        />
      </div>
    </div>
  );
};

export default App;