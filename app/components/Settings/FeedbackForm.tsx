'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Smile, Meh, Frown, Send, CheckCircle2 } from 'lucide-react';

export default function FeedbackForm() {
    const [rating, setRating] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async () => {
        if (!rating || !message.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, message }),
            });

            if (res.ok) {
                setIsSent(true);
                setMessage('');
                setRating(null);
                setTimeout(() => setIsSent(false), 3000);
            } else {
                alert('Failed to send feedback. Please try again.');
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            alert('Error sending feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const ratings = [
        { value: 1, icon: Frown, label: 'Bad', color: 'text-red-400' },
        { value: 2, icon: Frown, label: 'Poor', color: 'text-orange-400' },
        { value: 3, icon: Meh, label: 'Okay', color: 'text-yellow-400' },
        { value: 4, icon: Smile, label: 'Good', color: 'text-lime-400' },
        { value: 5, icon: Smile, label: 'Great', color: 'text-green-400' },
    ];

    if (isSent) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg animate-in fade-in zoom-in">
                <CheckCircle2 className="w-12 h-12 text-green-400 mb-2" />
                <p className="text-foreground font-medium">Thank you for your feedback!</p>
                <p className="text-muted-foreground text-sm">We appreciate your input.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 rounded-lg glass border">
            <div>
                <label className="block text-sm text-muted-foreground mb-2">How was your experience?</label>
                <div className="flex justify-between gap-2">
                    {ratings.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => setRating(r.value)}
                            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${rating === r.value
                                    ? 'bg-accent/10 scale-110 ring-1 ring-ring'
                                    : 'hover:bg-accent/10 hover:scale-105 opacity-60 hover:opacity-100'
                                }`}
                        >
                            <r.icon className={`w-6 h-6 ${rating === r.value ? r.color : 'text-muted-foreground'}`} />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm text-muted-foreground mb-2">Tell us more</label>
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What did you like? What can we improve?"
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
                />
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={!rating || !message.trim() || isSubmitting}
                    className="w-full sm:w-auto"
                >
                    {isSubmitting ? (
                        'Sending...'
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Feedback
                        </>
                    )}
                </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
                Feedback is sent directly to the developer (piedrabuena.mateo03@gmail.com)
            </p>
        </div>
    );
}
