import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, ImageOff } from 'lucide-react';
import { generateItemImage } from '../services/openaiService';

interface SmartImageProps {
    src?: string;
    alt: string;
    className?: string;
    itemTitle: string;
    category: string;
}

const SmartImage: React.FC<SmartImageProps> = ({ src, alt, className, itemTitle, category }) => {
    const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'generating' | 'generated_error'>('loading');

    // Reset state if the prop src changes (e.g. reused component)
    useEffect(() => {
        setCurrentSrc(src);
        setStatus('loading');
    }, [src]);

    const handleError = async () => {
        // If we already tried generating and it failed, stop.
        if (status === 'generated_error' || status === 'generating') return;

        setStatus('generating');

        // Call OpenAI to generate an image
        try {
            const generatedUrl = await generateItemImage(itemTitle, category);
            if (generatedUrl) {
                setCurrentSrc(generatedUrl);
                // The new src will trigger onLoad, setting status to 'loaded'
            } else {
                setStatus('generated_error');
            }
        } catch (err) {
            console.error("Failed to generate fallback image", err);
            setStatus('generated_error');
        }
    };

    const handleLoad = () => {
        setStatus('loaded');
    };

    return (
        <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
            {/* Actual Image */}
            {(status !== 'generated_error') && (
                <img
                    src={currentSrc}
                    alt={alt}
                    onError={handleError}
                    onLoad={handleLoad}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                />
            )}

            {/* Loading / Generating States */}
            {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="animate-pulse w-full h-full bg-gray-200 dark:bg-gray-700" />
                </div>
            )}

            {status === 'generating' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/10 backdrop-blur-sm z-10 text-electric-blue p-4 text-center">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <div className="flex items-center gap-2 text-sm font-bold bg-white/80 dark:bg-black/80 px-3 py-1 rounded-full">
                        <Sparkles size={14} className="fill-current" />
                        <span>AI Generating Image...</span>
                    </div>
                </div>
            )}

            {/* Final Fallback if generation fails */}
            {status === 'generated_error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800">
                    <ImageOff size={32} className="mb-2" />
                    <span className="text-xs">No Image</span>
                </div>
            )}
        </div>
    );
};

export default SmartImage;
