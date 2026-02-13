
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    onSnapshot,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    limit,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChatSession, Message, UserProfile } from '../types';
import { getUserProfile } from './firestoreService';

const CHATS_COLLECTION = 'chats';

// Create or Get existing chat
export const createChat = async (currentUserId: string, otherUserId: string): Promise<string> => {
    try {
        // Deterministic Chat ID to prevent duplicates
        const chatId = currentUserId < otherUserId
            ? `${currentUserId}_${otherUserId}`
            : `${otherUserId}_${currentUserId}`;

        const chatDocRef = doc(db, CHATS_COLLECTION, chatId);
        const chatDoc = await getDoc(chatDocRef);

        if (chatDoc.exists()) {
            return chatDoc.id;
        }

        // 2. Create new chat if it doesn't exist
        const otherUserProfile = await getUserProfile(otherUserId);
        const currentUserProfile = await getUserProfile(currentUserId);

        const newChatData = {
            participants: [currentUserId, otherUserId],
            participantData: {
                [currentUserId]: {
                    name: currentUserProfile?.name || 'User',
                    avatar: currentUserProfile?.avatar || ''
                },
                [otherUserId]: {
                    name: otherUserProfile?.name || 'User',
                    avatar: otherUserProfile?.avatar || ''
                }
            },
            lastMessage: 'Start chatting!',
            timestamp: serverTimestamp(),
            unreadCount: {
                [currentUserId]: 0,
                [otherUserId]: 0
            }
        };

        await setDoc(chatDocRef, newChatData);
        return chatId;

    } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
    }
};

// Send Message
export const sendMessage = async (chatId: string, senderId: string, text: string) => {
    try {
        const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
        await addDoc(messagesRef, {
            senderId,
            text,
            timestamp: serverTimestamp()
        });

        // Update last message in chat document
        const chatRef = doc(db, CHATS_COLLECTION, chatId);
        await updateDoc(chatRef, {
            lastMessage: text,
            timestamp: serverTimestamp()
            // In a real app, we'd increment unread counts here transactionally
        });

    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

// Subscribe to User's Chat List
export const subscribeToChats = (userId: string, callback: (chats: ChatSession[]) => void, errorCallback?: (error: any) => void) => {
    const q = query(
        collection(db, CHATS_COLLECTION),
        where('participants', 'array-contains', userId)
        // orderBy('timestamp', 'desc') // Removed to avoid index requirement
    );

    return onSnapshot(q, (snapshot) => {
        const chats: ChatSession[] = snapshot.docs.map(doc => {
            const data = doc.data();

            // Determine other user
            const otherUserId = data.participants.find((id: string) => id !== userId) || '';
            const otherUser = data.participantData?.[otherUserId] || { name: 'User', avatar: '' };

            return {
                id: doc.id,
                userId: otherUserId,
                userName: otherUser.name,
                userAvatar: otherUser.avatar,
                lastMessage: data.lastMessage,
                unreadCount: data.unreadCount?.[userId] || 0,
                // Handle timestamp being null (serverTimestamp hasn't fired yet) or a Timestamp object
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                rawTimestamp: data.timestamp, // Keep raw for sorting
                participants: data.participants,
                messages: []
            } as any; // Cast to any to include rawTimestamp for sorting
        });

        // Client-side Sort
        chats.sort((a: any, b: any) => {
            const timeA = a.rawTimestamp?.toMillis ? a.rawTimestamp.toMillis() : 0;
            const timeB = b.rawTimestamp?.toMillis ? b.rawTimestamp.toMillis() : 0;
            return timeB - timeA; // Descending
        });

        callback(chats);
    }, (error) => {
        console.error("Error in subscribeToChats:", error);
        if (errorCallback) errorCallback(error);
    });
};

// Subscribe to Messages in a Chat
export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
    const q = query(
        collection(db, CHATS_COLLECTION, chatId, 'messages'),
        orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages: Message[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                senderId: data.senderId,
                text: data.text,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                isMe: false // Calculated in UI
            } as Message;
        });
        callback(messages);
    }, (error) => {
        console.error("Error in subscribeToMessages:", error);
    });
};
