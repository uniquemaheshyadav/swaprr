import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import { Item, UserProfile } from '../types';
import { MOCK_CARDS, INITIAL_PROFILE } from '../constants';

const ITEMS_COLLECTION = 'items';
const USERS_COLLECTION = 'users';

// --- Items ---

export const fetchItems = async (): Promise<Item[]> => {
    try {
        const q = query(collection(db, ITEMS_COLLECTION), orderBy('createdAt', 'desc')); // Show newest first
        const querySnapshot = await getDocs(q);
        const items: Item[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.ownerId) {
                items.push({ ...data, id: doc.id } as Item);
            }
        });

        // If no items in DB, return mocks so the app isn't empty for new users
        if (items.length === 0) {
            return MOCK_CARDS;
        }

        return items;
    } catch (error) {
        console.error("Error fetching items:", error);
        return MOCK_CARDS; // Fallback
    }
};

export const subscribeToItems = (callback: (items: Item[]) => void): Unsubscribe => {
    const q = query(collection(db, ITEMS_COLLECTION), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const items: Item[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Filter out items without ownerId to prevent chat errors
            if (data.ownerId) {
                items.push({ ...data, id: doc.id } as Item);
            }
        });

        // If empty, use mocks (optional, or handle in UI)
        if (items.length === 0) {
            callback(MOCK_CARDS);
        } else {
            callback(items);
        }
    }, (error) => {
        console.error("Error invoking subscription:", error);
    });
};

export const addItem = async (item: Item): Promise<string | null> => {
    try {
        // We explicitly remove 'id' because Firestore generates it, 
        // but our Item type usually has it. 
        // However, looking at the type, if we want to treat the Firestore ID as the Item ID,
        // we should let Firestore generate it first.
        const { id, ...itemData } = item;
        const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
            ...itemData,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding item:", error);
        throw error;
    }
};

// --- User Profile ---

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting profile:", error);
        return null;
    }
};

export const createUserProfile = async (userId: string, email: string, name?: string) => {
    try {
        const userProfile: UserProfile = {
            ...INITIAL_PROFILE,
            name: name || email.split('@')[0],
            // We can add email to profile if needed, but UserProfile type might need update
        };

        await setDoc(doc(db, USERS_COLLECTION, userId), userProfile);
        return userProfile;
    } catch (error) {
        console.error("Error creating profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};
