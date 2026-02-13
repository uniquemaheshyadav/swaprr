import React, { useState, useRef } from 'react';
import { X, Wand2, Loader2, Upload, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Category, Item, UserProfile } from '../types';
import { generateImageKeyword } from '../services/geminiService';
import { cleanItemDescription, generateItemImage } from '../services/openaiService';
import { uploadImage } from '../services/storageService';
import { addItem } from '../services/firestoreService';

import { useAuth } from '../context/AuthContext';

interface ListModalProps {
  onClose: () => void;
  onAddItem: (item: Item) => void;
  userProfile: UserProfile;
}

const ListModal: React.FC<ListModalProps> = ({ onClose, onAddItem, userProfile }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Item');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // OpenAI Loading State
  const [isPolishing, setIsPolishing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateImage = async () => {
    if (!title.trim()) return;
    setLoadingImage(true);
    try {
      // Use DALL-E 3 for high-quality product image generation
      const generatedUrl = await generateItemImage(title, category);

      if (generatedUrl && generatedUrl.startsWith('http')) {
        setImageUrl(generatedUrl);
      } else {
        // Fallback if DALL-E fails silently or returns empty
        const keyword = await generateImageKeyword(title);
        setImageUrl(`https://source.unsplash.com/random/600x600/?${encodeURIComponent(keyword)}&sig=${Math.random()}`);
      }
    } catch (e) {
      console.error("Image gen failed", e);
      // Fallback
      setImageUrl(`https://placehold.co/600x600?text=${encodeURIComponent(title)}`);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoadingImage(true);
      setIsUploading(true);
      try {
        const url = await uploadImage(file);
        setImageUrl(url);
      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload image.");
      } finally {
        setLoadingImage(false);
        setIsUploading(false);
      }
    }
  };

  const handleAIPolish = async () => {
    if (!description.trim()) return;
    setIsPolishing(true);
    try {
      const polishedText = await cleanItemDescription(description, category);
      setDescription(polishedText);
    } catch (e) {
      console.error("Polish failed", e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !price) return;

    // Create temporary Item to push optimally
    // Ideally we wait for ID, but for UI responsiveness we can mock it or wait.
    // Let's wait for the real ID.

    // Validate Auth
    if (!currentUser || !currentUser.uid) {
      alert("You must be logged in to list an item.");
      return;
    }

    const newItem: Item = {
      id: '', // Will be set by firestore
      title,
      description: description || `A ${category} available for swap.`,
      category,
      price,
      image: imageUrl || 'https://picsum.photos/600/600?grayscale',
      owner: userProfile.name,
      ownerId: currentUser.uid, // Guaranteed by check above
      college: userProfile.college,
      location: { lat: 18.5204, lng: 73.8567 }
    };

    try {
      const id = await addItem(newItem);
      if (id) {
        onAddItem({ ...newItem, id });
        onClose();
      }
    } catch (error) {
      console.error("Failed to list item", error);
      alert("Failed to list item. Please try again.");
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

      <div className="bg-white dark:bg-dark-card w-full md:w-[420px] rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 pointer-events-auto z-50 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">List Swapp</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Image Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative border-2 border-dashed border-gray-300 dark:border-gray-700 group cursor-pointer hover:border-electric-blue transition-colors"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <Upload size={32} className="mb-2" />
                <span className="text-xs font-bold uppercase">Tap to Upload</span>
              </div>
            )}

            {loadingImage && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <Loader2 className="animate-spin mb-2 text-electric-blue" size={32} />
                <span className="text-xs font-bold animate-pulse text-electric-blue">
                  {isUploading ? "Uploading..." : "AI Generating..."}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateImage}
              disabled={loadingImage || !title}
              className="flex-1 py-3 bg-blue-50 dark:bg-blue-900/20 text-electric-blue font-bold rounded-xl border border-blue-100 dark:border-blue-900 flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition disabled:opacity-50"
            >
              <Wand2 size={18} />
              <span>AI Gen Image</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <ImageIcon size={18} />
              <span>Upload</span>
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />

          {/* Inputs */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Graphic Tablet"
              className="w-full p-3 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Description</label>
              <button
                onClick={handleAIPolish}
                disabled={isPolishing || !description}
                className="flex items-center gap-1 text-[10px] font-bold text-purple-500 hover:text-purple-400 disabled:opacity-50"
              >
                {isPolishing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                AI POLISH (GPT-4o)
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Barely used, comes with box..."
              rows={3}
              className="w-full p-3 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue resize-none text-sm"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full p-3 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue appearance-none"
              >
                <option value="Item">Item</option>
                <option value="Study">Study</option>
                <option value="Skill">Skill</option>
              </select>
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹"
                className="w-full p-3 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-electric-blue"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title || !price}
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Check size={20} />
            List Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListModal;