import React from 'react';
import { STARTER_PROMPTS, StarterPrompt, ModelOption } from '../types';
import { ArrowUpRight, Terminal, BookOpen, Compass, Code2 } from 'lucide-react';
import { AmebaLogo } from './AmebaLogo';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
  activeModel: ModelOption;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onSelectPrompt,
  activeModel 
}) => {
  const getCategoryIcon = (category: StarterPrompt['category']) => {
    switch (category) {
      case 'code':
        return <Code2 className="w-4 h-4 text-[#0d0d0d] dark:text-white" />;
      case 'analysis':
        return <Terminal className="w-4 h-4 text-[#0d0d0d] dark:text-white" />;
      case 'writing':
        return <BookOpen className="w-4 h-4 text-[#0d0d0d] dark:text-white" />;
      case 'creative':
        return <Compass className="w-4 h-4 text-[#0d0d0d] dark:text-white" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-[768px] mx-auto w-full transition-colors">
      {/* Welcome Header */}
      <div className="text-center mb-8 max-w-[560px]">
        {/* Ameba Outline Emblem */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] text-[#0d0d0d] dark:text-[#f0f0f0] mb-4">
          <AmebaLogo className="w-8 h-8" strokeWidth={1.8} />
        </div>

        {/* Display Tier: 24px/600 per design.md specifications */}
        <h1 className="text-[24px] font-semibold leading-[1.33] text-[#0d0d0d] dark:text-[#f0f0f0] tracking-normal mb-2">
          Чем AMEBA может помочь сегодня?
        </h1>
        <p className="text-[16px] font-normal leading-[1.5] text-[#5d5d5d] dark:text-[#a3a3a3]">
          Интеллектуальная рабочая среда в эстетике <i>Graphite on paper</i>. Активная модель: <span className="text-[#0d0d0d] dark:text-white font-medium">{activeModel.name}</span>.
        </p>
      </div>

      {/* Starter Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelectPrompt(prompt.prompt)}
            className="group relative p-3.5 text-left rounded-[10px] bg-white dark:bg-[#181818] border border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1 rounded-[6px] bg-[#f9f9f9] dark:bg-[#242424]">
                  {getCategoryIcon(prompt.category)}
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#8f8f8f] dark:text-[#737373] group-hover:text-[#0d0d0d] dark:group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-[14px] font-medium text-[#0d0d0d] dark:text-[#f0f0f0] leading-snug group-hover:text-black dark:group-hover:text-white">
                {prompt.title}
              </h3>
              <p className="text-[12px] text-[#5d5d5d] dark:text-[#a3a3a3] mt-1 line-clamp-2 leading-normal">
                {prompt.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Capabilities footnote */}
      <div className="mt-8 flex items-center justify-center gap-3 text-[12px] text-[#8f8f8f] dark:text-[#737373] flex-wrap">
        <span className="px-2 py-0.5 rounded-none bg-[#f9f9f9] dark:bg-[#202020] text-[#0d0d0d] dark:text-[#f0f0f0] border border-black/8 dark:border-white/10">
          Zero-Noise Achromatic
        </span>
        <span>•</span>
        <span>Deep Graphite Dark Theme</span>
        <span>•</span>
        <span>Firebase Auth Ready</span>
      </div>
    </div>
  );
};
