/**
 * CalculatorWidget v2
 * Simple calculator with history
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Delete, RotateCcw } from 'lucide-react';
import { WidgetWrapper } from '@/app/components/WidgetBase';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';
import type { WidgetAction } from '@/lib/types/widget.types';

interface CalculatorWidgetProps {
    id: string;
    settings?: {
        scientificMode?: boolean;
    };
}

type Operation = '+' | '-' | '×' | '÷' | null;

const BUTTONS = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
];

/**
 * Calculator widget
 */
export function CalculatorWidget({ id, settings }: CalculatorWidgetProps) {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operation, setOperation] = useState<Operation>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [history, setHistory] = useState<string>('');

    const showHeaders = useWidgetGridStore(state => state.showHeaders);

    // Input digit
    const inputDigit = useCallback((digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    }, [display, waitingForOperand]);

    // Input decimal
    const inputDecimal = useCallback(() => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else if (display.indexOf('.') === -1) {
            setDisplay(display + '.');
        }
    }, [display, waitingForOperand]);

    // Clear all
    const clear = useCallback(() => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
        setHistory('');
    }, []);

    // Delete last character
    const deleteChar = useCallback(() => {
        if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
            setDisplay('0');
        } else {
            setDisplay(display.slice(0, -1));
        }
    }, [display]);

    // Toggle sign
    const toggleSign = useCallback(() => {
        const value = parseFloat(display);
        setDisplay(String(-value));
    }, [display]);

    // Percentage
    const percentage = useCallback(() => {
        const value = parseFloat(display);
        setDisplay(String(value / 100));
    }, [display]);

    // Perform operation
    const performOperation = useCallback((nextOperation: Operation) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(inputValue);
            setHistory(`${inputValue} ${nextOperation}`);
        } else if (operation) {
            const result = calculate(previousValue, inputValue, operation);
            setDisplay(String(result));
            setPreviousValue(result);
            setHistory(`${result} ${nextOperation}`);
        }

        setWaitingForOperand(true);
        setOperation(nextOperation);
    }, [display, previousValue, operation]);

    // Calculate result
    const calculate = (a: number, b: number, op: Operation): number => {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '×': return a * b;
            case '÷': return b !== 0 ? a / b : 0;
            default: return b;
        }
    };

    // Equals
    const equals = useCallback(() => {
        if (operation === null || previousValue === null) return;

        const inputValue = parseFloat(display);
        const result = calculate(previousValue, inputValue, operation);

        setHistory(`${previousValue} ${operation} ${inputValue} =`);
        setDisplay(String(result));
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
    }, [display, previousValue, operation]);

    // Handle button click
    const handleButton = useCallback((btn: string) => {
        switch (btn) {
            case 'C':
                clear();
                break;
            case '±':
                toggleSign();
                break;
            case '%':
                percentage();
                break;
            case '⌫':
                deleteChar();
                break;
            case '.':
                inputDecimal();
                break;
            case '=':
                equals();
                break;
            case '+':
            case '-':
            case '×':
            case '÷':
                performOperation(btn as Operation);
                break;
            default:
                inputDigit(btn);
        }
    }, [clear, toggleSign, percentage, deleteChar, inputDecimal, equals, performOperation, inputDigit]);

    // Get button style
    const getButtonStyle = (btn: string) => {
        if (['+', '-', '×', '÷', '='].includes(btn)) {
            return 'bg-primary text-primary-foreground hover:bg-primary/90';
        }
        if (['C', '±', '%'].includes(btn)) {
            return 'bg-muted text-foreground hover:bg-muted/80';
        }
        return 'bg-background hover:bg-muted/50 border border-border';
    };

    // Actions
    const actions: WidgetAction[] = [
        {
            id: 'clear',
            icon: 'RotateCcw',
            label: 'Clear',
            onClick: clear,
        },
    ];

    return (
        <WidgetWrapper
            id={id}
            title="Calculator"
            icon="Calculator"
            showHeader={showHeaders}
            actions={actions}
            contentClassName="p-2 flex flex-col"
        >
            <div className="flex flex-col h-full gap-2">
                {/* Display */}
                <div className="bg-muted/30 rounded-lg p-3 text-right">
                    {/* History */}
                    {history && (
                        <p className="text-xs text-muted-foreground truncate mb-1">
                            {history}
                        </p>
                    )}
                    {/* Main display */}
                    <p className="text-2xl font-bold font-mono text-foreground truncate">
                        {display}
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex-1 grid grid-cols-4 gap-1">
                    {BUTTONS.flat().map((btn, index) => (
                        <motion.button
                            key={`${btn}-${index}`}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleButton(btn)}
                            className={cn(
                                'flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
                                btn === '0' ? 'col-span-1' : '',
                                getButtonStyle(btn)
                            )}
                            style={{ minHeight: '36px' }}
                        >
                            {btn === '⌫' ? <Delete className="w-4 h-4" /> : btn}
                        </motion.button>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
}

export default CalculatorWidget;
