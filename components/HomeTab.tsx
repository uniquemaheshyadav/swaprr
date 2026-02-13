import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, Info, Loader2, Flag, AlertTriangle, RefreshCw } from 'lucide-react';
import { Item } from '../types';
import { COUPONS } from '../constants';
import { estimateItemPrice } from '../services/openaiService';
import { createChat } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import SmartImage from './SmartImage';

interface HomeTabProps {
    items: Item[];
    onMatch: () => void;
    swaps: number;
    onStartChat: (chatId: string) => void; // Added prop for navigation
}

const HomeTab: React.FC<HomeTabProps> = ({ items, onMatch, swaps, onStartChat }) => {
    const { currentUser } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMatch, setShowMatch] = useState(false);
    const [wonCoupon, setWonCoupon] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const [marketInfo, setMarketInfo] = useState<string | null>(null);
    const [loadingMarket, setLoadingMarket] = useState(false);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    // Refs for high-performance animation (avoids re-renders during drag)
    const cardRef = useRef<HTMLDivElement>(null);
    const likeBadgeRef = useRef<HTMLDivElement>(null);
    const nopeBadgeRef = useRef<HTMLDivElement>(null);
    const dragInfo = useRef({ startX: 0, currentX: 0, isDragging: false });

    const currentItem = items[currentIndex];
    const nextItem = items[currentIndex + 1];

    // Reset card style when index changes
    useEffect(() => {
        if (cardRef.current) {
            cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
            cardRef.current.style.transition = 'none';
            cardRef.current.style.cursor = 'grab';
        }
        if (likeBadgeRef.current) likeBadgeRef.current.style.opacity = '0';
        if (nopeBadgeRef.current) nopeBadgeRef.current.style.opacity = '0';
    }, [currentIndex]);

    const onPanMove = (clientX: number) => {
        if (!cardRef.current) return;
        const x = clientX - dragInfo.current.startX;
        dragInfo.current.currentX = x;

        // Move Card directly via DOM
        const rotate = x * 0.05;
        cardRef.current.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;

        // Update Badges Opacity directly
        const opacity = Math.min(Math.abs(x) / 100, 1);
        if (x > 0) {
            if (likeBadgeRef.current) likeBadgeRef.current.style.opacity = opacity.toString();
            if (nopeBadgeRef.current) nopeBadgeRef.current.style.opacity = '0';
        } else {
            if (nopeBadgeRef.current) nopeBadgeRef.current.style.opacity = opacity.toString();
            if (likeBadgeRef.current) likeBadgeRef.current.style.opacity = '0';
        }
    };

    const onPanEnd = () => {
        dragInfo.current.isDragging = false;
        if (!cardRef.current) return;

        const x = dragInfo.current.currentX;
        const threshold = 100; // Swipe threshold

        if (Math.abs(x) > threshold) {
            const direction = x > 0 ? 'right' : 'left';
            finishSwipe(direction);
        } else {
            // Reset to center if not swiped far enough
            cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
            cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
            if (likeBadgeRef.current) {
                likeBadgeRef.current.style.transition = 'opacity 0.2s ease';
                likeBadgeRef.current.style.opacity = '0';
            }
            if (nopeBadgeRef.current) {
                nopeBadgeRef.current.style.transition = 'opacity 0.2s ease';
                nopeBadgeRef.current.style.opacity = '0';
            }
        }
    };

    const handlePanStart = (clientX: number) => {
        dragInfo.current = { startX: clientX, currentX: 0, isDragging: true };
        if (cardRef.current) {
            cardRef.current.style.transition = 'none';
            cardRef.current.style.cursor = 'grabbing';
        }

        const handleWindowMove = (e: MouseEvent | TouchEvent) => {
            const cx = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
            onPanMove(cx);
        };

        const handleWindowEnd = () => {
            onPanEnd();
            window.removeEventListener('mousemove', handleWindowMove);
            window.removeEventListener('mouseup', handleWindowEnd);
            window.removeEventListener('touchmove', handleWindowMove);
            window.removeEventListener('touchend', handleWindowEnd);
        };

        window.addEventListener('mousemove', handleWindowMove);
        window.addEventListener('mouseup', handleWindowEnd);
        window.addEventListener('touchmove', handleWindowMove, { passive: false });
        window.addEventListener('touchend', handleWindowEnd);
    };

    const finishSwipe = (direction: 'left' | 'right') => {
        if (!cardRef.current) return;

        // Animate card off screen
        const endX = direction === 'right' ? window.innerWidth + 200 : -window.innerWidth - 200;
        cardRef.current.style.transition = 'transform 0.4s ease-in';
        cardRef.current.style.transform = `translateX(${endX}px) rotate(${direction === 'right' ? 30 : -30}deg)`;

        // Trigger logic
        if (direction === 'right') {
            if (Math.random() > 0.2) {
                setShowMatch(true);
                onMatch();
            }
        }

        // Advance to next card after animation
        setTimeout(() => {
            if (currentIndex < items.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setMarketInfo(null);
            }
        }, 300);
    };

    const spinWheel = () => {
        setIsSpinning(true);
        setTimeout(() => {
            const randomCoupon = COUPONS[Math.floor(Math.random() * COUPONS.length)];
            setWonCoupon(randomCoupon);
            setIsSpinning(false);
        }, 2000);
    };

    const handleCheckPrice = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentItem) return;
        setLoadingMarket(true);
        const info = await estimateItemPrice(currentItem.title);
        setMarketInfo(info);
        setLoadingMarket(false);
    };

    const handleReport = () => {
        setShowReportModal(false);
        setReportReason('');
        // Simulate API call delay
        setTimeout(() => {
            alert(`Reported "${currentItem.title}" for ${reportReason}. We'll review this shortly.`);
            finishSwipe('left');
        }, 300);
    };

    const getBadgeColor = (cat: string) => {
        switch (cat) {
            case 'Item': return 'bg-electric-blue text-white';
            case 'Study': return 'bg-yellow-400 text-black';
            case 'Skill': return 'bg-purple-500 text-white';
            default: return 'bg-gray-500';
        }
    };

    // Internal Card Component for structure
    // We use the closure scope refs (cardRef, likeBadgeRef, etc.) if it's the front card
    const Card: React.FC<{ item: Item, isFront: boolean }> = ({ item, isFront }) => (
        <div
            ref={isFront ? cardRef : null}
            className={`absolute top-0 w-full aspect-[3/4] md:aspect-[4/5] max-h-[70vh] bg-white dark:bg-dark-card rounded-3xl shadow-2xl dark:shadow-black/50 overflow-hidden border border-gray-200 dark:border-gray-800 select-none touch-none
          ${isFront ? 'cursor-grab active:cursor-grabbing z-20' : 'z-10 scale-95 translate-y-4 opacity-50'}`}
            // Attach start handlers to the element
            onMouseDown={isFront ? (e) => handlePanStart(e.clientX) : undefined}
            onTouchStart={isFront ? (e) => handlePanStart(e.touches[0].clientX) : undefined}
            style={!isFront ? { transition: 'transform 0.3s ease-out' } : undefined}
        >
            <SmartImage
                src={item.image}
                alt={item.title}
                itemTitle={item.title}
                category={item.category}
                className="w-full h-3/5 pointer-events-none"
            />

            {isFront && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowReportModal(true);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white/90 transition z-20"
                        title="Report Item"
                    >
                        <Flag size={18} />
                    </button>

                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md ${getBadgeColor(item.category)}`}>
                        {item.category}
                    </div>

                    <div ref={likeBadgeRef} className="absolute top-8 left-8 border-4 border-green-500 text-green-500 rounded-lg px-4 py-1 text-2xl font-bold uppercase -rotate-12 bg-white/50 backdrop-blur-sm shadow-lg opacity-0 pointer-events-none">LIKE</div>
                    <div ref={nopeBadgeRef} className="absolute top-8 right-8 border-4 border-red-500 text-red-500 rounded-lg px-4 py-1 text-2xl font-bold uppercase rotate-12 bg-white/50 backdrop-blur-sm shadow-lg opacity-0 pointer-events-none">NOPE</div>
                </>
            )}

            <div className="p-6 flex flex-col justify-between h-2/5 relative">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{item.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">by {item.owner}</p>
                            <p className="text-[10px] md:text-xs text-electric-blue font-bold uppercase tracking-wider mt-0.5">{item.college}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                            <span className="text-xl md:text-2xl font-bold text-electric-blue whitespace-nowrap">{item.price}</span>
                        </div>
                    </div>

                    <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm md:text-base line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-2" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                    {isFront && (marketInfo ? (
                        <div className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-2 rounded border border-blue-100 dark:border-blue-900 animate-in fade-in">
                            ✨ <b>AI Insights:</b> {marketInfo}
                        </div>
                    ) : (
                        <button
                            onClick={handleCheckPrice}
                            disabled={loadingMarket}
                            className="flex items-center space-x-2 text-xs text-electric-blue font-medium hover:underline p-1"
                        >
                            {loadingMarket ? <Loader2 size={14} className="animate-spin" /> : <Info size={14} />}
                            <span>Check Market Value (AI)</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] w-full flex flex-col justify-center items-center overflow-hidden relative">

            {/* Background Decoration */}
            <div className="absolute inset-0 hidden md:block opacity-30 pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-electric-blue/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md md:max-w-lg lg:max-w-xl px-4 flex flex-col items-center">

                {/* Card Stack Container */}
                <div className="relative w-full aspect-[3/4] md:aspect-[4/5] max-h-[70vh]">
                    {currentIndex >= items.length ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                                <RefreshCw size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">All caught up!</h3>
                            <p className="text-gray-500">Check back later for more items.</p>
                            <button onClick={() => setCurrentIndex(0)} className="text-electric-blue font-bold hover:underline">Start Over</button>
                        </div>
                    ) : (
                        <>
                            {/* Background Card (Next) */}
                            {nextItem && <Card key={nextItem.id} item={nextItem} isFront={false} />}
                            {/* Foreground Card (Current) - key is vital for resetting DOM state on change */}
                            {currentItem && <Card key={currentItem.id} item={currentItem} isFront={true} />}
                        </>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-8 mt-8">
                    <button onClick={() => finishSwipe('left')} disabled={currentIndex >= items.length} className="w-16 h-16 bg-white dark:bg-dark-card rounded-full shadow-lg text-red-500 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition transform hover:scale-110 border border-gray-100 dark:border-gray-800 hover:border-red-200 disabled:opacity-50 disabled:scale-100">
                        <X size={32} />
                    </button>
                    <button onClick={() => finishSwipe('right')} disabled={currentIndex >= items.length} className="w-16 h-16 bg-electric-blue rounded-full shadow-lg shadow-blue-500/30 text-white flex items-center justify-center hover:bg-electric-dark transition transform hover:scale-110 disabled:opacity-50 disabled:scale-100 disabled:shadow-none">
                        <Heart size={32} fill="white" />
                    </button>
                </div>
            </div>

            {/* Match Overlay */}
            {showMatch && currentItem && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-purple-500 mb-2 tracking-tighter italic">IT'S A MATCH!</h2>
                    <p className="text-gray-300 text-lg md:text-xl mb-8 text-center">You matched with <span className="text-white font-bold">{currentItem.owner}</span>!</p>

                    <div className="flex gap-4 mb-8">
                        <div className="text-center px-4 py-2 bg-white/10 rounded-xl">
                            <span className="block text-2xl font-bold text-green-400">{swaps}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Total Swaps</span>
                        </div>
                    </div>

                    {!wonCoupon ? (
                        <div className="text-center scale-110 md:scale-125">
                            <p className="text-electric-vivid font-bold mb-4 uppercase text-sm tracking-widest">Bonus Chance</p>
                            <div
                                onClick={!isSpinning ? spinWheel : undefined}
                                className={`w-40 h-40 rounded-full border-4 border-electric-blue flex items-center justify-center cursor-pointer bg-gray-900 transition-all ${isSpinning ? 'animate-spin' : 'hover:scale-105'}`}
                                style={{ background: 'conic-gradient(from 0deg, #3b82f6 0deg 90deg, #00d2ff 90deg 180deg, #3b82f6 180deg 270deg, #00d2ff 270deg 360deg)' }}
                            >
                                <div className="w-36 h-36 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {isSpinning ? '...' : 'SPIN'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-card p-8 rounded-3xl w-full max-w-sm text-center animate-in zoom-in border border-gray-200 dark:border-gray-800 shadow-2xl">
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">You Won</p>
                            <h3 className="text-3xl font-bold text-electric-blue my-4">{wonCoupon}</h3>
                            <button onClick={() => { setShowMatch(false); setWonCoupon(null); }} className="mt-4 w-full bg-electric-blue hover:bg-electric-dark text-white py-4 rounded-xl font-bold text-lg transition">
                                Keep Swiping
                            </button>
                        </div>
                    )}

                    <button
                        onClick={async () => {
                            if (!currentUser) {
                                alert("User not logged in");
                                return;
                            }

                            if (!currentItem || !currentItem.ownerId) {
                                console.error("Missing ownerId for item:", currentItem);
                                alert("Cannot start chat: Item owner not identified.");
                                return;
                            }

                            console.log("Starting Chat - Current User:", currentUser.uid);
                            console.log("Starting Chat - Item Owner:", currentItem.ownerId);

                            if (currentUser.uid === currentItem.ownerId) {
                                alert("You cannot chat with yourself.");
                                return;
                            }

                            try {
                                const chatId = await createChat(currentUser.uid, currentItem.ownerId);
                                setShowMatch(false);
                                onStartChat(chatId);
                            } catch (error) {
                                console.error("Chat creation failed:", error);
                                alert("Failed to start chat. Please try again.");
                            }
                        }}
                        className="mt-6 bg-white text-electric-blue border-2 border-electric-blue hover:bg-electric-blue hover:text-white px-8 py-3 rounded-full font-bold text-lg transition flex items-center gap-2"
                    >
                        Chat Now
                    </button>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="text-red-500" size={24} />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Report Item</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Help us keep the community safe. Why are you reporting <span className="font-bold">"{currentItem.title}"</span>?
                        </p>
                        <div className="space-y-2 mb-6">
                            {['Inappropriate Content', 'Spam or Scam', 'Misleading Information', 'Offensive / Abusive', 'Other'].map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => setReportReason(reason)}
                                    className={`w-full text-left p-3 rounded-lg text-xs md:text-sm font-medium border transition-all ${reportReason === reason
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                                        : 'bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={!reportReason}
                                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeTab;
