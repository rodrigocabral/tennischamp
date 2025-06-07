'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeftIcon, ChevronRightIcon, ReloadIcon } from '@radix-ui/react-icons';

const AVATAR_STYLES = [
  'adventurer',
  'avataaars',
  'bottts',
  'fun-emoji',
  'lorelei',
  'personas',
  'pixel-art',
];

interface AvatarSelectorProps {
  value: string;
  onChange: (value: string) => void;
  nickname: string;
}

export default function AvatarSelector({ value, onChange, nickname }: AvatarSelectorProps) {
  const [currentStyle, setCurrentStyle] = useState(AVATAR_STYLES[0]);
  const [seed, setSeed] = useState(() => Math.random().toString(36).substring(7));

  const generateAvatarUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  };

  const handleStyleChange = (direction: 'prev' | 'next') => {
    const currentIndex = AVATAR_STYLES.indexOf(currentStyle);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : AVATAR_STYLES.length - 1;
    } else {
      newIndex = currentIndex < AVATAR_STYLES.length - 1 ? currentIndex + 1 : 0;
    }
    
    const newStyle = AVATAR_STYLES[newIndex];
    setCurrentStyle(newStyle);
    const newUrl = generateAvatarUrl(newStyle, seed);
    onChange(newUrl);
  };

  const handleRandomize = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setSeed(newSeed);
    const newUrl = generateAvatarUrl(currentStyle, newSeed);
    onChange(newUrl);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleStyleChange('prev')}
          type="button"
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        
        <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
          <AvatarImage src={value} alt="Selected avatar" />
          <AvatarFallback>{nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleStyleChange('next')}
          type="button"
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRandomize}
        type="button"
        className="flex items-center gap-2 text-sm"
      >
        <ReloadIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        Gerar Novo
      </Button>
      
      <div className="text-xs sm:text-sm text-muted-foreground text-center">
        Estilo: {currentStyle}
      </div>
    </div>
  );
} 