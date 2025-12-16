import React, { useRef, useState } from 'react';
import { CardData, CardTheme, FontOptions, ImageStyleOptions, CardDesignOptions, MessageLengthOptions, MessageBoxStyleOptions, ImageMaskOptions, ImageBorderOptions, CardDesign, MessageBoxStyle, ImageMask, ImageBorder, ImageStyleGroups } from '../types';
import { Wand2, Image as ImageIcon, RefreshCw, AlignLeft, AlignCenter, AlignRight, Layout, Upload, BoxSelect, Shuffle, ChevronDown, ChevronUp, Type, SmilePlus, Shapes, Palette, User, Heart, Sparkles, MessageSquare, PaintBucket } from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';

interface EditorPanelProps {
  data: CardData;
  onChange: (updates: Partial<CardData>) => void;
  onGenerateText: () => void;
  onGenerateImage: () => void;
  onGenerateCaption: () => void;
  onGenerateStickers: () => void;
  onGenerateBackgroundColor: () => void;
  onShuffleFont: () => void;
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
  onShuffleFont,
  onAddSticker,
  onRandomTemplate,
  isGeneratingText,
  isGeneratingImage,
  isGeneratingCaption,
  isGeneratingStickers,
  isGeneratingBackground,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Accordion state: default open 'basics'
  const [openSection, setOpenSection] = useState<string>('basics');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

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
        case CardTheme.Christmas: defaultCaption = "Wishing You a Merry Christmas"; break;
        case CardTheme.Birthday: defaultCaption = "Happiest Birthday to You"; break;
        case CardTheme.NewYear: defaultCaption = "Happy New Year 2025"; break;
        case CardTheme.ThankYou: defaultCaption = "With Sincere Gratitude"; break;
        case CardTheme.Love: defaultCaption = "Love You Forever & Always"; break;
        case CardTheme.Congratulation: defaultCaption = "Congratulations on Your Success"; break;
        case CardTheme.Graduation: defaultCaption = "The Future is Yours"; break;
        case CardTheme.Wedding: defaultCaption = "Happily Ever After"; break;
        case CardTheme.CheerUp: defaultCaption = "Better Days are Coming"; break;
        case CardTheme.Apology: defaultCaption = "I Am Truly Sorry"; break;
        case CardTheme.Invitation: defaultCaption = "You Are Invited"; break;
        case CardTheme.Other: defaultCaption = "Have a Wonderful Day"; break;
    }
    
    onChange({ 
      theme: newTheme,
      englishCaption: defaultCaption,
      backgroundColor: 'auto'
    });
  };

  // Helper component for Accordion Header
  const SectionHeader = ({ id, title, icon: Icon, isOpen }: { id: string, title: string, icon: any, isOpen: boolean }) => (
    <button 
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between p-4 bg-white border border-slate-200 transition-all ${isOpen ? 'rounded-t-xl border-b-transparent shadow-sm z-10 relative' : 'rounded-xl hover:bg-slate-50'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`font-bold ${isOpen ? 'text-slate-800' : 'text-slate-600'}`}>{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 border-r border-slate-200 relative overflow-hidden">
      
      {/* Header */}
      <header className="p-6 pb-4 bg-white border-b border-slate-200 shrink-0 flex justify-between items-center shadow-sm z-20">
        <div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            AI Card Studio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">나만의 특별한 카드를 만들어보세요</p>
        </div>
        <button 
            onClick={onRandomTemplate}
            className="group flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100 hover:shadow-md"
            title="랜덤 템플릿"
        >
            <Shuffle className="w-5 h-5 mb-0.5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[9px] font-bold">Shuffle</span>
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-300">
        
        {/* Section 1: Basic Info (Theme & People) */}
        <div className="flex flex-col">
            <SectionHeader id="basics" title="1. 기본 설정" icon={Heart} isOpen={openSection === 'basics'} />
            {openSection === 'basics' && (
                <div className="p-5 bg-white border border-t-0 border-slate-200 rounded-b-xl space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">카드 테마</label>
                        <div className="relative">
                            <select
                                value={data.theme}
                                onChange={(e) => handleThemeChange(e.target.value as CardTheme)}
                                className="w-full appearance-none px-4 py-3 pl-10 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none transition-colors cursor-pointer"
                            >
                                {Object.values(CardTheme).map((theme) => (
                                    <option key={theme} value={theme}>{theme}</option>
                                ))}
                            </select>
                            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        {data.theme === CardTheme.Other && (
                            <input 
                                type="text" 
                                value={data.customTheme} 
                                onChange={(e) => onChange({ customTheme: e.target.value })}
                                placeholder="테마 직접 입력 (예: 취업 축하)" 
                                className="w-full px-4 py-2 text-sm rounded-lg border border-indigo-200 bg-indigo-50/30 focus:border-indigo-500 outline-none"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500">받는 사람</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="예: 엄마"
                                    value={data.recipient}
                                    onChange={(e) => onChange({ recipient: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                                />
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500">보내는 사람</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="예: 철수"
                                    value={data.sender}
                                    onChange={(e) => onChange({ sender: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                                />
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Section 2: Design & Color */}
        <div className="flex flex-col">
            <SectionHeader id="design" title="2. 디자인 & 배경" icon={Layout} isOpen={openSection === 'design'} />
            {openSection === 'design' && (
                <div className="p-5 bg-white border border-t-0 border-slate-200 rounded-b-xl space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">카드 모양</label>
                        <div className="relative">
                            <select
                                value={data.design}
                                onChange={(e) => onChange({ design: e.target.value as CardDesign })}
                                className="w-full appearance-none px-4 py-3 pl-10 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
                            >
                                {CardDesignOptions.map((design) => (
                                    <option key={design.value} value={design.value}>{design.label}</option>
                                ))}
                            </select>
                            <Shapes className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                            <span>배경 색상</span>
                            {isGeneratingBackground && <span className="text-[10px] text-indigo-600 animate-pulse">추천 중...</span>}
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={onGenerateBackgroundColor}
                                disabled={isGeneratingBackground}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors text-xs font-bold disabled:opacity-50"
                            >
                                <Wand2 className="w-3.5 h-3.5" />
                                AI 추천
                            </button>
                            <button 
                                onClick={() => onChange({ backgroundColor: 'auto' })}
                                className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${data.backgroundColor === 'auto' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                                테마 자동
                            </button>
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm cursor-pointer group">
                                <input 
                                    type="color" 
                                    value={data.backgroundColor === 'auto' ? '#ffffff' : data.backgroundColor}
                                    onChange={(e) => onChange({ backgroundColor: e.target.value })}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 border-0 cursor-pointer"
                                />
                                <PaintBucket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none mix-blend-difference" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Section 3: Message */}
        <div className="flex flex-col">
            <SectionHeader id="message" title="3. 메시지 작성" icon={MessageSquare} isOpen={openSection === 'message'} />
            {openSection === 'message' && (
                <div className="p-5 bg-white border border-t-0 border-slate-200 rounded-b-xl space-y-5 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* Message Generation & Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase">내용</label>
                            <div className="flex items-center gap-1">
                                <select
                                    value={data.messageLength}
                                    onChange={(e) => onChange({ messageLength: e.target.value as any })}
                                    className="text-[10px] py-1 pl-2 pr-6 rounded border border-slate-200 bg-white outline-none cursor-pointer appearance-none relative"
                                    style={{ backgroundImage: 'none' }}
                                >
                                    {MessageLengthOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={onGenerateText}
                                    disabled={isGeneratingText}
                                    className="text-[10px] flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 disabled:opacity-50 font-bold shadow-sm transition-opacity"
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
                                placeholder="메시지를 입력하거나 자동 작성을 눌러보세요."
                                className="w-full h-24 px-4 py-3 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none resize-none leading-relaxed bg-slate-50 focus:bg-white transition-colors"
                                style={{ fontFamily: data.font }}
                            />
                            {isGeneratingText && <LoadingOverlay message="메시지 작성 중..." />}
                        </div>
                    </div>

                    {/* Font & Alignment */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                            <span>폰트 & 정렬</span>
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <select
                                    value={data.font}
                                    onChange={(e) => onChange({ font: e.target.value })}
                                    className="w-full appearance-none px-3 py-2 pl-9 text-xs rounded-lg border border-slate-200 bg-white outline-none cursor-pointer"
                                    style={{ fontFamily: data.font }}
                                >
                                    {FontOptions.map((font) => (
                                        <option key={font.value} value={font.value}>{font.name}</option>
                                    ))}
                                </select>
                                <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                            <button
                                onClick={onShuffleFont}
                                className="px-2.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                                title="폰트 랜덤"
                            >
                                <Shuffle className="w-4 h-4" />
                            </button>
                            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                                {['text-left', 'text-center', 'text-right'].map((align: any) => (
                                    <button
                                        key={align}
                                        onClick={() => onChange({ alignment: align })}
                                        className={`p-1.5 rounded-md transition-colors ${data.alignment === align ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {align === 'text-left' && <AlignLeft className="w-3.5 h-3.5" />}
                                        {align === 'text-center' && <AlignCenter className="w-3.5 h-3.5" />}
                                        {align === 'text-right' && <AlignRight className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Box Style */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                <BoxSelect className="w-3.5 h-3.5" />
                                말풍선 스타일
                            </label>
                            <select
                                value={data.messageBoxStyle}
                                onChange={(e) => onChange({ messageBoxStyle: e.target.value as MessageBoxStyle })}
                                className="text-xs py-1 px-2 rounded border border-slate-200 bg-white outline-none cursor-pointer"
                            >
                                {MessageBoxStyleOptions.map((style) => (
                                    <option key={style.value} value={style.value}>{style.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Sliders */}
                        <div className="grid grid-cols-2 gap-4 pt-1">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                    <span>텍스트 크기</span>
                                    <span>{data.fontSize}px</span>
                                </div>
                                <input 
                                    type="range" min="12" max="60" step="1" 
                                    value={data.fontSize} 
                                    onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                    <span>박스 너비</span>
                                    <span>{data.messageBoxWidth}%</span>
                                </div>
                                <input 
                                    type="range" min="50" max="100" step="5" 
                                    value={data.messageBoxWidth} 
                                    onChange={(e) => onChange({ messageBoxWidth: Number(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Section 4: Visuals (Image & Caption) */}
        <div className="flex flex-col">
            <SectionHeader id="visuals" title="4. 이미지 & 스타일" icon={ImageIcon} isOpen={openSection === 'visuals'} />
            {openSection === 'visuals' && (
                <div className="p-5 bg-white border border-t-0 border-slate-200 rounded-b-xl space-y-5 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* Image Generation */}
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 border-dashed relative">
                        <div className="flex gap-2">
                            <select 
                                value={data.imageStyle}
                                onChange={(e) => onChange({ imageStyle: e.target.value })}
                                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                            >
                                    {Object.entries(ImageStyleGroups).map(([group, options]) => (
                                        <optgroup key={group} label={group}>
                                            {options.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                            </select>
                            <button
                                onClick={() => {
                                    const randomStyle = ImageStyleOptions[Math.floor(Math.random() * ImageStyleOptions.length)].value;
                                    onChange({ imageStyle: randomStyle });
                                }}
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition-colors"
                                title="스타일 랜덤"
                            >
                                <Shuffle className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={data.imageSubject}
                                onChange={(e) => onChange({ imageSubject: e.target.value })}
                                placeholder="이미지 주제 (예: 눈 내리는 마을)"
                                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
                            />
                            <button
                                onClick={onGenerateImage}
                                disabled={isGeneratingImage}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                                {isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                                생성
                            </button>
                        </div>

                        {/* Image Preview & Upload */}
                        <div className="mt-2">
                            {data.imageUrl ? (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden group/img border border-slate-200">
                                    <img src={data.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm">
                                        <button 
                                            onClick={onGenerateImage}
                                            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 border border-white/50 rounded-full text-xs font-bold text-white transition-colors"
                                        >
                                            다시 그리기
                                        </button>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-1.5 bg-white rounded-full text-xs font-bold text-slate-900 shadow-lg hover:scale-105 transition-transform"
                                        >
                                            사진 업로드
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all"
                                >
                                    <Upload className="w-6 h-6" />
                                    <span className="text-xs font-medium">이미지 생성 또는 업로드</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                        </div>
                        {isGeneratingImage && <LoadingOverlay message="AI가 그림을 그리는 중..." />}
                    </div>

                    {/* Image Settings (Mask, Border, Size) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">이미지 모양</label>
                            <select
                                value={data.imageMask}
                                onChange={(e) => onChange({ imageMask: e.target.value as ImageMask })}
                                className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none bg-white"
                            >
                                {ImageMaskOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">테두리 스타일</label>
                            <select
                                value={data.imageBorder}
                                onChange={(e) => onChange({ imageBorder: e.target.value as ImageBorder })}
                                className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none bg-white"
                            >
                                {ImageBorderOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        {data.imageMask === 'custom' && (
                            <div className="col-span-2 flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">모서리: {data.customImageRadius}px</span>
                                <input 
                                    type="range" min="0" max="150" 
                                    value={data.customImageRadius} 
                                    onChange={(e) => onChange({ customImageRadius: Number(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-indigo-500"
                                />
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-100" />

                    {/* English Caption */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">영문 문구 (Caption)</label>
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                value={data.englishCaption}
                                onChange={(e) => onChange({ englishCaption: e.target.value })}
                                placeholder="카드에 들어갈 영문 문구"
                                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500 italic font-serif text-slate-600"
                            />
                            <button
                                onClick={onGenerateCaption}
                                disabled={isGeneratingCaption}
                                className="p-2 rounded-lg bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm transition-colors"
                                title="자동 생성"
                            >
                                {isGeneratingCaption ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Image Size Sliders */}
                    <div className="space-y-3 pt-1">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                <span>가로 크기</span>
                                <span>{data.imageWidth}%</span>
                            </div>
                            <input 
                                type="range" min="50" max="100" step="5" 
                                value={data.imageWidth} 
                                onChange={(e) => onChange({ imageWidth: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-indigo-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                <span>세로 크기</span>
                                <span>{data.imageHeight}px</span>
                            </div>
                            <input 
                                type="range" min="100" max="600" step="10" 
                                value={data.imageHeight} 
                                onChange={(e) => onChange({ imageHeight: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer accent-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Section 5: Decorations */}
        <div className="flex flex-col pb-4">
            <SectionHeader id="stickers" title="5. 스티커 꾸미기" icon={SmilePlus} isOpen={openSection === 'stickers'} />
            {openSection === 'stickers' && (
                <div className="p-5 bg-white border border-t-0 border-slate-200 rounded-b-xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="스티커 주제 (예: 파티)"
                            value={data.customStickerTopic}
                            onChange={(e) => onChange({ customStickerTopic: e.target.value })}
                            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                        />
                        <button
                            onClick={onGenerateStickers}
                            disabled={isGeneratingStickers}
                            className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 disabled:opacity-50 flex items-center gap-1 transition-colors"
                        >
                            {isGeneratingStickers ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                            생성
                        </button>
                    </div>

                    <div className="relative min-h-[100px] p-4 bg-slate-50 rounded-xl border border-slate-200">
                        {data.stickerSet.length > 0 ? (
                            <div className="grid grid-cols-5 gap-3">
                                {data.stickerSet.map((sticker, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onAddSticker(sticker)}
                                        className="aspect-square flex items-center justify-center text-2xl bg-white rounded-lg shadow-sm hover:scale-110 hover:shadow-md transition-all border border-slate-100 active:scale-95"
                                    >
                                        {sticker}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-4">
                                <SmilePlus className="w-8 h-8 opacity-50" />
                                <span className="text-xs">스티커를 생성하여 카드를 꾸며보세요!</span>
                            </div>
                        )}
                        {isGeneratingStickers && <LoadingOverlay message="스티커 만드는 중..." />}
                    </div>

                    {data.decorations.length > 0 && (
                        <div className="flex justify-end">
                            <button 
                                onClick={() => onChange({ decorations: [] })}
                                className="text-xs text-red-500 font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                모든 스티커 지우기
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default EditorPanel;