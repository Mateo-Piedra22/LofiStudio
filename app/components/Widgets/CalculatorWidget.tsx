'use client';

import { useState, useEffect } from 'react';
import { useWidgets } from '@/lib/hooks/useWidgets';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Calculator as CalculatorIcon, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedIcon from '@/app/components/ui/animated-icon';

interface CalculatorWidgetProps {
  id: string;
  settings?: {
    history?: string[];
  };
}

export default function CalculatorWidget({ id, settings }: CalculatorWidgetProps) {
  const { updateWidget } = useWidgets();
  const [showWidgetHeaders] = useLocalStorage('showWidgetHeaders', true);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>(settings?.history || []);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  useEffect(() => {
    if (settings?.history) {
      setHistory(settings.history);
    }
  }, [settings?.history]);

  const saveHistory = (newHistory: string[]) => {
    setHistory(newHistory);
    updateWidget(id, { settings: { ...settings, history: newHistory } });
  };

  const handleNumber = (num: string) => {
    if (display === '0' || shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setShouldResetDisplay(true);
  };

  const calculate = () => {
    if (!equation) return;
    const fullEq = equation + display;
    try {
      // Safe evaluation for basic operations
      // eslint-disable-next-line no-new-func
      const result = new Function('return ' + fullEq.replace(/[^-()\d/*+.]/g, ''))();
      const formattedResult = String(Math.round(result * 100000000) / 100000000);
      
      setDisplay(formattedResult);
      setEquation('');
      setShouldResetDisplay(true);

      const newHistory = [`${fullEq} = ${formattedResult}`, ...history].slice(0, 3);
      saveHistory(newHistory);
    } catch (e) {
      setDisplay('Error');
      setShouldResetDisplay(true);
      setEquation('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setShouldResetDisplay(false);
  };

  const backspace = () => {
    if (shouldResetDisplay) return;
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const buttons = [
    { label: 'C', onClick: clear, cls: 'text-destructive font-medium' },
    { label: '÷', onClick: () => handleOperator('/'), cls: 'text-primary' },
    { label: '×', onClick: () => handleOperator('*'), cls: 'text-primary' },
    { label: '⌫', onClick: backspace, cls: 'text-muted-foreground' },
    { label: '7', onClick: () => handleNumber('7') },
    { label: '8', onClick: () => handleNumber('8') },
    { label: '9', onClick: () => handleNumber('9') },
    { label: '-', onClick: () => handleOperator('-'), cls: 'text-primary' },
    { label: '4', onClick: () => handleNumber('4') },
    { label: '5', onClick: () => handleNumber('5') },
    { label: '6', onClick: () => handleNumber('6') },
    { label: '+', onClick: () => handleOperator('+'), cls: 'text-primary' },
    { label: '1', onClick: () => handleNumber('1') },
    { label: '2', onClick: () => handleNumber('2') },
    { label: '3', onClick: () => handleNumber('3') },
    { label: '=', onClick: calculate, cls: 'row-span-2 bg-primary text-primary-foreground h-full rounded-xl', isSpecial: true },
    { label: '0', onClick: () => handleNumber('0'), cls: 'col-span-2 w-full text-left pl-6' },
    { label: '.', onClick: () => handleNumber('.') },
  ];

  return (
    <div data-ui="widget" className="h-full w-full flex flex-col rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-card-foreground shadow-sm overflow-hidden p-4 hover:shadow-lg transition-shadow duration-300">
      {showWidgetHeaders && (
        <div data-slot="header" className="flex items-center justify-between px-2 py-1 mb-2">
          <div className="flex items-center gap-2">
            <AnimatedIcon animationSrc="/lottie/Calculator.json" fallbackIcon={CalculatorIcon} className="w-5 h-5" />
            <span className="text-lg font-semibold text-foreground/90">Calculator</span>
          </div>
        </div>
      )}

      <div data-slot="content" className="flex-1 w-full flex flex-col min-h-0 relative">
        <div className="flex-1 flex flex-col justify-end items-end px-3 pb-3 min-h-0">
          <div className="text-[10px] text-muted-foreground/60 space-y-0.5 w-full text-right mb-1 opacity-60 font-mono">
            {history.map((h, i) => (
              <div key={i} className="truncate">{h}</div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground h-4">{equation}</div>
          <div className="text-4xl font-light tracking-tight truncate w-full text-right text-foreground/90">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 h-[65%] w-full max-w-[280px] mx-auto">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className={cn(
                "rounded-full flex items-center justify-center text-lg font-medium transition-all duration-200 active:scale-90 shadow-sm",
                btn.cls ? btn.cls : "bg-white/5 hover:bg-white/10 text-foreground",
                btn.label === 'C' || btn.label === '⌫' ? "text-destructive/80 bg-destructive/5 hover:bg-destructive/10" : "",
                ['÷', '×', '-', '+', '='].includes(btn.label) && !btn.isSpecial ? "bg-primary/10 text-primary hover:bg-primary/20" : "",
                btn.isSpecial ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 shadow-lg" : "",
                btn.label === '0' ? "col-span-2 w-full rounded-2xl pl-6 justify-start" : "aspect-square"
              )}
              style={btn.label === '=' ? { gridRow: 'span 2', borderRadius: '1rem' } : btn.label === '0' ? { gridColumn: 'span 2' } : {}}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
