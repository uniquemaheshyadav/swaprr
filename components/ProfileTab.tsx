import React, { useState, useRef } from 'react';
import { Camera, Edit2, Wand2, Loader2, Save, PlusCircle, Tag, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { editProfileImage } from '../services/geminiService';
import { estimateItemPrice } from '../services/openaiService';
import SmartImage from './SmartImage';

interface ProfileTabProps {
    profile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onUpdateProfile }) => {
    const { logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showAiEdit, setShowAiEdit] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    const [showSellModal, setShowSellModal] = useState(false);
    const [sellItemName, setSellItemName] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState('');
    const [isEstimating, setIsEstimating] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onUpdateProfile({ ...profile, avatar: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleAiEdit = async () => {
        if (!aiPrompt.trim()) return;
        setIsAiProcessing(true);
        try {
            // Pass the avatar if exists, else we can't edit nothing
            if (!profile.avatar) {
                alert("Please upload a photo first to use Magic Edit.");
                return;
            }
            const newImage = await editProfileImage(profile.avatar, aiPrompt);
            if (newImage) {
                onUpdateProfile({ ...profile, avatar: newImage });
                setShowAiEdit(false);
                setAiPrompt('');
            } else alert("Try a simpler prompt.");
        } catch (e) { alert("AI Edit Failed."); } finally { setIsAiProcessing(false); }
    };

    const handleEstimatePrice = async () => {
        if (!sellItemName.trim()) return;
        setIsEstimating(true);
        try {
            const price = await estimateItemPrice(sellItemName);
            setEstimatedPrice(price);
        } catch (e) { setEstimatedPrice("Could not estimate."); } finally { setIsEstimating(false); }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 md:py-12 flex flex-col items-center text-gray-900 dark:text-gray-100">

            {/* Profile Header Block */}
            <div className="w-full bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative group shrink-0">
                    <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-lg relative flex items-center justify-center ${!profile.avatar ? 'bg-gradient-to-br from-electric-blue to-purple-600' : 'bg-gray-200'}`}>
                        {profile.avatar ? (
                            <SmartImage src={profile.avatar} alt="Profile" itemTitle={profile.name} category="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl md:text-5xl font-bold text-white tracking-widest">{getInitials(profile.name)}</span>
                        )}

                        {isAiProcessing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <Loader2 className="text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2.5 bg-electric-blue text-white rounded-full shadow-md hover:bg-electric-dark transition hover:scale-105 z-20">
                        <Camera size={18} />
                    </button>
                    {profile.avatar && (
                        <button onClick={() => setShowAiEdit(!showAiEdit)} className="absolute bottom-0 left-0 p-2.5 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition hover:scale-105 z-20">
                            <Wand2 size={18} />
                        </button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="flex-1 text-center md:text-left w-full">
                    {showAiEdit ? (
                        <div className="w-full bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl mb-4 border border-purple-100 dark:border-purple-800 animate-in fade-in">
                            <label className="text-xs font-bold text-purple-800 dark:text-purple-300 block mb-2">Magic Edit (Gemini)</label>
                            <div className="flex gap-2">
                                <input className="flex-1 text-sm p-2 rounded border border-purple-200 dark:border-purple-700 bg-white dark:bg-dark-bg focus:outline-none" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. cyber style" />
                                <button onClick={handleAiEdit} disabled={isAiProcessing} className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium">Go</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl md:text-3xl font-bold mb-1">{profile.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">{profile.college}</p>
                            {/* Stats Row */}
                            <div className="flex justify-center md:justify-start space-x-6">
                                <div className="text-center">
                                    <span className="block text-xl font-bold text-electric-blue">{profile.karma}</span>
                                    <span className="text-xs text-gray-400 uppercase tracking-wide font-bold">Karma</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl font-bold text-gray-800 dark:text-white">{profile.sales}</span>
                                    <span className="text-xs text-gray-400 uppercase tracking-wide font-bold">Swaps</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl font-bold text-green-500">{profile.earnings}</span>
                                    <span className="text-xs text-gray-400 uppercase tracking-wide font-bold">Earnings</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Actions Column */}
                <div>
                    <button onClick={() => setShowSellModal(true)} className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 hover:opacity-90 transition transform hover:-translate-y-1">
                        <PlusCircle size={22} />
                        <span>Quick Sell</span>
                    </button>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <h3 className="text-sm font-bold text-electric-blue mb-2">Pro Tip</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            Verify your college email to get a <span className="font-bold">20% Karma Boost</span> on your next swap!
                        </p>
                    </div>
                </div>

                {/* Info Form Column */}
                <div className="w-full space-y-4 bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-800 dark:text-white">Details</h3>
                        <div className="flex items-center gap-4">
                            <button onClick={handleLogout} className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1">
                                <LogOut size={14} /> Logout
                            </button>
                            <button onClick={() => setIsEditing(!isEditing)} className="text-electric-blue text-sm font-medium hover:underline">
                                {isEditing ? <span className="flex items-center gap-1"><Save size={14} /> Save</span> : <span className="flex items-center gap-1"><Edit2 size={14} /> Edit</span>}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold">Name</label>
                        {isEditing ? (
                            <input className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-1 text-gray-800 dark:text-white focus:outline-none focus:border-electric-blue" value={profile.name} onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })} />
                        ) : <p className="text-gray-800 dark:text-gray-200 font-medium">{profile.name}</p>}
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold">College</label>
                        {isEditing ? (
                            <input className="w-full border-b border-gray-200 dark:border-gray-700 bg-transparent py-1 text-gray-800 dark:text-white focus:outline-none focus:border-electric-blue" value={profile.college} onChange={(e) => onUpdateProfile({ ...profile, college: e.target.value })} />
                        ) : <p className="text-gray-800 dark:text-gray-200 font-medium">{profile.college}</p>}
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold">Bio</label>
                        {isEditing ? (
                            <textarea className="w-full border border-gray-200 dark:border-gray-700 rounded p-2 text-sm text-gray-800 dark:text-white bg-transparent focus:outline-none focus:border-electric-blue mt-1" rows={3} value={profile.bio} onChange={(e) => onUpdateProfile({ ...profile, bio: e.target.value })} />
                        ) : <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{profile.bio}</p>}
                    </div>
                </div>
            </div>

            {showSellModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 border border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Tag className="text-electric-blue" /> Sell Item
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                                <input type="text" className="w-full border-b-2 border-gray-200 dark:border-gray-700 bg-transparent py-2 text-lg focus:outline-none focus:border-electric-blue dark:text-white" placeholder="e.g. Casio FX" value={sellItemName} onChange={(e) => setSellItemName(e.target.value)} />
                            </div>
                            {estimatedPrice && <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800 text-green-800 dark:text-green-300 text-sm">{estimatedPrice}</div>}
                            <div className="flex gap-3 mt-6">
                                <button onClick={handleEstimatePrice} disabled={isEstimating || !sellItemName} className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-electric-blue font-bold py-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex justify-center items-center gap-2">
                                    {isEstimating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />} AI Price
                                </button>
                                <button onClick={() => setShowSellModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-200 transition">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileTab;