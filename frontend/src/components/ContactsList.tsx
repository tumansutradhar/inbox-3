import { useState, useEffect } from 'react';
import { profileManager, type Contact } from '../lib/profileManager';

interface ContactsListProps {
    onSelectContact?: (address: string) => void;
}

export default function ContactsList({ onSelectContact }: ContactsListProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContact, setNewContact] = useState({ address: '', username: '', notes: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = () => {
        const allContacts = profileManager.getContacts();
        setContacts(allContacts);
    };

    const handleAddContact = () => {
        if (!newContact.address.trim() || !newContact.username.trim()) {
            showMessage('error', 'Address and username are required');
            return;
        }

        try {
            profileManager.addContact({
                address: newContact.address.trim(),
                username: newContact.username.trim(),
                notes: newContact.notes.trim()
            });

            loadContacts();
            setNewContact({ address: '', username: '', notes: '' });
            setShowAddForm(false);
            showMessage('success', 'Contact added successfully');
        } catch (error) {
            showMessage('error', error instanceof Error ? error.message : 'Failed to add contact');
        }
    };

    const handleRemoveContact = (address: string) => {
        if (!confirm('Are you sure you want to remove this contact?')) return;

        try {
            profileManager.removeContact(address);
            loadContacts();
            showMessage('success', 'Contact removed');
        } catch (error) {
            showMessage('error', 'Failed to remove contact');
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const filteredContacts = searchQuery.trim()
        ? profileManager.searchContacts(searchQuery)
        : contacts;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Contacts</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    {showAddForm ? 'Cancel' : '+ Add Contact'}
                </button>
            </div>

            {message && (
                <div
                    className={`mb-4 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Add Contact Form */}
            {showAddForm && (
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Add New Contact</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Wallet Address *</label>
                        <input
                            type="text"
                            value={newContact.address}
                            onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                            placeholder="0x..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Username *</label>
                        <input
                            type="text"
                            value={newContact.username}
                            onChange={(e) => setNewContact({ ...newContact, username: e.target.value })}
                            placeholder="Enter name"
                            maxLength={30}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                        <textarea
                            value={newContact.notes}
                            onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                            placeholder="Add notes about this contact..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <button
                        onClick={handleAddContact}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Add Contact
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contacts by name or address..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Contacts List */}
            {filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    {searchQuery ? 'No contacts found' : 'No contacts yet. Add your first contact above!'}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredContacts.map((contact) => (
                        <div
                            key={contact.address}
                            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        {contact.avatar ? (
                                            <img
                                                src={`https://gateway.pinata.cloud/ipfs/${contact.avatar}`}
                                                alt={contact.username}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-xl text-blue-600 font-semibold">
                                                    {contact.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold">{contact.username}</h3>
                                            <p className="text-sm text-gray-500 truncate">{contact.address}</p>
                                        </div>
                                    </div>

                                    {contact.notes && (
                                        <p className="text-sm text-gray-600 mt-2 ml-15">{contact.notes}</p>
                                    )}

                                    <p className="text-xs text-gray-400 mt-2 ml-15">
                                        Added {new Date(contact.addedAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    {onSelectContact && (
                                        <button
                                            onClick={() => onSelectContact(contact.address)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                                        >
                                            Message
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRemoveContact(contact.address)}
                                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
                {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
                {searchQuery && ` (filtered from ${contacts.length} total)`}
            </div>
        </div>
    );
}
