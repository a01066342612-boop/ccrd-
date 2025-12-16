import React, { useRef, useState, useEffect } from 'react';
import { CardData, CardTheme, CardDesign, MessageBoxStyle, Decoration, ImageMask, ImageBorder } from '../types';
import { Download, Smartphone, X, Image as ImageIcon, Move, Trash2, RotateCw, Maximize2, Minimize2, Scaling, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface PreviewPanelProps {
  data: CardData;
  isViewMode?: boolean;
  onToggleViewMode?: () => void;
  onUpdateData?: (updates: Partial<CardData>) => void;
}

const ThemeStyles: Record<CardTheme, string> = {
  [CardTheme.Christmas]: 'bg-red-50 text-red-900 border-red-200',
  [CardTheme.Birthday]: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  [CardTheme.NewYear]: 'bg-slate-900 text-slate-50 border-slate-700',
  [CardTheme.ThankYou]: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  [CardTheme.Love]: 'bg-pink-50 text-pink-900 border-pink-200',
  [CardTheme.Congratulation]: 'bg-blue-50 text-blue-900 border-blue-200',
  [CardTheme.Graduation]: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  [CardTheme.Wedding]: 'bg-rose-50 text-rose-800 border-rose-200',
  [CardTheme.CheerUp]: 'bg-orange-50 text-orange-900 border-orange-200',
  [CardTheme.Apology]: 'bg-gray-50 text-gray-700 border-gray-200',
  [CardTheme.Invitation]: 'bg-violet-50 text-violet-900 border-violet-200',
  [CardTheme.Other]: 'bg-slate-100 text-slate-900 border-slate-200', 
};

interface DragState {
    type: 'message' | 'image' | 'decoration' | 'caption' | 'recipient' | 'sender';
    action: 'move' | 'rotate' | 'scale' | 'resize';
    id?: string;
    
    startX: number;
    startY: number;
    
    initialX: number;
    initialY: number;
    
    // For rotation/scaling
    initialRotation?: number;
    initialScale?: number;
    centerX?: number;
    centerY?: number;

    // For resizing (image/box)
    initialWidth?: number; // %
    initialHeight?: number; // px
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ data, isViewMode = false, onToggleViewMode, onUpdateData }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Selection State
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Drag State
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Download State
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    // Temporarily deselect to hide handles
    const prevSelected = selectedId;
    setSelectedId(null);
    setIsDownloading(true);
    
    try {
        await new Promise(resolve => setTimeout(resolve, 50)); // Short delay to allow UI update
        
        const dataUrl = await toPng(cardRef.current, {
            cacheBust: false, // Disabled to improve speed
            pixelRatio: 2, // Reduced from 3 to 2 for better performance while maintaining good quality
            skipAutoScale: true,
        });

        const link = document.createElement('a');
        link.download = `ai-card-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error("Download failed", err);
        alert("이미지 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
        setSelectedId(prevSelected);
        setIsDownloading(false);
    }
  };

  // Generic Drag Handler
  const handlePointerDown = (
      e: React.PointerEvent, 
      type: 'message' | 'image' | 'decoration' | 'caption' | 'recipient' | 'sender', 
      action: 'move' | 'rotate' | 'scale' | 'resize' = 'move',
      id?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    let initialX = 0;
    let initialY = 0;
    let initialRotation = 0;
    let initialScale = 1;
    let centerX = 0;
    let centerY = 0;
    let initialWidth = 0;
    let initialHeight = 0;

    if (type === 'message') {
        initialX = data.messagePosition.x;
        initialY = data.messagePosition.y;
        initialWidth = data.messageBoxWidth;
        setSelectedId('message-box');
    } else if (type === 'image') {
        initialX = data.imagePosition.x;
        initialY = data.imagePosition.y;
        initialWidth = data.imageWidth;
        initialHeight = data.imageHeight;
        setSelectedId('image-box');
    } else if (type === 'caption') {
        initialX = data.englishCaptionPosition.x;
        initialY = data.englishCaptionPosition.y;
        initialScale = data.englishCaptionScale || 1;
        setSelectedId('caption-box');

        // Calculate center for scaling
        if (action === 'scale') {
            const el = e.currentTarget.closest('.group\\/caption');
            if (el) {
                const rect = el.getBoundingClientRect();
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
            }
        }
    } else if (type === 'recipient') {
        initialX = data.recipientPosition.x;
        initialY = data.recipientPosition.y;
    } else if (type === 'sender') {
        initialX = data.senderPosition.x;
        initialY = data.senderPosition.y;
    } else if (type === 'decoration' && id) {
        const deco = data.decorations.find(d => d.id === id);
        if (deco) {
            initialX = deco.x;
            initialY = deco.y;
            initialRotation = deco.rotation;
            initialScale = deco.scale;
            setSelectedId(id); // Select on interaction

            // Calculate center for math
            if (action === 'rotate' || action === 'scale') {
                const el = document.getElementById(`deco-${id}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    centerX = rect.left + rect.width / 2;
                    centerY = rect.top + rect.height / 2;
                }
            }
        }
    }

    setDragState({
        type,
        action,
        id,
        startX: e.clientX,
        startY: e.clientY,
        initialX,
        initialY,
        initialRotation,
        initialScale,
        centerX,
        centerY,
        initialWidth,
        initialHeight
    });
  };

  const removeDecoration = (id: string) => {
      if (onUpdateData) {
          onUpdateData({
              decorations: data.decorations.filter(d => d.id !== id)
          });
      }
      if (selectedId === id) setSelectedId(null);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState || !onUpdateData) return;
      e.preventDefault();
      
      const { type, action, id, startX, startY, initialX, initialY, initialRotation, initialScale, centerX, centerY, initialWidth, initialHeight } = dragState;

      if (action === 'move') {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          const newX = initialX + dx;
          const newY = initialY + dy;

          if (type === 'message') {
              onUpdateData({ messagePosition: { x: newX, y: newY } });
          } else if (type === 'image') {
              onUpdateData({ imagePosition: { x: newX, y: newY } });
          } else if (type === 'caption') {
              onUpdateData({ englishCaptionPosition: { x: newX, y: newY } });
          } else if (type === 'recipient') {
              onUpdateData({ recipientPosition: { x: newX, y: newY } });
          } else if (type === 'sender') {
              onUpdateData({ senderPosition: { x: newX, y: newY } });
          } else if (type === 'decoration' && id) {
              onUpdateData({
                  decorations: data.decorations.map(d => 
                      d.id === id ? { ...d, x: newX, y: newY } : d
                  )
              });
          }
      } else if (action === 'resize') {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          const cardWidth = cardRef.current?.clientWidth || 1000;
          
          if (type === 'image') {
              // Width (%), Height (px)
              const widthChangePercent = (dx / cardWidth) * 100;
              const newWidth = Math.min(100, Math.max(20, (initialWidth || 100) + widthChangePercent));
              const newHeight = Math.max(50, (initialHeight || 300) + dy);
              onUpdateData({ 
                  imageWidth: newWidth,
                  imageHeight: newHeight
              });
          } else if (type === 'message') {
              // Width (%)
              const widthChangePercent = (dx / cardWidth) * 100;
              const newWidth = Math.min(100, Math.max(30, (initialWidth || 90) + widthChangePercent));
              onUpdateData({ 
                  messageBoxWidth: newWidth 
              });
          }

      } else if (action === 'rotate' && type === 'decoration' && id && centerX !== undefined && centerY !== undefined) {
          // Calculate angle
          const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          const startAngle = Math.atan2(startY - centerY, startX - centerX);
          const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
          
          const newRotation = (initialRotation || 0) + angleDiff;
          
          onUpdateData({
              decorations: data.decorations.map(d => 
                  d.id === id ? { ...d, rotation: newRotation } : d
              )
          });

      } else if (action === 'scale') {
          if (type === 'decoration' && id && centerX !== undefined && centerY !== undefined) {
              // Calculate distance
              const currentDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
              const startDist = Math.hypot(startX - centerX, startY - centerY);
              
              // Avoid division by zero
              if (startDist > 0) {
                  const scaleRatio = currentDist / startDist;
                  const newScale = Math.max(0.2, (initialScale || 1) * scaleRatio); // Min scale 0.2
                  
                  onUpdateData({
                      decorations: data.decorations.map(d => 
                          d.id === id ? { ...d, scale: newScale } : d
                  )
                  });
              }
          } else if (type === 'caption' && centerX !== undefined && centerY !== undefined) {
             // Scale caption text
              const currentDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
              const startDist = Math.hypot(startX - centerX, startY - centerY);
              
              if (startDist > 0) {
                  const scaleRatio = currentDist / startDist;
                  const newScale = Math.max(0.5, (initialScale || 1) * scaleRatio); // Min scale 0.5
                  
                  onUpdateData({ englishCaptionScale: newScale });
              }
          }
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, onUpdateData, data.decorations]);

  // Logic to determine shape styling for the main container
  const getContainerShapeClass = (design: CardDesign) => {
    switch (design) {
        // Original
        case 'ticket': return 'rounded-3xl border-2 border-dashed border-current/30 p-8 clip-ticket'; 
        case 'frame': return 'border-[24px] border-white ring-1 ring-black/10 p-8 shadow-2xl';
        case 'heart': return 'rounded-[4rem] p-10';
        case 'polaroid': return 'bg-white text-slate-900 p-6 pb-20 shadow-xl rounded-sm border-0';
        case 'window': return 'rounded-xl border-2 border-slate-900 bg-white text-slate-900 p-0 overflow-hidden shadow-2xl';
        case 'stamp': return 'p-8 [mask-image:radial-gradient(circle_at_center,black_65%,transparent_66%),linear-gradient(black,black)] [mask-size:20px_20px,100%_100%] [mask-repeat:round,no-repeat]';
        case 'cloud': return 'rounded-[3rem] px-10 py-12 border-[8px] border-white/40';
        case 'phone': return 'rounded-[3rem] border-[12px] border-slate-800 bg-white text-slate-900 p-6 pb-12 relative overflow-hidden';
        case 'game': return 'rounded-b-3xl rounded-t-lg bg-slate-800 text-slate-100 p-6 pt-12 border-b-[20px] border-b-slate-900 shadow-2xl';
        
        // New Shapes
        case 'arch': return 'rounded-t-[10rem] rounded-b-xl p-8';
        case 'tag': return 'rounded-xl border-t-[32px] border-t-white/30 p-8 [clip-path:polygon(20%_0%,80%_0%,100%_20%,100%_100%,0%_100%,0%_20%)]';
        case 'hexagon_shape': return '[clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] p-12 bg-white'; 
        case 'folder': return 'rounded-xl rounded-tr-[4rem] border-t-[16px] border-current/20 p-8';
        case 'notebook_hole': return 'rounded-r-xl border-l-[24px] border-l-black/10 p-8 [mask-image:radial-gradient(circle_at_left_center,transparent_4%,black_5%)] [mask-size:100%_30px]';
        case 'receipt': return 'p-8 [mask-image:linear-gradient(135deg,transparent_10px,black_0),linear-gradient(-135deg,transparent_10px,black_0)] [mask-size:20px_100%] [mask-position:top_bottom] [mask-repeat:repeat-x]';
        case 'film_strip': return 'border-x-[24px] border-black/80 p-8 [mask-image:linear-gradient(to_bottom,black_70%,transparent_80%)] [mask-size:100%_40px]';
        case 'browser': return 'rounded-xl border-2 border-slate-300 bg-white text-slate-900 p-0 overflow-hidden shadow-xl';
        case 'book_cover': return 'rounded-r-2xl border-l-[16px] border-l-black/20 p-8 shadow-[10px_10px_30px_rgba(0,0,0,0.3)]';
        case 'mirror': return 'rounded-[50%] p-12 border-8 border-white/50 shadow-inner';
        
        // Origami & Others
        case 'origami_bird': return '[clip-path:polygon(0%_100%,30%_55%,50%_75%,100%_0%,70%_100%)] p-8';
        case 'origami_boat': return '[clip-path:polygon(15%_60%,0%_40%,50%_0%,100%_40%,85%_60%,85%_100%,15%_100%)] p-8';
        case 'origami_plane': return '[clip-path:polygon(50%_0%,100%_80%,50%_100%,0%_80%)] p-10';
        case 'envelope_open': return '[clip-path:polygon(0_20%,50%_0,100%_20%,100%_100%,0_100%)] p-8 pt-16';
        case 'paper_scroll': return 'rounded-lg border-y-[16px] border-yellow-700/40 bg-[#f8f1e0] p-8 shadow-md';
        case 'clipboard': return 'rounded-xl border-t-[40px] border-slate-700 p-8 shadow-xl';
        case 'puzzle_piece': return '[mask-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath d=\'M30,30 V10 A10,10 0 0,1 50,10 A10,10 0 0,1 70,10 V30 H90 A10,10 0 0,1 90,50 A10,10 0 0,1 90,70 H70 V90 A10,10 0 0,1 50,90 A10,10 0 0,1 30,90 V70 H10 A10,10 0 0,1 10,50 A10,10 0 0,1 10,30 H30 Z\' /%3E%3C/svg%3E")] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] p-16';
        case 'speech_bubble_shape': return 'rounded-[3rem] rounded-bl-none p-10 border-4 border-current';
        case 'calendar_sheet': return 'rounded-lg border-t-[30px] border-red-500 shadow-md p-8 relative after:content-[""] after:absolute after:top-[-35px] after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-4 after:bg-white after:rounded-full';
        case 'vinyl_record': return 'rounded-full aspect-square border-[40px] border-black bg-slate-900 p-16 text-white shadow-2xl';

        // 10 Old Extras
        case 'passport': return 'bg-[#4a1c1c] text-[#e0c080] rounded-r-xl border-l-[12px] border-black/20 shadow-xl p-8';
        case 'credit_card': return 'rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-xl p-8 border border-white/20 relative overflow-hidden';
        case 'cassette': return 'bg-slate-800 text-white rounded-lg border-[16px] border-slate-700 p-8 shadow-xl relative before:content-[""] before:absolute before:bottom-4 before:left-1/2 before:-translate-x-1/2 before:w-1/2 before:h-24 before:bg-white/10 before:rounded-full';
        case 'floppy': return 'bg-blue-600 text-white rounded-sm border-t-[40px] border-t-slate-200 border-l-[4px] border-r-[4px] border-b-[4px] border-slate-800 p-8 shadow-lg [clip-path:polygon(0%_0%,90%_0%,100%_10%,100%_100%,0%_100%)]';
        case 'certificate': return 'bg-[#fffdf0] text-slate-900 border-[20px] border-double border-[#b8860b] p-10 shadow-xl';
        case 'wanted': return 'bg-[#eec] text-[#432] p-8 shadow-lg border-4 border-[#543] font-serif';
        case 'social_post': return 'bg-white text-black rounded-sm border border-slate-200 shadow-sm p-0 overflow-hidden';
        case 'video_thumbnail': return 'aspect-video bg-black text-white p-8 relative shadow-2xl border border-white/10 flex items-center justify-center';
        case 'messenger': return 'bg-[#b2c7d9] text-black p-4 shadow-inner border border-slate-300';
        case 'retro_mac': return 'bg-white text-black border-2 border-black shadow-[4px_4px_0_black] rounded-t-lg p-0 overflow-hidden';
        
        // Old 10
        case 'magazine': return 'bg-cover bg-center text-white p-0 relative shadow-2xl overflow-hidden after:content-["VOGUE"] after:absolute after:top-4 after:left-1/2 after:-translate-x-1/2 after:text-[5rem] after:font-serif after:font-bold after:text-white/80';
        case 'album_cover': return 'aspect-square bg-slate-900 text-white p-8 shadow-2xl border border-white/10 relative flex flex-col justify-end';
        case 'id_card': return 'bg-white text-black rounded-lg border border-slate-200 shadow-lg p-6 relative before:absolute before:top-[-20px] before:left-1/2 before:-translate-x-1/2 before:w-16 before:h-20 before:bg-blue-900 before:-z-10 before:rounded-b-lg';
        case 'game_cartridge': return 'bg-gray-400 text-black rounded-t-lg rounded-b-sm border-b-[20px] border-b-gray-600 p-8 shadow-xl relative before:absolute before:top-4 before:left-1/2 before:-translate-x-1/2 before:w-3/4 before:h-32 before:bg-white before:rounded-md before:border-2 before:border-gray-500';
        case 'billboard': return 'aspect-video bg-white border-[10px] border-black p-0 shadow-2xl relative after:absolute after:bottom-[-40px] after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-10 after:bg-gray-800';
        case 'cinema_ticket': return 'bg-[#f4e4bc] border-dashed border-x-4 border-black/20 p-8 [mask-image:radial-gradient(circle_at_left,transparent_10px,black_11px),radial-gradient(circle_at_right,transparent_10px,black_11px)] [mask-size:50%_100%] [mask-position:left,right] [mask-repeat:no-repeat]';
        case 'browser_retro': return 'bg-[#c0c0c0] border-t-2 border-white border-l-2 border-white border-r-2 border-gray-600 border-b-2 border-gray-600 p-1 shadow-xl';
        case 'smartphone_chat': return 'bg-slate-100 text-black rounded-[2rem] border-8 border-black p-4 shadow-xl';
        case 'instant_camera': return 'bg-white p-4 pb-16 shadow-lg border border-slate-100 text-center font-handwriting';
        case 'vinyl_sleeve': return 'bg-[#eec] p-8 shadow-lg border border-black/5 rounded-sm relative after:absolute after:right-[-40px] after:top-1/2 after:-translate-y-1/2 after:w-40 after:h-40 after:bg-black after:rounded-full after:-z-10 after:border-[10px] after:border-[#111]';

        // NEW 10
        case 'music_player': return 'bg-gray-100 text-black rounded-xl border border-gray-300 shadow-xl p-6 pb-24 relative after:content-[""] after:absolute after:bottom-4 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-16 after:rounded-full after:border-4 after:border-gray-300 after:bg-white';
        case 'browser_popup': return 'bg-white border-2 border-gray-400 shadow-[4px_4px_0_rgba(0,0,0,0.5)] p-0 pt-8 relative before:content-["Error_404.exe"] before:absolute before:top-0 before:left-0 before:right-0 before:h-8 before:bg-blue-800 before:text-white before:flex before:items-center before:px-2 before:font-bold before:text-sm';
        case 'tarot_card': return 'bg-[#fff] border-[12px] border-double border-yellow-600 rounded-xl p-4 pb-12 shadow-2xl relative after:content-["THE_STAR"] after:absolute after:bottom-4 after:left-1/2 after:-translate-x-1/2 after:font-serif after:text-sm after:tracking-widest';
        case 'milk_carton': return 'bg-blue-50 border-t-[40px] border-t-blue-400 shadow-lg p-8 [clip-path:polygon(0%_10%,50%_0%,100%_10%,100%_100%,0%_100%)]';
        case 'shopping_bag': return 'bg-pink-100 border-b-8 border-b-pink-200 shadow-lg p-8 relative before:content-[""] before:absolute before:-top-8 before:left-1/2 before:-translate-x-1/2 before:w-20 before:h-16 before:border-[6px] before:border-pink-300 before:rounded-t-full';
        case 'lock_screen': return 'bg-black/80 text-white backdrop-blur-md rounded-none shadow-none border-t-4 border-white/20 p-8 pt-20 relative after:content-["12:00"] after:absolute after:top-8 after:left-1/2 after:-translate-x-1/2 after:text-4xl after:font-thin';
        case 'poker_card': return 'bg-white border border-gray-200 rounded-xl p-8 shadow-lg relative after:content-["♥"] after:absolute after:top-2 after:left-2 after:text-red-500 after:text-xl before:content-["♥"] before:absolute before:bottom-2 before:right-2 before:text-red-500 before:text-xl before:rotate-180';
        case 'floppy_back': return 'bg-[#333] rounded-sm p-4 pt-12 shadow-lg relative after:content-[""] after:absolute after:top-0 after:left-4 after:w-20 after:h-16 after:bg-gray-400 after:rounded-b-md';
        case 'train_ticket': return 'bg-orange-100 border-dashed border-x-4 border-orange-300 p-6 shadow-md font-mono text-orange-900';
        case 'post_it_wall': return 'bg-yellow-200 shadow-xl rotate-2 p-8 relative after:content-[""] after:absolute after:inset-0 after:bg-yellow-100 after:rotate-[-4deg] after:-z-10 after:shadow-md';

        default: return 'rounded-2xl p-8';
    }
  };

  const getMessageBoxClass = (style: MessageBoxStyle) => {
      switch (style) {
          // Original
          case 'paper': return 'bg-white/95 shadow-md rounded-lg border border-slate-100';
          case 'bubble': return 'bg-white shadow-sm rounded-3xl rounded-tr-none border border-slate-100';
          case 'notebook': return 'bg-[#fff9e6] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:100%_1.5rem] shadow-sm border border-stone-200 text-slate-800';
          case 'classic': return 'border-4 border-double border-current/30 bg-white/60';
          case 'postit': return 'bg-[#fef08a] shadow-lg rotate-1 text-slate-800';
          case 'vintage': return 'bg-[#f5e6d3] shadow-inner rounded-sm border border-[#d4c5b0] text-[#5c4d3c] font-serif sepia';
          case 'ribbon': return 'border-y-4 border-double border-current/40 bg-white/50';
          case 'translucent': return 'bg-white/30 backdrop-blur-md border border-white/40 rounded-xl shadow-lg';
          case 'brush': return 'bg-white/80 rounded-[2rem] shadow-sm'; 
          case 'outline': return 'border-2 border-current/60 bg-transparent';
          case 'dashed': return 'border-2 border-dashed border-current/60 bg-white/40';
          case 'double': return 'border-4 border-double border-current/60 bg-white/80 shadow-sm';
          case 'shimmer': return 'bg-gradient-to-r from-white/40 via-white/80 to-white/40 bg-[length:200%_100%] animate-[shimmer_3s_infinite] border border-white/50 shadow-sm rounded-xl';
          case 'brutal': return 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none text-black';
          case 'neon': return 'bg-black/80 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.5)] text-white rounded-xl backdrop-blur-md';
          
          // Previously Added Styles
          case 'tape': return 'bg-white/90 shadow-sm border-t-8 border-t-yellow-200/50 rounded-sm rotate-1';
          case 'torn_paper': return 'bg-white p-4 [mask-image:linear-gradient(45deg,transparent_5px,black_5px),linear-gradient(-45deg,transparent_5px,black_5px)] [mask-size:20px_100%] [mask-repeat:repeat-x] [mask-position:bottom]';
          case 'gradient_border': return 'border-4 border-transparent bg-white bg-clip-padding rounded-xl [background-image:linear-gradient(white,white),linear-gradient(to_right,violet,indigo)] [background-origin:border-box]';
          case 'glass_dark': return 'bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white shadow-lg';
          case 'terminal': return 'bg-black text-green-400 font-mono border border-green-500/50 rounded-md p-4 shadow-lg';
          case 'comic': return 'bg-white border-[3px] border-black rounded-[50%_20%_60%_30%] shadow-[4px_4px_0_black]';
          case 'sketch': return 'bg-white border-2 border-slate-800 rounded-lg [border-style:solid] [border-radius:2px_255px_3px_25px/255px_5px_225px_3px] shadow-sm';
          case 'plaque': return 'bg-gradient-to-br from-slate-800 to-black text-yellow-100 border-4 border-double border-yellow-600 rounded-sm shadow-2xl font-serif';
          case 'minimal_under': return 'border-b-2 border-current/50 bg-transparent rounded-none';
          case 'elegant': return 'border border-current/20 bg-white/80 outline outline-1 outline-offset-4 outline-current/20 p-6';

          // More Styles
          case 'rpg_dialog': return 'bg-gradient-to-b from-blue-900 to-slate-900 border-4 border-white rounded-lg text-white shadow-lg font-mono';
          case 'scroll_h': return 'bg-[#f4e4bc] border-y-[6px] border-[#d4b483] shadow-md text-[#5c4b37] relative';
          case 'post_stamp': return 'bg-white p-6 shadow-sm [mask-image:radial-gradient(circle,transparent_5px,black_6px)] [mask-size:20px_20px] [mask-repeat:round] [mask-position:center]';
          case 'ticket_stub': return 'bg-white border-2 border-slate-300 [mask-image:radial-gradient(circle_at_top_left,transparent_15px,black_0),radial-gradient(circle_at_top_right,transparent_15px,black_0),radial-gradient(circle_at_bottom_left,transparent_15px,black_0),radial-gradient(circle_at_bottom_right,transparent_15px,black_0)] [mask-size:51%_51%] [mask-repeat:no-repeat] [mask-position:top_left,top_right,bottom_left,bottom_right] p-6';
          case 'plaque_wooden': return 'bg-[#5c4033] border-[6px] border-[#3e2723] text-[#f5f5dc] rounded-sm shadow-xl';
          case 'plaque_stone': return 'bg-[#78909c] border-[6px] border-[#455a64] text-white rounded-sm shadow-xl [border-style:ridge]';
          case 'cyber_hud': return 'bg-black/80 border border-cyan-400 text-cyan-400 rounded-none shadow-[0_0_10px_cyan] [clip-path:polygon(0_0,100%_0,100%_85%,95%_100%,0_100%)]';
          case 'leaf': return 'bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[0_50%_0_50%] shadow-sm';
          case 'shout': return 'bg-white border-4 border-black text-black font-bold uppercase shadow-[4px_4px_0_black] [clip-path:polygon(0%_0%,100%_0%,100%_80%,80%_100%,0%_100%)]';
          case 'blob_soft': return 'bg-white/80 backdrop-blur-sm shadow-sm rounded-[30%_70%_70%_30%/30%_30%_70%_70%] border border-white/50';
          
          case 'notification': return 'bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-4 relative before:content-["🔔"] before:absolute before:-top-3 before:-left-1 before:bg-white before:rounded-full before:p-1 before:shadow-sm before:text-sm';
          case 'chat_send': return 'bg-yellow-300 text-black rounded-2xl rounded-tr-none shadow-sm';
          case 'chat_receive': return 'bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm';
          case 'steampunk': return 'bg-[#2b2b2b] border-[4px] border-[#c0a062] text-[#e0e0e0] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] rounded-md font-serif';
          case 'blueprint': return 'bg-[#0052cc] text-white border border-white/30 [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:20px_20px] font-mono shadow-md';

          // NEW 10 Styles
          case 'sticky_tape_top': return 'bg-white shadow-sm border border-slate-200 relative before:content-[""] before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-6 before:bg-white/50 before:backdrop-blur-sm before:rotate-[-2deg] before:shadow-sm';
          case 'sticky_tape_corners': return 'bg-white shadow-sm border border-slate-200 relative before:content-[""] before:absolute before:-top-3 before:-left-3 before:w-10 before:h-4 before:bg-white/50 before:rotate-[-45deg] after:content-[""] after:absolute after:-top-3 after:-right-3 after:w-10 after:h-4 after:bg-white/50 after:rotate-[45deg]';
          case 'comic_dots': return 'bg-white border-2 border-black shadow-[4px_4px_0_black] [background-image:radial-gradient(black_1px,transparent_1px)] [background-size:10px_10px]';
          case 'pixel_bubble': return 'bg-white text-black font-mono border-4 border-black p-4 shadow-none [box-shadow:8px_8px_0_0_rgba(0,0,0,0.2)]';
          case 'wood_dark': return 'bg-[#3e2723] text-[#ffe0b2] border-[4px] border-[#1b0000] shadow-lg rounded-sm';
          case 'metal_rust': return 'bg-[#5d4037] text-[#ffccbc] border-[4px] border-[#3e2723] border-dashed shadow-inner';
          case 'neon_pink': return 'bg-black/90 text-[#ff4081] border border-[#ff4081] shadow-[0_0_15px_#ff4081] rounded-lg';
          case 'neon_blue': return 'bg-black/90 text-[#00bcd4] border border-[#00bcd4] shadow-[0_0_15px_#00bcd4] rounded-lg';
          case 'holographic': return 'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 text-white border-none shadow-lg opacity-90 backdrop-blur-md';
          case 'parchment_old': return 'bg-[#f0e68c] text-[#554433] shadow-md [mask-image:url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E"),linear-gradient(black,black)]';

          // New 10
          case 'chat_bubble_ios': return 'bg-[#007aff] text-white rounded-2xl p-4 shadow-sm';
          case 'toast_dark': return 'bg-[#333] text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2';
          case 'coding_terminal': return 'bg-[#1e1e1e] text-[#00ff00] font-mono border border-[#333] p-4 rounded shadow-md';
          case 'watercolor_patch': return 'bg-pink-100 p-6 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] shadow-sm opacity-90';
          case 'sticky_crumpled': return 'bg-[#fff740] p-4 shadow-md rotate-[-1deg] [mask-image:url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.02\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")]';
          case 'glass_frosted': return 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white';
          case 'neon_frame': return 'border-2 border-[#f0f] shadow-[0_0_10px_#f0f,inset_0_0_10px_#f0f] bg-transparent text-[#f0f] p-4 rounded-lg';
          case 'dashed_cutout': return 'border-2 border-dashed border-gray-400 bg-white p-4 rounded-lg';
          case 'embossed': return 'bg-gray-100 text-gray-700 p-4 rounded shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]';
          case 'cyberpunk_panel': return 'bg-[#0b0b0b] border-l-4 border-yellow-400 text-yellow-400 p-4 font-mono shadow-[5px_5px_0_rgba(250,204,21,0.2)]';

          default: return '';
      }
  };

  const getContainerThemeStyle = (design: CardDesign) => {
      // If a custom background color is selected (not 'auto'), we return base classes
      // and let the inline style handle the color.
      if (data.backgroundColor && data.backgroundColor !== 'auto') {
         // Default text to slate-900 if custom bg is used, unless design overrides
         if (design === 'polaroid' || design === 'phone' || design === 'window' || design === 'browser' || design === 'retro_mac' || design === 'social_post') return 'text-slate-900 shadow-xl';
         if (design === 'game' || design === 'cassette') return 'text-white shadow-xl';
         if (design === 'lock_screen') return 'text-white shadow-xl';
         return 'text-slate-900 shadow-2xl'; // Default container class for custom bg
      }

      // Default Theme Logic
      if (design === 'polaroid') return 'bg-white text-slate-800 shadow-2xl';
      if (design === 'window' || design === 'browser' || design === 'retro_mac' || design === 'social_post') return 'bg-slate-50 text-slate-900 shadow-xl border-slate-300';
      if (design === 'phone') return 'bg-white text-slate-900 border-slate-800';
      if (design === 'game' || design === 'cassette') return 'bg-slate-800 text-white shadow-xl';
      if (design === 'stamp') return ThemeStyles[data.theme] + ' border-[8px] border-white border-dashed shadow-md'; 
      if (design === 'vinyl_record') return 'bg-black text-white shadow-2xl border-none';
      if (design === 'paper_scroll') return 'bg-[#f8f1e0] text-[#5c4d3c] shadow-lg';
      
      return ThemeStyles[data.theme];
  };

  const getRecipientPositionClass = (design: CardDesign) => {
      if (['window', 'browser', 'retro_mac', 'browser_retro', 'browser_popup'].includes(design)) return 'top-14 left-6';
      if (design === 'social_post') return 'top-20 left-6';
      if (design === 'clipboard') return 'top-16 left-6';
      if (design === 'calendar_sheet') return 'top-14 left-6';
      if (design === 'folder') return 'top-8 left-6';
      if (design === 'floppy') return 'top-12 left-6';
      if (design === 'video_thumbnail') return 'top-6 left-6 z-30 drop-shadow-md';
      if (design === 'milk_carton') return 'top-12 left-6';
      return 'top-6 left-6';
  };

  // --- Image Mask Logic ---
  const getImageMaskStyle = (mask: ImageMask): React.CSSProperties => {
      if (mask === 'none') return {};
      if (mask === 'rounded') return { borderRadius: '1rem' };
      if (mask === 'circle') return { borderRadius: '50%' };
      if (mask === 'squircle') return { borderRadius: '25%' };
      if (mask === 'custom') return { borderRadius: `${data.customImageRadius}px` };
      
      if (mask === 'heart') return { clipPath: 'url(#clip-heart)' };
      if (mask === 'cloud') return { clipPath: 'url(#clip-cloud)' };
      if (mask === 'star') return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' };
      if (mask === 'hexagon') return { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
      
      if (mask === 'diamond') return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
      if (mask === 'triangle') return { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' };
      if (mask === 'pentagon') return { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' };
      if (mask === 'octagon') return { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' };
      if (mask === 'blob_1') return { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' };
      if (mask === 'blob_2') return { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' };
      if (mask === 'arch_window') return { borderRadius: '1000px 1000px 0 0' };
      if (mask === 'tear_drop') return { borderRadius: '0 50% 50% 50%', transform: 'rotate(45deg)' }; 
      if (mask === 'flower') return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }; 
      if (mask === 'splatter') return { clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }; 
      
      if (mask === 'cross') return { clipPath: 'polygon(30% 0, 70% 0, 70% 30%, 100% 30%, 100% 70%, 70% 70%, 70% 100%, 30% 100%, 30% 70%, 0 70%, 0 30%, 30% 30%)' };
      if (mask === 'lightning') return { clipPath: 'polygon(40% 0, 60% 0, 40% 50%, 70% 50%, 30% 100%, 40% 60%, 10% 60%)' };
      if (mask === 'cloud_fluffy') return { clipPath: 'polygon(25% 10%, 40% 5%, 60% 10%, 75% 5%, 90% 20%, 95% 40%, 85% 60%, 90% 80%, 70% 90%, 50% 85%, 30% 90%, 10% 80%, 15% 60%, 5% 40%, 10% 20%)', borderRadius: '50%' };
      if (mask === 'stamp_cut') return { maskImage: 'radial-gradient(circle, transparent 4px, black 5px)', maskSize: '15px 15px', maskRepeat: 'round', maskPosition: 'center', padding: '6px' };
      if (mask === 'puzzle_single') return { clipPath: 'polygon(20% 0, 80% 0, 80% 20%, 90% 20%, 90% 40%, 80% 40%, 80% 100%, 0 100%, 0 40%, 10% 40%, 10% 20%, 0 20%)' };

      // NEW 10 Masks
      if (mask === 'shield') return { clipPath: 'polygon(50% 0, 100% 20%, 100% 80%, 50% 100%, 0 80%, 0 20%)' };
      if (mask === 'butterfly') return { clipPath: 'polygon(20% 20%, 40% 30%, 50% 20%, 60% 30%, 80% 20%, 90% 40%, 80% 60%, 50% 70%, 20% 60%, 10% 40%)' }; // approximate
      if (mask === 'maple_leaf') return { clipPath: 'polygon(50% 0%, 60% 30%, 90% 20%, 70% 50%, 90% 80%, 50% 70%, 10% 80%, 30% 50%, 10% 20%, 40% 30%)' }; // approximate
      if (mask === 'sunburst') return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }; // reused star logic for now
      if (mask === 'keyhole') return { clipPath: 'polygon(30% 0, 70% 0, 70% 60%, 90% 100%, 10% 100%, 30% 60%)', borderRadius: '50% 50% 0 0' };
      if (mask === 'parallelogram') return { clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' };
      if (mask === 'trapezoid') return { clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' };
      if (mask === 'ticket_cut') return { maskImage: 'radial-gradient(circle at 0 50%, transparent 20px, black 21px), radial-gradient(circle at 100% 50%, transparent 20px, black 21px)', maskComposite: 'intersect' };
      if (mask === 'chat_bubble') return { borderRadius: '20px 20px 20px 0' };
      if (mask === 'stamp_detailed') return { maskImage: 'radial-gradient(circle, transparent 2px, black 3px)', maskSize: '10px 10px', maskRepeat: 'round' };

      // Old 10
      if (mask === 'ink_splat') return { clipPath: 'polygon(20% 0, 80% 10%, 100% 35%, 90% 80%, 50% 100%, 10% 85%, 0 40%, 10% 10%)' }; 
      if (mask === 'brush_stroke_mask') return { clipPath: 'polygon(0 10%, 100% 0, 95% 90%, 5% 100%)' };
      if (mask === 'puzzle_double') return { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }; 
      if (mask === 'stamp_grunge') return { maskImage: 'radial-gradient(circle, transparent 2px, black 3px)', maskSize: '8px 8px', maskRepeat: 'round' };
      if (mask === 'torn_edge_mask') return { clipPath: 'polygon(0 0, 100% 0, 100% 90%, 95% 100%, 90% 90%, 85% 100%, 80% 90%, 75% 100%, 70% 90%, 65% 100%, 60% 90%, 55% 100%, 50% 90%, 45% 100%, 40% 90%, 35% 100%, 30% 90%, 25% 100%, 20% 90%, 15% 100%, 10% 90%, 5% 100%, 0 90%)' };
      if (mask === 'film_perforated_mask') return { maskImage: 'radial-gradient(circle, transparent 4px, black 5px)', maskSize: '20px 20px', maskPosition: '0 0, 0 100%' };
      if (mask === 'heart_pixel') return { clipPath: 'polygon(20% 20%, 40% 0, 60% 0, 80% 20%, 100% 40%, 50% 90%, 0 40%)' };
      if (mask === 'star_burst') return { clipPath: 'polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)' };
      if (mask === 'cloud_soft') return { borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' };
      if (mask === 'window_arch_gothic') return { borderRadius: '50% 50% 0 0', clipPath: 'polygon(0 50%, 50% 0, 100% 50%, 100% 100%, 0 100%)' };

      // New 10
      if (mask === 'brush_heavy') return { clipPath: 'polygon(5% 0, 95% 5%, 100% 90%, 80% 95%, 10% 100%)' };
      if (mask === 'blob_scatter') return { borderRadius: '64% 36% 27% 73% / 55% 58% 42% 45%' };
      if (mask === 'window_pane') return { clipPath: 'polygon(0 0, 45% 0, 45% 45%, 0 45%, 0 0, 55% 0, 100% 0, 100% 45%, 55% 45%, 55% 0, 0 55%, 45% 55%, 45% 100%, 0 100%, 0 55%, 55% 55%, 100% 55%, 100% 100%, 55% 100%, 55% 55%)' };
      if (mask === 'key_shape') return { clipPath: 'polygon(30% 0, 70% 0, 70% 20%, 60% 20%, 60% 60%, 80% 60%, 80% 70%, 60% 70%, 60% 80%, 80% 80%, 80% 90%, 60% 90%, 60% 100%, 40% 100%, 40% 20%, 30% 20%)' };
      if (mask === 'lamp_bulb') return { borderRadius: '50% 50% 40% 40% / 60% 60% 30% 30%', clipPath: 'polygon(20% 0, 80% 0, 100% 50%, 70% 100%, 30% 100%, 0 50%)' };
      if (mask === 'leaf_monstera') return { borderRadius: '50% 0 50% 50%' };
      if (mask === 'paw_print') return { clipPath: 'circle(15% at 20% 20%), circle(15% at 50% 10%), circle(15% at 80% 20%), circle(30% at 50% 60%)' }; // Requires multiple elements usually, approx with poly or simple shapes. CSS clip-path doesn't support multiple shapes easily without SVG ref. Using fallback circle for now.
      if (mask === 'crown_shape') return { clipPath: 'polygon(0 20%, 25% 80%, 50% 20%, 75% 80%, 100% 20%, 100% 100%, 0 100%)' };
      if (mask === 'dripping_paint') return { clipPath: 'polygon(0 0, 100% 0, 100% 75%, 90% 85%, 80% 75%, 70% 90%, 60% 75%, 50% 85%, 40% 75%, 30% 90%, 20% 75%, 10% 85%, 0 75%)' };
      if (mask === 'slash_cut') return { clipPath: 'polygon(20% 0, 100% 0, 80% 100%, 0% 100%)' };

      // New 10 (Last Batch)
      if (mask === 'bevel_corners') return { clipPath: 'polygon(20% 0, 80% 0, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0 80%, 0 20%)' };
      if (mask === 'ticket_stub_vertical') return { maskImage: 'radial-gradient(circle at 50% 0, transparent 15px, black 16px), radial-gradient(circle at 50% 100%, transparent 15px, black 16px)', maskComposite: 'intersect' };
      if (mask === 'shield_round') return { borderRadius: '0 0 50% 50%' };
      if (mask === 'blob_organic_3') return { borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%' };
      if (mask === 'star_fat_5') return { clipPath: 'polygon(50% 0%, 63% 38%, 100% 38%, 69% 59%, 82% 100%, 50% 75%, 18% 100%, 31% 59%, 0% 38%, 37% 38%)' };
      if (mask === 'cross_rounded') return { clipPath: 'polygon(20% 0, 80% 0, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0 80%, 0 20%, 20% 20%)', borderRadius: '1rem' }; // Radius trick doesn't work well with polygon, leaving straight polygon
      if (mask === 'leaf_pointed') return { borderRadius: '0 50% 0 50%' };
      if (mask === 'hexagon_soft') return { clipPath: 'polygon(25% 5%, 75% 5%, 95% 50%, 75% 95%, 25% 95%, 5% 50%)', borderRadius: '20px' };
      if (mask === 'message_box_tail') return { clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)' };
      if (mask === 'stamp_circle_notch') return { maskImage: 'radial-gradient(circle, black 60%, transparent 65%)', maskSize: '20px 20px', maskRepeat: 'repeat' }; // Experimental for inverse dots, fallback simple circle

      return {};
  };

  // --- Image Border Class Logic ---
  const getImageBorderClass = (border: ImageBorder) => {
      switch (border) {
          case 'solid_thin': return 'border border-current';
          case 'solid_thick': return 'border-4 border-current';
          case 'dashed': return 'border-4 border-dashed border-current';
          case 'dotted': return 'border-4 border-dotted border-current';
          case 'double': return 'border-8 border-double border-current';
          case 'groove': return 'border-8 border-slate-300 [border-style:groove]';
          case 'ridge': return 'border-8 border-slate-300 [border-style:ridge]';
          case 'offset': return 'outline outline-2 outline-offset-4 outline-current';
          case 'neon': return 'border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_rgba(255,255,255,0.4)]';
          case 'hand_drawn': return 'border-2 border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px]';
          
          case 'inset': return 'border-[8px] border-slate-200 [border-style:inset]';
          case 'outset': return 'border-[8px] border-slate-200 [border-style:outset]';
          case 'thick_double': return 'border-[12px] border-double border-current';
          case 'outline_dashed': return 'outline outline-4 outline-dashed outline-offset-4 outline-current';
          case 'layered_white': return 'border-4 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.1),0_0_0_6px_white]';
          case 'ring_simple': return 'ring-4 ring-current ring-inset';
          case 'gold_trim': return 'border-2 border-yellow-500 ring-2 ring-yellow-200';
          case 'silver_trim': return 'border-2 border-slate-400 ring-2 ring-slate-200';
          case 'soft_glow': return 'shadow-[0_0_20px_rgba(255,255,255,0.6)]';
          case 'vintage_frame': return 'border-[6px] border-[#8b4513] [border-style:ridge] ring-2 ring-[#d2b48c]';

          case 'rainbow': return 'border-[6px] border-transparent [background-image:linear-gradient(white,white),linear-gradient(to_right,red,orange,yellow,green,blue,indigo,violet)] [background-origin:border-box] [background-clip:content-box,border-box]';
          case 'corner_brackets': return 'border-none relative after:absolute after:top-0 after:left-0 after:w-4 after:h-4 after:border-t-4 after:border-l-4 after:border-current before:absolute before:bottom-0 before:right-0 before:w-4 before:h-4 before:border-b-4 before:border-r-4 before:border-current'; // Pseudo not easy here without dedicated div
          case 'zigzag_border': return 'border-[8px] border-transparent [border-image:repeating-linear-gradient(45deg,red_0,red_10px,transparent_0,transparent_20px)_20]'; // Experimental
          case 'film_perforation': return 'border-x-[12px] border-black border-dashed';
          case 'tape_corners': return 'border-none shadow-md'; 

          case 'braided': return 'border-4 border-dashed border-slate-400 rounded-sm'; 
          case 'chain': return 'border-4 border-dotted border-slate-500 rounded-full'; 
          case 'lace': return 'border-[8px] border-white border-dotted shadow-sm';
          case 'pearls': return 'border-[4px] border-white border-dotted ring-1 ring-slate-200';
          case 'scalloped': return 'p-2 bg-white [mask-image:radial-gradient(circle,white_0,white_5px,transparent_6px)] [mask-size:12px_12px]'; 
          case 'film_slide': return 'bg-white p-4 pb-8 shadow-md text-center';
          case 'gradient_ring': return 'border-4 border-transparent bg-gradient-to-r from-pink-500 to-yellow-500 bg-origin-border';
          case 'glitch': return 'border-2 border-red-500 shadow-[2px_0_0_blue,-2px_0_0_green]';
          case 'sketchy_double': return 'border-2 border-black rounded-sm outline outline-2 outline-black outline-offset-4 [transform:rotate(1deg)]';
          case 'rainbow_dashed': return 'border-4 border-dashed border-indigo-400 ring-2 ring-pink-300 ring-offset-2';

          // NEW 10 Borders
          case 'vignette': return 'shadow-[inset_0_0_20px_20px_rgba(0,0,0,0.5)]';
          case 'notched': return '[clip-path:polygon(10%_0,100%_0,100%_90%,90%_100%,0_100%,0_10%)]';
          case 'feathered': return '[mask-image:radial-gradient(circle,black_60%,transparent_100%)]';
          case 'crosshair': return 'relative after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-[1px] after:bg-white/30 before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-[1px] before:h-full before:bg-white/30 border border-white/50';
          case 'warning': return 'border-[8px] border-yellow-400 [border-image:repeating-linear-gradient(45deg,yellow_0,yellow_10px,black_10px,black_20px)_20]';
          case 'stitching': return 'border-4 border-transparent outline outline-2 outline-dashed outline-white -outline-offset-8 shadow-[0_0_0_4px_rgba(0,0,0,0.2)]';
          case 'scanner': return 'relative overflow-hidden after:content-[""] after:absolute after:top-0 after:left-0 after:w-full after:h-[2px] after:bg-green-400 after:shadow-[0_0_10px_#4ade80] after:animate-[scanline_2s_linear_infinite] border border-green-500/50';
          case 'crt': return 'relative after:content-[""] after:absolute after:inset-0 after:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] after:bg-[length:100%_2px,3px_100%] after:pointer-events-none';
          case 'blueprint_grid': return 'border-2 border-white/50 [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:20px_20px]';
          case 'glowing_edges': return 'shadow-[0_0_10px_cyan,0_0_20px_magenta] border-2 border-white/20';

          default: return '';
      }
  };

  // Determine inline styles for the main card container
  const getContainerInlineStyle = () => {
     const style: React.CSSProperties = {
         minHeight: '600px',
     };
     
     // Apply custom background color if set
     if (data.backgroundColor && data.backgroundColor !== 'auto') {
         style.backgroundColor = data.backgroundColor;
         // Clean border if custom color is used, as theme classes might add borders that clash
         style.borderColor = 'transparent'; 
     }

     return style;
  };

  return (
    <div className={`h-full w-full flex flex-col items-center justify-center p-4 lg:p-6 overflow-y-auto transition-colors duration-500 ${isViewMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
      
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
            <clipPath id="clip-heart" clipPathUnits="objectBoundingBox">
                <path d="M0.5,0.887 C0.117,0.667,0,0.47,0,0.297 C0,0.133,0.133,0,0.297,0 C0.39,0,0.473,0.043,0.5,0.11 C0.527,0.043,0.61,0,0.703,0 C0.867,0,1,0.133,1,0.297 C1,0.47,0.883,0.667,0.5,0.887" />
            </clipPath>
            <clipPath id="clip-cloud" clipPathUnits="objectBoundingBox">
                <path d="M0.25,0.56 C0.25,0.72,0.37,0.85,0.52,0.85 C0.54,0.85,0.55,0.85,0.56,0.84 C0.6,0.94,0.7,1,0.8,1 C0.91,1,1,0.91,1,0.8 C1,0.79,1,0.79,1,0.78 C1,0.78,1,0.77,1,0.77 C1,0.77,1,0.76,1,0.76 C1,0.72,0.99,0.68,0.96,0.65 C0.98,0.61,1,0.56,1,0.5 C1,0.33,0.87,0.2,0.7,0.2 C0.68,0.2,0.66,0.2,0.64,0.21 C0.6,0.09,0.48,0,0.35,0 C0.18,0,0.04,0.12,0.01,0.28 C0.01,0.28,0,0.28,0,0.3 C0,0.44,0.11,0.55,0.25,0.56" transform="scale(0.85, 0.85) translate(0.08, 0)" />
            </clipPath>
        </defs>
      </svg>

      {/* Toolbar */}
      <div className={`w-full max-w-lg md:max-w-xl flex justify-end mb-4 shrink-0 gap-2 transition-opacity duration-300 z-50 ${isViewMode ? 'fixed top-6 right-6' : 'relative'}`}>
        {!isViewMode ? (
          <>
            <button 
               onClick={onToggleViewMode}
               className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm transition-colors text-sm font-bold border border-slate-200"
            >
                <Smartphone className="w-4 h-4" />
                카드만 보기
            </button>
            <button 
               onClick={handleDownload}
               disabled={isDownloading}
               className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-colors text-sm font-bold ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
            >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isDownloading ? '저장 중...' : '이미지 저장'}
            </button>
          </>
        ) : (
          <>
             <button 
               onClick={handleDownload}
               disabled={isDownloading}
               className={`flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg transition-all font-bold text-sm ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
               title="이미지 저장"
             >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isDownloading ? '저장 중...' : '이미지 저장'}</span>
             </button>
             <button 
                onClick={onToggleViewMode}
                className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10"
                title="닫기"
             >
                <X className="w-5 h-5" />
             </button>
          </>
        )}
      </div>

      {/* Card Container */}
      <div 
         ref={cardRef}
         onPointerDown={(e) => {
             // Deselect when clicking background
             if (e.target === cardRef.current || e.target === e.currentTarget) {
                 setSelectedId(null);
             }
         }}
         style={getContainerInlineStyle()}
         className={`relative w-full max-w-lg md:max-w-xl shadow-2xl overflow-hidden flex flex-col items-center justify-between transition-all duration-700 ${getContainerThemeStyle(data.design)} ${getContainerShapeClass(data.design)} lg:min-h-[700px]`}
      >
          {data.design === 'phone' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
          )}
          {['window', 'browser', 'retro_mac', 'browser_retro', 'browser_popup'].includes(data.design) && (
              <div className={`w-full h-10 ${data.design === 'retro_mac' ? 'bg-white border-b-2 border-black' : 'bg-slate-100 border-b border-slate-300'} flex items-center px-4 gap-2 shrink-0 absolute top-0 left-0 right-0 z-20`}>
                  {data.design === 'retro_mac' ? (
                      <>
                        <div className="w-4 h-4 border border-black bg-white shadow-[1px_1px_0_black]"></div>
                        <div className="flex-1 text-center font-bold text-sm tracking-wide bg-[linear-gradient(90deg,black_1px,transparent_1px)] bg-[size:3px_100%] h-4 opacity-20"></div>
                      </>
                  ) : (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-500 shadow-sm"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500 shadow-sm"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-emerald-500 shadow-sm"></div>
                        <div className="flex-1 text-center text-xs text-slate-500 font-mono tracking-tight opacity-70">
                            {data.design === 'browser' ? 'https://love-letter.com' : 'message.card'}
                        </div>
                      </>
                  )}
              </div>
          )}
          {data.design === 'social_post' && (
               <div className="w-full h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-3 shrink-0 absolute top-0 left-0 right-0 z-20">
                   <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                   <div className="text-sm font-bold">your_story</div>
                   <div className="ml-auto text-xl">...</div>
               </div>
          )}
          {data.design === 'game' && (
              <div className="absolute top-4 left-4 flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <div className="text-[10px] font-mono text-green-400">BATTERY OK</div>
              </div>
          )}
          
          {data.design === 'notebook_hole' && (
              <div className="absolute top-0 left-0 bottom-0 w-8 border-r border-black/5 bg-transparent z-20 pointer-events-none"></div>
          )}
          
          {/* Tag Hole */}
          {data.design === 'tag' && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-200 rounded-full border border-black/10 shadow-inner z-20"></div>
          )}

          {/* Draggable Recipient */}
          {data.recipient && (
              <div 
                  className={`absolute z-30 font-bold group/recipient cursor-move ${getRecipientPositionClass(data.design)}`}
                  style={{
                      transform: `translate(${data.recipientPosition.x}px, ${data.recipientPosition.y}px)`,
                      touchAction: 'none'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'recipient')}
              >
                  <div className="absolute -top-3 -left-3 p-1 bg-black/10 rounded-full opacity-0 group-hover/recipient:opacity-100 transition-opacity pointer-events-none">
                    <Move className="w-3 h-3 text-black/50" />
                 </div>
                  To. {data.recipient}
              </div>
          )}

          <div className={`w-full ${['window', 'browser', 'retro_mac', 'browser_retro'].includes(data.design) ? 'pt-12' : data.design === 'social_post' ? 'pt-20' : 'pt-8'}`}></div>
          
          {/* 1. Image Area (Draggable & Resizable) */}
          <div className="w-full flex flex-col items-center mb-0 shrink-0 relative z-10 px-0 group/img">
             <div 
                 className={`
                 relative transition-shadow duration-300 cursor-move box-content
                 ${data.design === 'polaroid' ? 'border-[16px] border-white bg-slate-100 shadow-xl' : ''}
                 ${selectedId === 'image-box' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                 `}
                 style={{ 
                    width: ['polaroid'].includes(data.design) ? `${Math.min(data.imageWidth, 90)}%` : `${data.imageWidth}%`,
                    height: data.design === 'polaroid' ? 'auto' : `${data.imageHeight}px`,
                    transform: `translate(${data.imagePosition.x}px, ${data.imagePosition.y}px)`,
                    touchAction: 'none'
                 }}
                 onPointerDown={(e) => handlePointerDown(e, 'image')}
             >
                 {/* Drag Hint */}
                 <div className="absolute top-2 right-2 p-1 bg-black/30 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity z-10 pointer-events-none">
                    <Move className="w-4 h-4 text-white" />
                 </div>

                 {/* Resize Handle (Bottom Right) */}
                 <div 
                     className="absolute -bottom-3 -right-3 p-1.5 bg-white border border-slate-300 rounded-full text-slate-700 shadow-sm cursor-nwse-resize opacity-0 group-hover/img:opacity-100 hover:opacity-100 hover:bg-slate-50 z-50 transition-opacity"
                     onPointerDown={(e) => handlePointerDown(e, 'image', 'resize')}
                 >
                     <Scaling className="w-4 h-4" />
                 </div>
                 
                 {/* Special handling for corner brackets border which uses pseudo elements on container, or just add div overlay */}
                 {data.imageBorder === 'corner_brackets' && (
                     <div className="absolute inset-0 pointer-events-none z-20">
                         <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-current"></div>
                         <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-current"></div>
                         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-current"></div>
                         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-current"></div>
                     </div>
                 )}
                 {data.imageBorder === 'tape_corners' && (
                     <div className="absolute inset-0 pointer-events-none z-20">
                         <div className="absolute -top-2 -left-2 w-12 h-4 bg-yellow-200/80 rotate-[-45deg] shadow-sm"></div>
                         <div className="absolute -top-2 -right-2 w-12 h-4 bg-yellow-200/80 rotate-[45deg] shadow-sm"></div>
                         <div className="absolute -bottom-2 -left-2 w-12 h-4 bg-yellow-200/80 rotate-[45deg] shadow-sm"></div>
                         <div className="absolute -bottom-2 -right-2 w-12 h-4 bg-yellow-200/80 rotate-[-45deg] shadow-sm"></div>
                     </div>
                 )}

                 <div 
                    className={`w-full h-full overflow-hidden ${getImageBorderClass(data.imageBorder)}`}
                    style={{
                        ...getImageMaskStyle(data.imageMask),
                        height: data.design === 'polaroid' ? `${data.imageHeight}px` : '100%', 
                    }}
                 >
                    {data.imageUrl ? (
                        <img 
                        src={data.imageUrl} 
                        alt="Card Image" 
                        className={`w-full h-full object-cover pointer-events-none`}
                        crossOrigin="anonymous" 
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 text-current opacity-30">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-sm font-medium">이미지 없음</span>
                        </div>
                    )}
                 </div>
             </div>
          </div>

          {/* English Caption (Moved Between Image and Message) */}
          {data.englishCaption && (
            <div 
                className={`group/caption cursor-move relative z-20 my-4 ${selectedId === 'caption-box' ? 'ring-1 ring-indigo-300 ring-offset-2 rounded-lg' : ''}`}
                style={{
                    transform: `translate(${data.englishCaptionPosition.x}px, ${data.englishCaptionPosition.y}px) scale(${data.englishCaptionScale || 1})`,
                    touchAction: 'none'
                }}
                onPointerDown={(e) => handlePointerDown(e, 'caption')}
            >
                 {/* Resize Handle for Caption */}
                 <div 
                     className="absolute -right-6 bottom-1/2 translate-y-1/2 p-1 bg-white border border-slate-300 rounded-full text-slate-700 shadow-sm cursor-ew-resize opacity-0 group-hover/caption:opacity-100 hover:opacity-100 hover:bg-slate-50 z-50 transition-opacity"
                     onPointerDown={(e) => handlePointerDown(e, 'caption', 'scale')}
                 >
                     <Scaling className="w-3 h-3" />
                 </div>

                 <p className="text-center font-serif italic opacity-90 text-sm md:text-base pointer-events-none select-none px-4">
                     {data.englishCaption}
                 </p>
            </div>
          )}

          {/* 2. Message Box (Draggable & Resizable) */}
          <div className="w-full px-4 flex-1 flex flex-col items-center justify-center min-h-[150px] z-20 pb-12 relative">
             <div 
                className={`transition-all duration-75 relative cursor-move group/msg ${getMessageBoxClass(data.messageBoxStyle)} ${selectedId === 'message-box' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                style={{
                  transform: `translate(${data.messagePosition.x}px, ${data.messagePosition.y}px)`,
                  touchAction: 'none',
                  width: `${data.messageBoxWidth}%`,
                  padding: `${data.messageBoxPadding}px`,
                }}
                onPointerDown={(e) => handlePointerDown(e, 'message')}
             >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 bg-black/10 rounded-full opacity-0 group-hover/msg:opacity-100 transition-opacity pointer-events-none">
                    <Move className="w-3 h-3 text-black/50" />
                </div>

                {/* Resize Handle (Bottom Right - Width Only usually) */}
                <div 
                     className="absolute -bottom-3 -right-3 p-1.5 bg-white border border-slate-300 rounded-full text-slate-700 shadow-sm cursor-ew-resize opacity-0 group-hover/msg:opacity-100 hover:opacity-100 hover:bg-slate-50 z-50 transition-opacity"
                     onPointerDown={(e) => handlePointerDown(e, 'message', 'resize')}
                 >
                     <Scaling className="w-4 h-4" />
                 </div>

                <div className="flex flex-col h-full pointer-events-none select-none">
                    <p 
                        className={`leading-relaxed whitespace-pre-wrap break-keep w-full ${data.alignment}`} 
                        style={{ 
                            fontFamily: data.font,
                            fontSize: `${data.fontSize}px` 
                        }}
                    >
                        {data.message || "여기에 마음을 담은 메시지가 표시됩니다.\nAI에게 작성을 부탁해보세요!"}
                    </p>
                </div>
             </div>
          </div>

          {/* 3. Stickers / Decorations (Draggable, Rotatable, Scalable) */}
          {data.decorations.map((deco) => {
              const isSelected = selectedId === deco.id;
              const isLongText = deco.content.length > 4; // Check if it's a divider or long text
              
              return (
                <div
                    key={deco.id}
                    id={`deco-${deco.id}`}
                    className={`absolute z-40 select-none group/deco ${isSelected ? 'z-50 cursor-move' : 'cursor-pointer'}`}
                    style={{
                        transform: `translate(${deco.x}px, ${deco.y}px) rotate(${deco.rotation}deg) scale(${deco.scale})`,
                        touchAction: 'none',
                    }}
                    onPointerDown={(e) => {
                        // If handles are clicked, this won't fire because of stopPropagation in handles
                        handlePointerDown(e, 'decoration', 'move', deco.id);
                    }}
                >
                    <div className={`relative ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-transparent rounded-lg' : ''}`}>
                        <span className={`${isLongText ? 'text-xl whitespace-nowrap' : 'text-6xl'} filter drop-shadow-sm`}>{deco.content}</span>
                        
                        {/* Controls Overlay */}
                        {isSelected && (
                            <>
                                {/* Delete Button - Top Right */}
                                <button 
                                    className="absolute -top-6 -right-6 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                                    onPointerDown={(e) => {
                                        e.stopPropagation();
                                        removeDecoration(deco.id);
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Rotate Handle - Top Center */}
                                <div 
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-300 rounded-full text-slate-700 flex items-center justify-center shadow-sm cursor-grab active:cursor-grabbing hover:bg-slate-50"
                                    onPointerDown={(e) => handlePointerDown(e, 'decoration', 'rotate', deco.id)}
                                >
                                    <RotateCw className="w-3.5 h-3.5" />
                                </div>

                                {/* Scale Handle - Bottom Right */}
                                <div 
                                    className="absolute -bottom-4 -right-4 w-6 h-6 bg-white border border-slate-300 rounded-full text-slate-700 flex items-center justify-center shadow-sm cursor-nwse-resize hover:bg-slate-50"
                                    onPointerDown={(e) => handlePointerDown(e, 'decoration', 'scale', deco.id)}
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
              );
          })}

          {/* Draggable Sender */}
          {(data.sender || data.senderLabel) && (
              <div 
                  className="absolute bottom-6 right-6 z-30 font-bold text-right group/sender cursor-move"
                  style={{
                      transform: `translate(${data.senderPosition.x}px, ${data.senderPosition.y}px)`,
                      touchAction: 'none'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'sender')}
              >
                  <div className="absolute -top-3 -right-3 p-1 bg-black/10 rounded-full opacity-0 group-hover/sender:opacity-100 transition-opacity pointer-events-none">
                    <Move className="w-3 h-3 text-black/50" />
                 </div>
                  {data.senderLabel || (data.sender ? "From." : "")} {data.sender}
              </div>
          )}

      </div>
      
      <div className="h-20 shrink-0"></div>
    </div>
  );
};

export default PreviewPanel;