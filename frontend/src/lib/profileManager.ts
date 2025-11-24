/**
 * User Profile Management System
 * Handles user profiles, avatars, and metadata
 */

export interface UserProfile {
    address: string;
    username: string;
    avatar?: string; // IPFS CID or data URL
    bio?: string;
    publicKey?: string;
    createdAt: number;
    updatedAt: number;
}

export interface Contact {
    address: string;
    username: string;
    avatar?: string;
    addedAt: number;
    notes?: string;
}

const PROFILE_STORAGE_KEY = 'inbox3_profile_';
const CONTACTS_STORAGE_KEY = 'inbox3_contacts';

export class ProfileManager {
    /**
     * Get user profile from local storage
     */
    getProfile(address: string): UserProfile | null {
        try {
            const stored = localStorage.getItem(`${PROFILE_STORAGE_KEY}${address}`);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading profile:', error);
            return null;
        }
    }

    /**
     * Save or update user profile
     */
    saveProfile(profile: UserProfile): void {
        try {
            profile.updatedAt = Date.now();
            localStorage.setItem(
                `${PROFILE_STORAGE_KEY}${profile.address}`,
                JSON.stringify(profile)
            );
            console.log('✓ Profile saved successfully');
        } catch (error) {
            console.error('Error saving profile:', error);
            throw new Error('Failed to save profile');
        }
    }

    /**
     * Create a new profile for user
     */
    createProfile(address: string, username: string, publicKey?: string): UserProfile {
        const profile: UserProfile = {
            address,
            username,
            publicKey,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.saveProfile(profile);
        return profile;
    }

    /**
     * Update profile avatar
     */
    updateAvatar(address: string, avatarCid: string): void {
        const profile = this.getProfile(address);
        if (!profile) throw new Error('Profile not found');
        profile.avatar = avatarCid;
        this.saveProfile(profile);
    }

    /**
     * Update profile bio
     */
    updateBio(address: string, bio: string): void {
        const profile = this.getProfile(address);
        if (!profile) throw new Error('Profile not found');
        profile.bio = bio;
        this.saveProfile(profile);
    }

    /**
     * Get all contacts
     */
    getContacts(): Contact[] {
        try {
            const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading contacts:', error);
            return [];
        }
    }

    /**
     * Add a new contact
     */
    addContact(contact: Omit<Contact, 'addedAt'>): void {
        const contacts = this.getContacts();

        // Check if contact already exists
        if (contacts.some(c => c.address === contact.address)) {
            throw new Error('Contact already exists');
        }

        contacts.push({
            ...contact,
            addedAt: Date.now()
        });

        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
        console.log('✓ Contact added successfully');
    }

    /**
     * Remove a contact
     */
    removeContact(address: string): void {
        const contacts = this.getContacts();
        const filtered = contacts.filter(c => c.address !== address);
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(filtered));
        console.log('✓ Contact removed successfully');
    }

    /**
     * Update contact notes
     */
    updateContactNotes(address: string, notes: string): void {
        const contacts = this.getContacts();
        const contact = contacts.find(c => c.address === address);

        if (!contact) throw new Error('Contact not found');

        contact.notes = notes;
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    }

    /**
     * Search contacts by username or address
     */
    searchContacts(query: string): Contact[] {
        const contacts = this.getContacts();
        const lowerQuery = query.toLowerCase();

        return contacts.filter(c =>
            c.username.toLowerCase().includes(lowerQuery) ||
            c.address.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get contact by address
     */
    getContact(address: string): Contact | null {
        const contacts = this.getContacts();
        return contacts.find(c => c.address === address) || null;
    }

    /**
     * Clear all data (for logout)
     */
    clearAll(address: string): void {
        localStorage.removeItem(`${PROFILE_STORAGE_KEY}${address}`);
        console.log('✓ Profile data cleared');
    }
}

// Singleton instance
export const profileManager = new ProfileManager();
