import React, { useRef } from 'react';
import { CardData, CardTheme, FontOptions, ImageStyleOptions, CardDesignOptions, MessageLengthOptions, MessageBoxStyleOptions, ImageMaskOptions, ImageBorderOptions, CardDesign, MessageBoxStyle, ImageMask, ImageBorder, ImageStyleGroups } from '../types';
import { Wand2, Image as ImageIcon, RefreshCw, AlignLeft, AlignCenter, AlignRight, Layout, Upload, BoxSelect, Shuffle, ChevronDown, Type, SmilePlus, Shapes, Palette, Minus, Frame } from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';

interface EditorPanelProps {
  data: CardData;
  onChange: (updates: Partial<CardData>) => void;
  onGenerateText: () => void;
  onGenerateImage: () => void;
  onGenerateCaption: () => void;
  onGenerateStickers: () => void;
  onGenerateBackgroundColor: () => void;
  onAddSticker: (content: string) => void;
  onRandomTemplate: () => void;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  isGeneratingCaption: boolean;
  isGeneratingStickers: boolean;
  isGeneratingBackground: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  data,
  onChange,
  onGenerateText,
  onGenerateImage,
  onGenerateCaption,
  onGenerateStickers,
  onGenerateBackgroundColor,
  onAddSticker,
  onRandomTemplate,
  isGeneratingText,
  isGeneratingImage,
  isGeneratingCaption,
  isGeneratingStickers,
  isGeneratingBackground,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (newTheme: CardTheme) => {
    let defaultCaption = "Best Wishes";
    switch (newTheme) {
        case CardTheme.Christmas: defaultCaption = "Merry Christmas"; break;
        case CardTheme.Birthday: defaultCaption = "Happy Birthday"; break;
        case CardTheme.NewYear: defaultCaption = "Happy New Year"; break;
        case CardTheme.ThankYou: defaultCaption = "Thank You"; break;
        case CardTheme.Love: defaultCaption = "I Love You"; break;
        case CardTheme.Congratulation: defaultCaption = "Congratulations"; break;
        case CardTheme.Graduation: defaultCaption = "Happy Graduation"; break;
        case CardTheme.Wedding: defaultCaption = "Happy Wedding"; break;
        case CardTheme.CheerUp: defaultCaption = "Cheer Up"; break;
        case CardTheme.Apology: defaultCaption = "I'm Sorry"; break;
        case CardTheme.Invitation: defaultCaption = "You're Invited"; break;
        case CardTheme.Other: defaultCaption = "Special Day"; break;
    }
    
    onChange({ 
      theme: newTheme,
      englishCaption: defaultCaption,
      backgroundColor: 'auto' // Reset to auto on theme change usually
    });
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 overflow-y-auto bg-white border-r border-slate-200 shadow-sm relative scrollbar-thin scrollbar-thumb-slate-200">
      
      <header className="mb-6 shrink-0 flex justify-between items-start">
        <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            AI 카드 스튜디오
            </h1>
            <p className="text-sm text-slate-500 mt-1">나만의 특별한 카드를 만들어보세요.</p>
        </div>
        <button 
            onClick={onRandomTemplate}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
            title="랜덤 템플릿 생성"
        >
            <Shuffle className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold">Shuffle</span>
        </button>
      </header>

      <div className="space-y-6 flex-1">
        
        {/* 1. Theme Selection */}
        <section className="space-y-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">1. 테마</label>
          <div className="relative">
            <select
              value={data.theme}
              onChange={(e) => handleThemeChange(e.target.value as CardTheme)}
              className="w-full appearance-none px-4 py-3 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none bg-white cursor-pointer"
            >
              {Object.values(CardTheme).map((theme) => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          
          {data.theme === CardTheme.Other && (
             <div className="mt-2">
                <input 
                  type="text" 
                  value={data.customTheme} 
                  onChange={(e) => onChange({ customTheme: e.target.value })}
                  placeholder="테마 입력 (예: 결혼기념일)" 
                  className="w-full px-3 py-2 text-sm rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none bg-indigo-50/30"
                />
             </div>
          )}
        </section>

        {/* 2. People (Recipient/Sender) */}
        <section className="space-y-2">
           <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">2. 받는 사람 / 보내는 사람</label>
           <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="받는 사람 (예: 엄마)"
                value={data.recipient}
                onChange={(e) => onChange({ recipient: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
              />
              <div className="flex gap-2">
                 <input
                    type="text"
                    placeholder="보내는 사람"
                    value={data.sender}
                    onChange={(e) => onChange({ sender: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
                 />
                 <input
                    type="text"
                    placeholder="From"
                    value={data.senderLabel}
                    onChange={(e) => onChange({ senderLabel: e.target.value })}
                    className="w-20 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-center"
                    title="끝맺음 말 (예: From, 올림)"
                 />
              </div>
           </div>
        </section>

        {/* 3. Design & Color */}
        <section className="space-y-2">
           <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">3. 카드 디자인</label>
           <div className="space-y-2">
             <div className="relative">
                <select
                    value={data.design}
                    onChange={(e) => onChange({ design: e.target.value as CardDesign })}
                    className="w-full appearance-none px-4 py-3 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none bg-white cursor-pointer"
                >
                    {CardDesignOptions.map((design) => (
                        <option key={design.value} value={design.value}>{design.label}</option>
                    ))}
                </select>
                <Layout className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
             </div>

             {/* Background Color Picker */}
             <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="flex-1 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-600">배경색</span>
                </div>
                <div className="flex items-center gap-2">
                     <button
                        onClick={onGenerateBackgroundColor}
                        disabled={isGeneratingBackground}
                        className="text-[10px] px-2 py-1 rounded-md font-bold bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 flex items-center gap-1 shadow-sm"
                        title="AI 색상 추천"
                    >
                        {isGeneratingBackground ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        AI 추천
                    </button>
                    <button 
                        onClick={() => onChange({ backgroundColor: 'auto' })}
                        className={`text-[10px] px-2 py-1 rounded-md font-bold transition-colors ${data.backgroundColor === 'auto' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-500'}`}
                    >
                        자동 (테마)
                    </button>
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                        <input 
                            type="color" 
                            value={data.backgroundColor === 'auto' ? '#ffffff' : data.backgroundColor}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 border-0 cursor-pointer"
                        />
                    </div>
                </div>
             </div>
           </div>
        </section>

        {/* 4. Message */}
        <section className="space-y-2 relative">
          <div className="flex justify-between items-center gap-2">
             <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">4. 메시지 내용</label>
             <div className="flex items-center gap-1.5">
                <select
                    value={data.messageLength}
                    onChange={(e) => onChange({ messageLength: e.target.value as any })}
                    className="text-[10px] p-1 rounded border border-slate-200 bg-white text-slate-600 outline-none"
                >
                    {MessageLengthOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <button
                onClick={onGenerateText}
                disabled={isGeneratingText}
                className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 font-bold whitespace-nowrap"
                >
                {isGeneratingText ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                자동 작성
                </button>
             </div>
          </div>
          
          <div className="relative">
            <textarea
              value={data.message}
              onChange={(e) => onChange({ message: e.target.value })}
              placeholder={`전하고 싶은 메시지를 입력하세요...`}
              className="w-full h-28 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none resize-none leading-relaxed"
              style={{ fontFamily: data.font }}
            />
             {isGeneratingText && <LoadingOverlay message="작성 중..." />}
          </div>

          <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
             
             {/* Box Style (Dropdown) */}
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">박스 스타일</label>
                <div className="relative">
                    <select
                        value={data.messageBoxStyle}
                        onChange={(e) => onChange({ messageBoxStyle: e.target.value as MessageBoxStyle })}
                        className="w-full appearance-none px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-indigo-500 outline-none cursor-pointer"
                    >
                        {MessageBoxStyleOptions.map((style) => (
                            <option key={style.value} value={style.value}>{style.label}</option>
                        ))}
                    </select>
                    <BoxSelect className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
             </div>

             <hr className="border-slate-200" />

             {/* Message Box Adjustments (Size/Padding) */}
             <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>박스 너비</span>
                        <span>{data.messageBoxWidth}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        step="5" 
                        value={data.messageBoxWidth} 
                        onChange={(e) => onChange({ messageBoxWidth: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                 </div>
                 <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>박스 여백</span>
                        <span>{data.messageBoxPadding}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="10" 
                        max="60" 
                        step="4" 
                        value={data.messageBoxPadding} 
                        onChange={(e) => onChange({ messageBoxPadding: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                 </div>
             </div>

             <hr className="border-slate-200" />

             {/* Font Family & Alignment */}
             <div className="grid grid-cols-3 gap-2">
                 <div className="col-span-2">
                    <select
                        value={data.font}
                        onChange={(e) => onChange({ font: e.target.value })}
                        className="w-full p-1.5 text-xs border border-slate-200 rounded-md outline-none"
                        style={{ fontFamily: data.font }}
                    >
                        {FontOptions.map((font) => (
                            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                {font.name}
                            </option>
                        ))}
                    </select>
                 </div>
                 <div className="flex justify-end gap-1 bg-white border border-slate-200 rounded-md p-1">
                     {['text-left', 'text-center', 'text-right'].map((align: any) => (
                         <button
                            key={align}
                            onClick={() => onChange({ alignment: align })}
                            className={`flex-1 flex justify-center items-center rounded ${data.alignment === align ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
                         >
                            {align === 'text-left' && <AlignLeft className="w-3.5 h-3.5" />}
                            {align === 'text-center' && <AlignCenter className="w-3.5 h-3.5" />}
                            {align === 'text-right' && <AlignRight className="w-3.5 h-3.5" />}
                         </button>
                     ))}
                 </div>
             </div>

             {/* Font Size Slider */}
             <div className="space-y-1">
                 <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                     <span>글자 크기</span>
                     <span>{data.fontSize}px</span>
                 </div>
                 <input 
                    type="range" 
                    min="12" 
                    max="60" 
                    step="1" 
                    value={data.fontSize} 
                    onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                 />
             </div>

          </div>
        </section>

        {/* 5. Visuals */}
        <section className="space-y-2 relative">
           <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">5. 이미지</label>
           
           <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col gap-2 relative">
               
               {/* Style Selection (Categorized) */}
               <div className="flex gap-2">
                   <select 
                       value={data.imageStyle}
                       onChange={(e) => onChange({ imageStyle: e.target.value })}
                       className="flex-1 p-1.5 text-xs border border-slate-200 rounded-md outline-none bg-white"
                   >
                        {Object.entries(ImageStyleGroups).map(([group, options]) => (
                            <optgroup key={group} label={group}>
                                {options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.name}</option>
                                ))}
                            </optgroup>
                        ))}
                   </select>
               </div>
               
               <div className="flex gap-2 mt-2">
                   <input 
                     type="text" 
                     value={data.imageSubject}
                     onChange={(e) => onChange({ imageSubject: e.target.value })}
                     placeholder="예: 눈 내리는 마을"
                     className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-md outline-none"
                   />
               </div>

               {/* Border Options (Photo Frame Removed) */}
               <div className="mt-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <BoxSelect className="w-3 h-3" /> 테두리 선 (Border)
                    </label>
                    <select
                        value={data.imageBorder}
                        onChange={(e) => onChange({ imageBorder: e.target.value as ImageBorder })}
                        className="w-full p-1.5 text-xs border border-slate-200 rounded-md outline-none bg-white"
                    >
                        {ImageBorderOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
               </div>

               {/* New Image Mask (Shape) Dropdown */}
               <div className="space-y-1.5 mt-2 bg-slate-100 p-2 rounded-md">
                    <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Shapes className="w-3 h-3" />
                        이미지 모양 (마스크)
                    </label>
                    <div className="relative">
                        <select
                            value={data.imageMask}
                            onChange={(e) => onChange({ imageMask: e.target.value as ImageMask })}
                            className="w-full p-1.5 text-xs border border-slate-200 rounded-md outline-none bg-white"
                        >
                            {ImageMaskOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                    {/* Custom Input for Radius if 'custom' selected */}
                    {data.imageMask === 'custom' && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 whitespace-nowrap">모서리: {data.customImageRadius}px</span>
                            <input 
                                type="range" 
                                min="0" 
                                max="150" 
                                value={data.customImageRadius} 
                                onChange={(e) => onChange({ customImageRadius: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    )}
               </div>

               {/* English Caption Input */}
               <div className="flex gap-2 mt-2 items-center">
                   <input
                        type="text"
                        value={data.englishCaption}
                        onChange={(e) => onChange({ englishCaption: e.target.value })}
                        placeholder="English theme phrase"
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-md outline-none font-serif text-slate-600 italic"
                   />
                   <button
                        onClick={onGenerateCaption}
                        disabled={isGeneratingCaption}
                        className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
                        title="영문 문구 자동 생성"
                   >
                       {isGeneratingCaption ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                   </button>
               </div>

               {/* Image Size Sliders */}
               <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>가로 크기</span>
                        <span>{data.imageWidth}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        step="5" 
                        value={data.imageWidth} 
                        onChange={(e) => onChange({ imageWidth: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>세로 크기</span>
                        <span>{data.imageHeight}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="100" 
                        max="600" 
                        step="10" 
                        value={data.imageHeight} 
                        onChange={(e) => onChange({ imageHeight: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
               </div>

               {data.imageUrl ? (
                   <div className="relative w-full h-24 rounded-lg overflow-hidden group/img mt-2">
                       <img src={data.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                           <button 
                               onClick={onGenerateImage}
                               className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-slate-800 shadow hover:scale-105"
                           >
                               다시 그리기
                           </button>
                           <button 
                               onClick={() => fileInputRef.current?.click()}
                               className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-slate-800 shadow hover:scale-105"
                           >
                               사진 변경
                           </button>
                       </div>
                   </div>
               ) : (
                   <div className="flex gap-2 mt-2">
                       <button
                         onClick={onGenerateImage}
                         disabled={isGeneratingImage}
                         className="flex-1 py-2 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-100 flex items-center justify-center gap-1"
                       >
                         <ImageIcon className="w-3 h-3" />
                         생성
                       </button>
                       <button
                         onClick={() => fileInputRef.current?.click()}
                         className="flex-1 py-2 rounded-md bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-1"
                       >
                         <Upload className="w-3 h-3" />
                         업로드
                       </button>
                   </div>
               )}
               {isGeneratingImage && <LoadingOverlay message="그리는 중..." />}
               
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
               />
           </div>
        </section>

        {/* 6. Decorations / Stickers */}
        <section className="space-y-2 relative">
           <div className="flex justify-between items-center gap-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">6. 꾸미기</label>
              <div className="flex items-center gap-1">
                 <input
                     type="text"
                     placeholder="주제 (예: 고양이)"
                     value={data.customStickerTopic}
                     onChange={(e) => onChange({ customStickerTopic: e.target.value })}
                     className="px-2 py-1 text-xs border border-slate-200 rounded-md outline-none w-24"
                 />
              </div>
           </div>
           
           <div className="space-y-3">
               {/* Stickers Section */}
               <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 min-h-[80px] relative">
                   <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <SmilePlus className="w-3 h-3" /> 스티커
                        </span>
                        <button
                          onClick={onGenerateStickers}
                          disabled={isGeneratingStickers}
                          className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 font-bold whitespace-nowrap shadow-sm"
                        >
                          {isGeneratingStickers ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                          생성
                        </button>
                   </div>
                   
                   {data.stickerSet.length > 0 ? (
                       <div className="grid grid-cols-5 gap-2">
                           {data.stickerSet.map((sticker, idx) => (
                               <button
                                   key={idx}
                                   onClick={() => onAddSticker(sticker)}
                                   className="aspect-square flex items-center justify-center text-2xl bg-white rounded-lg shadow-sm hover:scale-110 hover:shadow-md transition-transform border border-slate-100 active:scale-95"
                               >
                                   {sticker}
                               </button>
                           ))}
                       </div>
                   ) : (
                       <div className="text-center text-slate-400 py-2 text-[10px]">
                           테마에 맞는 스티커를 만들어보세요!
                       </div>
                   )}
                   {isGeneratingStickers && <LoadingOverlay message="스티커 생성 중..." />}
               </div>
           </div>
           
           {data.decorations.length > 0 && (
               <div className="flex justify-end mt-2">
                   <button 
                       onClick={() => onChange({ decorations: [] })}
                       className="text-[10px] text-red-500 underline hover:text-red-600"
                   >
                       모두 지우기
                   </button>
               </div>
           )}
        </section>

      </div>
    </div>
  );
};

export default EditorPanel;