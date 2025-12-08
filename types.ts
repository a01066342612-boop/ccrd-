export enum CardTheme {
  Christmas = '크리스마스',
  Birthday = '생일',
  NewYear = '새해',
  ThankYou = '감사',
  Love = '사랑',
  Congratulation = '축하',
  Graduation = '졸업',
  Wedding = '결혼',
  CheerUp = '응원',
  Apology = '사과',
  Invitation = '초대',
  Other = '기타'
}

export type CardAlignment = 'text-left' | 'text-center' | 'text-right' | 'text-justify';

export type CardDesign = 
  'rectangle' | 'ticket' | 'heart' | 'frame' | 'polaroid' | 'window' | 'stamp' | 'cloud' | 'phone' | 'game' | 'auto' |
  'arch' | 'tag' | 'hexagon_shape' | 'folder' | 'notebook_hole' | 'receipt' | 'film_strip' | 'browser' | 'book_cover' | 'mirror' |
  'origami_bird' | 'origami_boat' | 'origami_plane' | 'envelope_open' | 'paper_scroll' | 'clipboard' | 'puzzle_piece' | 'speech_bubble_shape' | 'calendar_sheet' | 'vinyl_record' |
  'passport' | 'credit_card' | 'cassette' | 'floppy' | 'certificate' | 'wanted' | 'social_post' | 'video_thumbnail' | 'messenger' | 'retro_mac';

export type MessageLength = 'xshort' | 'short' | 'medium' | 'long' | 'xlong';

export type MessageBoxStyle = 
  'none' | 'paper' | 'bubble' | 'notebook' | 'classic' | 'postit' | 'vintage' | 'ribbon' | 'translucent' | 'brush' | 'outline' | 'dashed' | 'double' | 'shimmer' | 'brutal' | 'neon' |
  'tape' | 'torn_paper' | 'gradient_border' | 'glass_dark' | 'terminal' | 'comic' | 'sketch' | 'plaque' | 'minimal_under' | 'elegant' |
  'rpg_dialog' | 'scroll_h' | 'ticket_stub' | 'post_stamp' | 'plaque_wooden' | 'plaque_stone' | 'cyber_hud' | 'leaf' | 'shout' | 'blob_soft' |
  'notification' | 'chat_send' | 'chat_receive' | 'steampunk' | 'blueprint' |
  'sticky_tape_top' | 'sticky_tape_corners' | 'comic_dots' | 'pixel_bubble' | 'wood_dark' | 'metal_rust' | 'neon_pink' | 'neon_blue' | 'holographic' | 'parchment_old';

export type ImageMask = 
  'none' | 'rounded' | 'circle' | 'squircle' | 'heart' | 'cloud' | 'star' | 'hexagon' | 'custom' |
  'diamond' | 'triangle' | 'pentagon' | 'octagon' | 'blob_1' | 'blob_2' | 'arch_window' | 'tear_drop' | 'flower' | 'splatter' |
  'cross' | 'lightning' | 'cloud_fluffy' | 'stamp_cut' | 'puzzle_single' |
  'shield' | 'butterfly' | 'maple_leaf' | 'sunburst' | 'keyhole' | 'parallelogram' | 'trapezoid' | 'ticket_cut' | 'chat_bubble' | 'stamp_detailed';

// PhotoFrame types removed

export type ImageBorder = 
  'none' | 'solid_thin' | 'solid_thick' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'offset' | 'neon' | 'hand_drawn' |
  'inset' | 'outset' | 'thick_double' | 'outline_dashed' | 'layered_white' | 'ring_simple' | 'gold_trim' | 'silver_trim' | 'soft_glow' | 'vintage_frame' |
  'rainbow' | 'corner_brackets' | 'zigzag_border' | 'film_perforation' | 'tape_corners' |
  'braided' | 'chain' | 'lace' | 'pearls' | 'scalloped' | 'film_slide' | 'gradient_ring' | 'glitch' | 'sketchy_double' | 'rainbow_dashed';

export interface Decoration {
  id: string;
  content: string; // Emoji character
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface CardData {
  theme: CardTheme;
  customTheme: string;
  
  // New Background Color Field
  backgroundColor: string; // 'auto' or hex code

  recipient: string;
  recipientPosition: { x: number; y: number }; 
  sender: string;
  senderLabel: string;
  senderPosition: { x: number; y: number }; 
  
  englishCaption: string;
  englishCaptionPosition: { x: number; y: number };

  message: string;
  messageLength: MessageLength;
  
  imageUrl: string | null;
  font: string;
  fontSize: number;
  alignment: CardAlignment;
  
  imageStyle: string;
  imageSubject: string;
  imageWidth: number;
  imageHeight: number;
  imagePosition: { x: number; y: number };
  
  imageMask: ImageMask;
  customImageRadius: number; 
  
  // photoFrame removed
  imageBorder: ImageBorder;

  design: CardDesign;
  
  messageBoxStyle: MessageBoxStyle;
  messagePosition: { x: number; y: number };
  messageBoxWidth: number; 
  messageBoxPadding: number; 

  stickerSet: string[];
  customStickerTopic: string; 
  decorations: Decoration[]; 
}

export interface GeminiError {
  message: string;
}

export const FontOptions = [
  { name: '기본 고딕 (Noto Sans)', value: 'Noto Sans KR' },
  { name: '기본 명조 (Noto Serif)', value: 'Noto Serif KR' },
  { name: '나눔 손글씨 펜', value: 'Nanum Pen Script' },
  { name: '하이 멜로디', value: 'Hi Melody' },
  { name: '개구쟁이', value: 'Gaegu' },
  { name: '연성체', value: 'Yeon Sung' },
  { name: '싱글데이', value: 'Single Day' },
  { name: '귀여운 폰트', value: 'Cute Font' },
  { name: '도현체', value: 'Do Hyeon' },
  { name: '주아체', value: 'Jua' },
  { name: '검은 고딕', value: 'Black Han Sans' },
  { name: '감자꽃', value: 'Gamja Flower' },
  { name: '해바라기', value: 'Sunflower' },
  { name: '고운 돋움', value: 'Gowun Dodum' },
  { name: '고운 바탕', value: 'Gowun Batang' },
  { name: '영문 필기체 (Dancing Script)', value: 'cursive' },
  // New Fonts (10)
  { name: '나눔 붓글씨', value: 'Nanum Brush Script' },
  { name: '동글', value: 'Dongle' },
  { name: '구기', value: 'Gugig' },
  { name: '함렛', value: 'Hahmlet' },
  { name: '기랑해랑', value: 'Kirang Haerang' },
  { name: '푸어 스토리', value: 'Poor Story' },
  { name: '송명', value: 'Song Myung' },
  { name: '스타일리시', value: 'Stylish' },
  { name: '독도체', value: 'Dokdo' },
  { name: '동해 독도체', value: 'East Sea Dokdo' },
];

export const ImageStyleGroups = {
  '한국/동양의 미': [
    { name: '한국화 (Korean Painting)', value: 'Korean Traditional Painting, Sumukhwa, Soft Ink Wash, Natural Colors' },
    { name: '동양화 (Oriental)', value: 'Oriental Painting, Elegant Lines, East Asian Art Style, Nature' },
    { name: '문인화 (Literati)', value: 'Literati Painting, Muninhwa, Scholar Art, Four Gentlemen plants, Minimalist' },
    { name: '민화 (Folk Painting)', value: 'Korean Folk Painting, Minhwa, Tiger and Magpie, Colorful' },
    { name: '단청 (Dancheong)', value: 'Korean Traditional Dancheong Patterns, Wooden Architecture Colors' },
    { name: '나전칠기 (Mother-of-pearl)', value: 'Korean Mother-of-pearl Lacquerware Style, Iridescent, Black Background' },
    { name: '우키요에 (Hokusai)', value: 'Katsushika Hokusai Style, Ukiyo-e Woodblock Print, Bold Outlines, Flat Colors' },
    { name: '고려청자 (Celadon)', value: 'Goryeo Celadon Style, Jade Green, Inlaid Pattern, Korean Pottery Texture' },
    { name: '조각보 (Jogakbo)', value: 'Korean Traditional Patchwork, Jogakbo, Geometric Patterns, Fabric Texture, Harmony of Colors' },
    { name: '수묵담채화 (Ink & Wash)', value: 'Korean Ink and Wash Painting with Light Color, Elegant, Soft, Empty Space Aesthetic' },
  ],
  '서양 명화/거장': [
    { name: '빈센트 반 고흐 (Impasto)', value: 'Vincent van Gogh Style, Starry Night swirls, Thick Impasto' },
    { name: '클로드 모네 (Impressionism)', value: 'Claude Monet Style, Impressionism, Light and Color' },
    { name: '요하네스 베르메르 (Baroque)', value: 'Johannes Vermeer Style, Baroque, Masterful Light and Shadow, Realistic' },
    { name: '구스타프 클림트 (Gold)', value: 'Gustav Klimt Style, Golden Patterns, Art Nouveau' },
    { name: '알폰스 무하 (Art Nouveau)', value: 'Alphonse Mucha Style, Art Nouveau, Elegant Lines, Flowers' },
    { name: '르네 마그리트 (Surrealism)', value: 'Rene Magritte Style, Surrealism, Mystery, Bowler Hats' },
    { name: '살바도르 달리 (Surrealism)', value: 'Salvador Dali Style, Surrealism, Dreamlike, Melting' },
    { name: '파블로 피카소 (Cubism)', value: 'Pablo Picasso Style, Cubism, Abstract Geometry' },
    { name: '앙리 마티스 (Fauvism)', value: 'Henri Matisse Style, Fauvism, Bold Colors and Cutouts' },
    { name: '에드워드 호퍼 (Realism)', value: 'Edward Hopper Style, American Realism, Solitude, Shadows' },
    { name: '프리다 칼로 (Folk)', value: 'Frida Kahlo Style, Mexican Folk Art, Nature and Self' },
    { name: '몬드리안 (De Stijl)', value: 'Piet Mondrian Style, De Stijl, Primary Colors, Grid, Geometric' },
    { name: '잭슨 폴록 (Action)', value: 'Jackson Pollock Style, Action Painting, Drip Painting, Chaotic Splatter' },
    { name: '앤디 워홀 (Pop Art)', value: 'Andy Warhol Style, Pop Art, Screen Print, Vibrant' },
    { name: '로이 리히텐슈타인 (Comic)', value: 'Roy Lichtenstein Style, Pop Art, Comic Book Dots' },
    { name: '장 미셸 바스키아 (Graffiti)', value: 'Jean-Michel Basquiat Style, Neo-expressionism, Graffiti, Chaotic' },
    { name: '렘브란트 (Chiaroscuro)', value: 'Rembrandt Style, Dramatic Chiaroscuro Lighting, Deep Shadows, Golden Glow, Portraiture' },
    { name: '조르주 쇠라 (Pointillism)', value: 'Georges Seurat Style, Pointillism, Dots of Color, Optical Mixing, Sunday Afternoon' },
    { name: '마크 로스코 (Color Field)', value: 'Mark Rothko Style, Color Field Painting, Large Blocks of Solid Color, Emotional, Abstract' },
  ],
  '회화/드로잉 기법': [
    { name: '수채화 (Watercolor)', value: 'Soft Watercolor Painting' },
    { name: '유화 (Oil Painting)', value: 'Classic Oil Painting, Textured Brushstrokes' },
    { name: '아크릴 (Acrylic)', value: 'Acrylic Painting, Bold Colors, Modern' },
    { name: '과슈 (Gouache)', value: 'Gouache Painting, Opaque Watercolor, Matte Finish, Vibrant Colors, Flat Design' },
    { name: '파스텔 (Pastel)', value: 'Soft Pastel Drawing, Chalky Texture, Gentle Blending, Dreamy' },
    { name: '연필 스케치 (Pencil)', value: 'Pencil Sketch, Graphite, Rough Lines' },
    { name: '목탄 (Charcoal)', value: 'Charcoal Drawing, Dramatic Shadows, Smudged' },
    { name: '크레용 (Crayon)', value: 'Childlike Crayon Drawing, Colorful, Texture' },
    { name: '칠판 아트 (Chalk)', value: 'Chalkboard Art, White Chalk on Black Board, Dusty Texture' },
    { name: '펜화 (Pen & Ink)', value: 'Pen and Ink Drawing, Crosshatching, Fine Details, Black and White, Illustration' },
    { name: '마카 아트 (Marker)', value: 'Alcohol Marker Art, Copic Style, Vibrant, Blended, Illustration, Pop' },
    { name: '스프레이 아트 (Spray)', value: 'Spray Paint Art, Airbrush, Street Style, Stencil, Gradient' },
  ],
  '공예/입체/질감': [
    { name: '종이접기 (Origami)', value: 'Origami Style, Folded Paper Art, Geometric Shapes, Paper Texture, 3D' },
    { name: '종이 퀼링 (Quilling)', value: 'Paper Quilling Art, Rolled Paper Strips, 3D Effect' },
    { name: '종이 오리기 (Paper Cutout)', value: 'Layered Paper Cutout Art, Shadow Box Style' },
    { name: '마크라메 (Macrame)', value: 'Macrame Art, Knotted Cotton Rope, Boho Style, Texture' },
    { name: '가죽 공예 (Leather)', value: 'Leather Craft Style, Embossed Leather Texture, Stitches, Warm Tones' },
    { name: '비즈 아트 (Beads)', value: 'Bead Art, Fuse Beads, Pixelated Texture, Plastic Gloss' },
    { name: '모래 예술 (Sand Art)', value: 'Sand Art in a Bottle Style, Layered Colored Sand, Grainy Texture' },
    { name: '펠트 공예 (Felt)', value: 'Needle Felted Wool Art, Fuzzy, Soft Texture' },
    { name: '털실 (Knitting)', value: 'Knitted Wool Texture, Cozy, Warm' },
    { name: '자수 (Embroidery)', value: 'Embroidery Art, Stitched Texture, Fabric' },
    { name: '리노컷 (Linocut)', value: 'Linocut Print, Block Printing, Bold Lines, Texture' },
    { name: '스테인드 글라스', value: 'Stained Glass Art, Colorful, Light through Glass' },
    { name: '모자이크 (Mosaic)', value: 'Mosaic Tile Art, Ancient Roman Style' },
    { name: '콜라주 (Collage)', value: 'Mixed Media Collage, Cut Paper, Magazine Clippings' },
    { name: '마블링 (Marbling)', value: 'Paper Marbling, Swirling Ink, Suminagashi' },
    { name: '클레이 (Clay)', value: 'Cute Claymation, Polymer Clay Style' },
    { name: '도자기 (Ceramic)', value: 'Ceramic Art Style, Glazed Pottery Texture, Shiny, Sculptural, Handcrafted' },
    { name: '목공예 (Wood Carving)', value: 'Wood Carving Art, Wooden Texture, Relief, Grain, Natural Warmth' },
    { name: '금속 공예 (Metal)', value: 'Metal Craft, Copper or Brass, Hammered Texture, Patina, Industrial or Jewelry Style' },
  ],
  '디지털/현대/사진': [
    { name: '실사 (Real)', value: 'Photorealistic, 4K, High Detail Photography' },
    { name: '빈티지 사진', value: 'Vintage Sepia Photo, Retro Style' },
    { name: '3D 애니메이션', value: 'Cute 3D Character Render, Pixar Style' },
    { name: '로우 폴리 (Low Poly)', value: 'Low Poly 3D Art, Geometric Facets, Minimalist' },
    { name: '픽셀 아트 (Pixel)', value: 'Pixel Art, 8-bit style, Retro Game' },
    { name: '네온 (Neon)', value: 'Cyberpunk Neon Light Style' },
    { name: '신스웨이브 (Synthwave)', value: 'Synthwave, Retrowave, 80s Aesthetics, Grid, Sunset' },
    { name: '그라피티 (Street Art)', value: 'Urban Graffiti, Spray Paint, Street Art Style' },
    { name: '스티커 아트 (Sticker)', value: 'Sticker Art Style, White Outlines, Pop Culture' },
    { name: '리소그라프 (Risograph)', value: 'Risograph Print, Dithered Shading, Retro Colors, Overprint Effect' },
    { name: '글래스모피즘', value: 'Glassmorphism, Frosted Glass, Translucent, Blurred Background' },
    { name: '청사진 (Blueprint)', value: 'Blueprint Style, White Lines on Blue Background, Architectural' },
    { name: '열화상 (Thermal)', value: 'Thermal Camera Effect, Heat Map Colors' },
    { name: '보헤미안 (Boho)', value: 'Bohemian Style, Mandala, Earthy Tones, Pattern' },
    { name: '노르딕 (Nordic)', value: 'Nordic Minimalist Illustration, Hygge, Simple Shapes' },
    { name: '트로피컬 (Tropical)', value: 'Tropical Jungle, Vibrant Leaves, Exotic Flowers, Summer Vibe' },
    { name: '베이퍼웨이브 (Vaporwave)', value: 'Vaporwave Aesthetic, Pink and Blue, Glitch, Roman Statues, 90s Web' },
    { name: '글리치 아트 (Glitch)', value: 'Glitch Art, Datamoshing, Digital Distortion, Pixel Sorting, Noise' },
    { name: '시네마틱 (Cinematic)', value: 'Cinematic Lighting, Movie Scene, Dramatic Atmosphere, Bokeh, Anamorphic Lens Flare' },
  ],
  '독특한 예술/기법': [
    { name: '널링 (Knolling)', value: 'Knolling Photography, Flat Lay, Objects Arranged at 90 Degree Angles, Organized, Clean' },
    { name: '틸트 시프트 (Tilt Shift)', value: 'Tilt Shift Photography, Miniature Effect, Blurred Background, Toy-like' },
    { name: '이중 노출 (Double Exposure)', value: 'Double Exposure Art, Silhouette combined with Nature Landscape, Dreamy' },
    { name: '청사진 (Cyanotype)', value: 'Cyanotype Print, Blueprint Style, White Silhouette on Dark Blue, Botanical' },
    { name: '아이소메트릭 (Isometric)', value: 'Isometric 3D Art, Orthographic View, Cute, Detailed, Sim City Style' },
    { name: '복셀 아트 (Voxel)', value: 'Voxel Art, 3D Pixel, Minecraft Style, Blocky, Digital' },
    { name: '로우 폴리 페이퍼', value: 'Low Poly Paper Craft, Geometric Paper Art, Sharp Edges, Minimalist' },
    { name: '아스키 아트 (ASCII)', value: 'ASCII Art Style, Visuals made of Text Characters, Retro Computer, Green on Black' },
    { name: '리소그래프 컬러', value: 'Risograph Color Print, Vibrant Pink and Blue, Grainy Texture, Misaligned Layers' },
    { name: '글리치 (심화)', value: 'Heavy Glitch Art, Data Corruption, Pixel Sorting, VHS Noise, Cyberpunk' },
  ]
};

export const ImageStyleOptions = Object.values(ImageStyleGroups).flat();

export const CardDesignOptions: { label: string; value: CardDesign }[] = [
  { label: '자동생성', value: 'auto' },
  { label: '기본 (Rectangle)', value: 'rectangle' },
  { label: '아치형 (Arch)', value: 'arch' },
  { label: '태그 (Tag)', value: 'tag' },
  { label: '육각형 (Hexagon)', value: 'hexagon_shape' },
  { label: '폴더 (Folder)', value: 'folder' },
  { label: '스프링 노트', value: 'notebook_hole' },
  { label: '영수증 (Receipt)', value: 'receipt' },
  { label: '필름 (Film)', value: 'film_strip' },
  { label: '브라우저', value: 'browser' },
  { label: '책 표지', value: 'book_cover' },
  { label: '거울 (Mirror)', value: 'mirror' },
  { label: '티켓', value: 'ticket' },
  { label: '하트', value: 'heart' },
  { label: '액자', value: 'frame' },
  { label: '폴라로이드', value: 'polaroid' },
  { label: '윈도우', value: 'window' },
  { label: '우표', value: 'stamp' },
  { label: '구름', value: 'cloud' },
  { label: '스마트폰', value: 'phone' },
  { label: '게임기', value: 'game' },
  { label: '종이 새 (Origami Bird)', value: 'origami_bird' },
  { label: '종이 배 (Origami Boat)', value: 'origami_boat' },
  { label: '종이 비행기', value: 'origami_plane' },
  { label: '편지 봉투 (Open)', value: 'envelope_open' },
  { label: '두루마리 (Scroll)', value: 'paper_scroll' },
  { label: '클립보드', value: 'clipboard' },
  { label: '퍼즐 조각', value: 'puzzle_piece' },
  { label: '말풍선 모양', value: 'speech_bubble_shape' },
  { label: '달력 (Calendar)', value: 'calendar_sheet' },
  { label: '레코드판 (Vinyl)', value: 'vinyl_record' },
  // New Designs (10)
  { label: '여권 (Passport)', value: 'passport' },
  { label: '신용카드', value: 'credit_card' },
  { label: '카세트 테이프', value: 'cassette' },
  { label: '플로피 디스크', value: 'floppy' },
  { label: '상장 (Certificate)', value: 'certificate' },
  { label: '현상수배서 (Wanted)', value: 'wanted' },
  { label: 'SNS 포스트', value: 'social_post' },
  { label: '유튜브 썸네일', value: 'video_thumbnail' },
  { label: '메신저 앱', value: 'messenger' },
  { label: '레트로 PC', value: 'retro_mac' },
];

export const MessageBoxStyleOptions: { label: string; value: MessageBoxStyle }[] = [
  { label: '없음', value: 'none' },
  { label: '마스킹 테이프', value: 'tape' },
  { label: '찢어진 종이', value: 'torn_paper' },
  { label: '그라데이션', value: 'gradient_border' },
  { label: '다크 글래스', value: 'glass_dark' },
  { label: '터미널', value: 'terminal' },
  { label: '만화 효과', value: 'comic' },
  { label: '스케치', value: 'sketch' },
  { label: '명판 (Plaque)', value: 'plaque' },
  { label: '심플 라인 (하단)', value: 'minimal_under' },
  { label: '엘레강스', value: 'elegant' },
  { label: '편지지', value: 'paper' },
  { label: '말풍선', value: 'bubble' },
  { label: '공책', value: 'notebook' },
  { label: '클래식', value: 'classic' },
  { label: '포스트잇', value: 'postit' },
  { label: '빈티지', value: 'vintage' },
  { label: '리본', value: 'ribbon' },
  { label: '반투명', value: 'translucent' },
  { label: '브러쉬', value: 'brush' },
  { label: '외곽선', value: 'outline' },
  { label: '점선', value: 'dashed' },
  { label: '이중선', value: 'double' },
  { label: '쉬머링', value: 'shimmer' },
  { label: '브루탈리즘', value: 'brutal' },
  { label: '네온', value: 'neon' },
  { label: 'RPG 대화창', value: 'rpg_dialog' },
  { label: '가로 두루마리', value: 'scroll_h' },
  { label: '티켓 (Ticket)', value: 'ticket_stub' },
  { label: '우표 (Stamp)', value: 'post_stamp' },
  { label: '나무 간판', value: 'plaque_wooden' },
  { label: '돌 비석', value: 'plaque_stone' },
  { label: '사이버 HUD', value: 'cyber_hud' },
  { label: '나뭇잎', value: 'leaf' },
  { label: '외침 (Shout)', value: 'shout' },
  { label: '블롭 (Soft)', value: 'blob_soft' },
  { label: '알림창 (Notification)', value: 'notification' },
  { label: '메신저 (보냄)', value: 'chat_send' },
  { label: '메신저 (받음)', value: 'chat_receive' },
  { label: '스팀펑크', value: 'steampunk' },
  { label: '청사진 (Blueprint)', value: 'blueprint' },
  // New Styles (10)
  { label: '테이프 (상단)', value: 'sticky_tape_top' },
  { label: '테이프 (모서리)', value: 'sticky_tape_corners' },
  { label: '만화 (점박이)', value: 'comic_dots' },
  { label: '픽셀 말풍선', value: 'pixel_bubble' },
  { label: '짙은 나무', value: 'wood_dark' },
  { label: '녹슨 철', value: 'metal_rust' },
  { label: '네온 (핑크)', value: 'neon_pink' },
  { label: '네온 (블루)', value: 'neon_blue' },
  { label: '홀로그램', value: 'holographic' },
  { label: '오래된 양피지', value: 'parchment_old' },
];

export const ImageMaskOptions: { label: string; value: ImageMask }[] = [
  { label: '기본 (사각형)', value: 'none' },
  { label: '둥근 모서리', value: 'rounded' },
  { label: '원형', value: 'circle' },
  { label: '스쿼클', value: 'squircle' },
  { label: '하트', value: 'heart' },
  { label: '구름', value: 'cloud' },
  { label: '별', value: 'star' },
  { label: '육각형', value: 'hexagon' },
  { label: '다이아몬드', value: 'diamond' },
  { label: '삼각형', value: 'triangle' },
  { label: '오각형', value: 'pentagon' },
  { label: '팔각형', value: 'octagon' },
  { label: '블롭 (유기적1)', value: 'blob_1' },
  { label: '블롭 (유기적2)', value: 'blob_2' },
  { label: '아치형 창문', value: 'arch_window' },
  { label: '물방울', value: 'tear_drop' },
  { label: '꽃 모양', value: 'flower' },
  { label: '페인트 얼룩', value: 'splatter' },
  { label: '십자가', value: 'cross' },
  { label: '번개', value: 'lightning' },
  { label: '뭉게 구름', value: 'cloud_fluffy' },
  { label: '우표 컷', value: 'stamp_cut' },
  { label: '퍼즐 조각 (싱글)', value: 'puzzle_single' },
  // New Masks (10)
  { label: '방패', value: 'shield' },
  { label: '나비', value: 'butterfly' },
  { label: '단풍잎', value: 'maple_leaf' },
  { label: '햇살 (Sunburst)', value: 'sunburst' },
  { label: '열쇠구멍', value: 'keyhole' },
  { label: '평행사변형', value: 'parallelogram' },
  { label: '사다리꼴', value: 'trapezoid' },
  { label: '티켓 (양쪽 컷)', value: 'ticket_cut' },
  { label: '말풍선 (이미지)', value: 'chat_bubble' },
  { label: '우표 (정교함)', value: 'stamp_detailed' },
  
  { label: '기타 (입력형)', value: 'custom' },
];

export const MessageLengthOptions: { label: string; value: MessageLength }[] = [
  { label: '매우 짧게 (핵심만)', value: 'xshort' },
  { label: '짧게 (2~3문장)', value: 'short' },
  { label: '보통 (4~5문장)', value: 'medium' },
  { label: '길게 (마음을 담아)', value: 'long' },
  { label: '매우 길게 (편지)', value: 'xlong' },
];

export const ImageBorderOptions: { label: string; value: ImageBorder }[] = [
    { label: '없음', value: 'none' },
    { label: '실선 (얇게)', value: 'solid_thin' },
    { label: '실선 (굵게)', value: 'solid_thick' },
    { label: '점선 (Dashed)', value: 'dashed' },
    { label: '원형 점선 (Dotted)', value: 'dotted' },
    { label: '이중선', value: 'double' },
    { label: '음각 (Groove)', value: 'groove' },
    { label: '양각 (Ridge)', value: 'ridge' },
    { label: '오프셋 (Offset)', value: 'offset' },
    { label: '네온 (Neon)', value: 'neon' },
    { label: '손그림 효과', value: 'hand_drawn' },
    { label: '안쪽 입체 (Inset)', value: 'inset' },
    { label: '바깥 입체 (Outset)', value: 'outset' },
    { label: '굵은 이중선 (Double Bold)', value: 'thick_double' },
    { label: '외곽 점선 (Outline)', value: 'outline_dashed' },
    { label: '레이어드 (Layered)', value: 'layered_white' },
    { label: '링 스타일 (Ring)', value: 'ring_simple' },
    { label: '골드 트림', value: 'gold_trim' },
    { label: '실버 트림', value: 'silver_trim' },
    { label: '소프트 글로우', value: 'soft_glow' },
    { label: '빈티지 프레임', value: 'vintage_frame' },
    { label: '무지개 (Rainbow)', value: 'rainbow' },
    { label: '코너 브라켓', value: 'corner_brackets' },
    { label: '지그재그', value: 'zigzag_border' },
    { label: '필름 구멍', value: 'film_perforation' },
    { label: '테이프 (코너)', value: 'tape_corners' },
    // New Borders (10)
    { label: '땋은 줄', value: 'braided' },
    { label: '사슬', value: 'chain' },
    { label: '레이스', value: 'lace' },
    { label: '진주 목걸이', value: 'pearls' },
    { label: '물결 (Scalloped)', value: 'scalloped' },
    { label: '필름 슬라이드', value: 'film_slide' },
    { label: '그라데이션 링', value: 'gradient_ring' },
    { label: '글리치 보더', value: 'glitch' },
    { label: '스케치 (이중)', value: 'sketchy_double' },
    { label: '무지개 점선', value: 'rainbow_dashed' },
];