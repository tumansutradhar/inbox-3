import { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { profileManager, type UserProfile } from '../lib/profileManager';
import { encryptionManager } from '../lib/encryptionManager';
import { uploadFile } from '../lib/ipfs';

export default function ProfileEditor() {
    const { account } = useWallet();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (!account?.address) return;

        const existingProfile = profileManager.getProfile(account.address.toString());
        if (existingProfile) {
            setProfile(existingProfile);
            setUsername(existingProfile.username);
            setBio(existingProfile.bio || '');
        }
    }, [account]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !account?.address) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            showMessage('error', 'Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showMessage('error', 'Image must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const cid = await uploadFile(file);
            profileManager.updateAvatar(account.address.toString(), cid);

            const updatedProfile = profileManager.getProfile(account.address.toString());
            setProfile(updatedProfile);
            showMessage('success', 'Avatar updated successfully');
        } catch (error) {
            console.error('Avatar upload failed:', error);
            showMessage('error', 'Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!account?.address) return;
        if (!username.trim()) {
            showMessage('error', 'Username is required');
            return;
        }

        setSaving(true);
        try {
            // Initialize encryption keys if not already done
            await encryptionManager.initializeKeys(account.address.toString());
            const publicKey = encryptionManager.getPublicKeyHex();

            if (profile) {
                // Update existing profile
                const updated: UserProfile = {
                    ...profile,
                    username: username.trim(),
                    bio: bio.trim(),
                    publicKey,
                    updatedAt: Date.now()
                };
                profileManager.saveProfile(updated);
                setProfile(updated);
            } else {
                // Create new profile
                const newProfile = profileManager.createProfile(
                    account.address.toString(),
                    username.trim(),
                    publicKey
                );
                if (bio.trim()) {
                    profileManager.updateBio(account.address.toString(), bio.trim());
                    newProfile.bio = bio.trim();
                }
                setProfile(newProfile);
            }

            showMessage('success', 'Profile saved successfully');
        } catch (error) {
            console.error('Failed to save profile:', error);
            showMessage('error', 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    if (!account) {
        return (
            <div className="p-8 text-center text-(--text-secondary)">
                Please connect your wallet to manage your profile
            </div>
        );
    }

    const avatarUrl = profile?.avatar
        ? `https://gateway.pinata.cloud/ipfs/${profile.avatar}`
        : null;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-(--text-primary)">Edit Profile</h2>

            {message && (
                <div
                    className={`mb-4 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Avatar Section */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-(--text-primary)">Profile Picture</label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-(--bg-secondary) overflow-hidden flex items-center justify-center border-2 border-(--border-color)">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl text-(--text-secondary)">
                                {username.charAt(0).toUpperCase() || '?'}
                            </span>
                        )}
                    </div>
                    <div>
                        <label className="cursor-pointer px-4 py-2 bg-(--primary-brand) text-white rounded-lg hover:opacity-90 transition inline-block">
                            {uploading ? 'Uploading...' : 'Upload Image'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                        <p className="text-sm text-(--text-secondary) mt-2">Max 5MB, JPG or PNG</p>
                    </div>
                </div>
            </div>

            {/* Username */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-(--text-primary)">Username *</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    maxLength={30}
                    className="w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary-brand) text-(--text-primary) placeholder:text-(--text-muted)"
                />
            </div>

            {/* Bio */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-(--text-primary)">Bio</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={200}
                    rows={4}
                    className="w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary-brand) text-(--text-primary) placeholder:text-(--text-muted) resize-none"
                />
                <p className="text-sm text-(--text-secondary) mt-1">{bio.length}/200 characters</p>
            </div>

            {/* Address (read-only) */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-(--text-primary)">Wallet Address</label>
                <input
                    type="text"
                    value={account.address.toString()}
                    readOnly
                    className="w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-lg text-(--text-secondary) font-mono text-sm"
                />
            </div>

            {/* Public Key (read-only) */}
            {profile?.publicKey && (
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-(--text-primary)">Encryption Public Key</label>
                    <input
                        type="text"
                        value={profile.publicKey}
                        readOnly
                        className="w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-lg text-(--text-secondary) font-mono text-sm"
                    />
                    <p className="text-sm text-(--text-secondary) mt-1">Used for end-to-end encrypted messaging</p>
                </div>
            )}

            {/* Save Button */}
            <button
                onClick={handleSaveProfile}
                disabled={saving || !username.trim()}
                className="w-full py-3 bg-(--primary-brand) text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
                {saving ? 'Saving...' : 'Save Profile'}
            </button>

            {profile && (
                <p className="text-sm text-(--text-secondary) text-center mt-4">
                    Profile created {new Date(profile.createdAt).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}
