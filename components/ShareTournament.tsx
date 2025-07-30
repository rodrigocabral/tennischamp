'use client';

import { Button } from '@/components/ui/button';
import { useTournament } from '@/contexts/TournamentContext';
import { CheckIcon, Copy } from 'lucide-react';
import { useState } from 'react';

export default function ShareTournament() {
  const { tournamentId } = useTournament();
  const [copied, setCopied] = useState(false);

  if (!tournamentId) {
    return null;
  }

  const handleShare = async () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}?tournament=${tournamentId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copiedText = (
    <>
      <CheckIcon className="h-4 w-4 mr-2" />
      Copiado!
    </>
  );
  const shareText = (
    <>
      <Copy className="h-4 w-4 mr-2" />
      Compartilhar
    </>
  );

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="text-sm"
    >
      {copied ? copiedText : shareText}
    </Button>
  );
}
