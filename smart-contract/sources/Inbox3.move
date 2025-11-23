module inbox3::Inbox3 {
    use std::vector;
    use aptos_std::table;
    use aptos_std::timestamp;
    use aptos_std::signer;
    use std::string::String;
    use aptos_framework::account;
    use aptos_framework::bcs;

    /// A single message
    struct Message has copy, drop, store {
        sender: address,
        cid: vector<u8>,   // IPFS CID
        timestamp: u64,
        read: bool,
    }

    /// One per user, stored under their own account
    struct Inbox has key {
        messages: table::Table<u64, Message>,
        next_id: u64,
    }

    /// A group message
    struct GroupMessage has copy, drop, store {
        sender: address,
        cid: vector<u8>,
        timestamp: u64,
    }

    /// A group chat resource
    struct Group has key {
        name: String,
        members: vector<address>,
        messages: table::Table<u64, GroupMessage>,
        next_msg_id: u64,
    }

    /// Track which groups a user belongs to
    struct UserGroups has key {
        groups: vector<address>,
    }

    /// Call *once* per user to create an inbox
    public entry fun create_inbox(user: &signer) {
        let addr = signer::address_of(user);
        if (!exists<Inbox>(addr)) {
            move_to(user, Inbox { messages: table::new(), next_id: 0 });
        };
        if (!exists<UserGroups>(addr)) {
            move_to(user, UserGroups { groups: vector::empty() });
        };
    }

    /// Anyone can send a message to an address that already has an Inbox
    public entry fun send_message(
        sender: &signer,
        recipient: address,
        cid: vector<u8>
    ) acquires Inbox {
        assert!(exists<Inbox>(recipient), 3); // Recipient must have an inbox
        let inbox = borrow_global_mut<Inbox>(recipient);
        let id = inbox.next_id;
        inbox.next_id = id + 1;
        let msg = Message {
            sender: signer::address_of(sender),
            cid,
            timestamp: timestamp::now_seconds(),
            read: false,
        };
        table::add(&mut inbox.messages, id, msg);
    }

    /// Recipient marks one message as read
    public entry fun mark_read(recipient: &signer, id: u64) acquires Inbox {
        let inbox = borrow_global_mut<Inbox>(signer::address_of(recipient));
        assert!(table::contains(&inbox.messages, id), 1); // Message must exist
        let m = table::borrow_mut(&mut inbox.messages, id);
        m.read = true;
    }

    /// Create a new group
    public entry fun create_group(creator: &signer, name: String) acquires UserGroups {
        let creator_addr = signer::address_of(creator);
        
        // Create a resource account for the group to ensure unique address
        let seed = *std::string::bytes(&name);
        vector::append(&mut seed, bcs::to_bytes(&creator_addr));
        vector::append(&mut seed, bcs::to_bytes(&timestamp::now_microseconds()));

        let (group_signer, _signer_cap) = account::create_resource_account(creator, seed);
        let group_addr = signer::address_of(&group_signer);
        
        let members = vector::empty();
        vector::push_back(&mut members, creator_addr);

        move_to(&group_signer, Group {
            name,
            members,
            messages: table::new(),
            next_msg_id: 0,
        });

        // Add to creator's group list
        if (!exists<UserGroups>(creator_addr)) {
            move_to(creator, UserGroups { groups: vector::empty() });
        };
        let user_groups = borrow_global_mut<UserGroups>(creator_addr);
        vector::push_back(&mut user_groups.groups, group_addr);
    }

    /// Join a group (open to anyone for now)
    public entry fun join_group(user: &signer, group_addr: address) acquires Group, UserGroups {
        assert!(exists<Group>(group_addr), 4); // Group must exist
        let user_addr = signer::address_of(user);
        let group = borrow_global_mut<Group>(group_addr);
        
        if (!vector::contains(&group.members, &user_addr)) {
            vector::push_back(&mut group.members, user_addr);
            
            // Add to user's group list
            if (!exists<UserGroups>(user_addr)) {
                move_to(user, UserGroups { groups: vector::empty() });
            };
            let user_groups = borrow_global_mut<UserGroups>(user_addr);
            if (!vector::contains(&user_groups.groups, &group_addr)) {
                vector::push_back(&mut user_groups.groups, group_addr);
            };
        }
    }

    /// Send a message to a group
    public entry fun send_group_message(sender: &signer, group_addr: address, cid: vector<u8>) acquires Group {
        assert!(exists<Group>(group_addr), 4);
        let sender_addr = signer::address_of(sender);
        let group = borrow_global_mut<Group>(group_addr);
        
        // Check membership
        assert!(vector::contains(&group.members, &sender_addr), 5); // Must be member

        let id = group.next_msg_id;
        group.next_msg_id = id + 1;
        
        let msg = GroupMessage {
            sender: sender_addr,
            cid,
            timestamp: timestamp::now_seconds(),
        };
        table::add(&mut group.messages, id, msg);
    }

    #[view]
    /// Return the full inbox (view function)
    public fun inbox_of(addr: address): vector<Message> acquires Inbox {
        if (!exists<Inbox>(addr)) {
            vector::empty<Message>()
        } else {
            let ib = borrow_global<Inbox>(addr);
            let messages = vector::empty<Message>();
            let i = 0;
            while (i < ib.next_id) {
                if (table::contains(&ib.messages, i)) {
                    let msg = *table::borrow(&ib.messages, i);
                    vector::push_back(&mut messages, msg);
                };
                i = i + 1;
            };
            messages
        }
    }

    #[view]
    /// Get total number of messages for an address
    public fun get_message_count(addr: address): u64 acquires Inbox {
        if (!exists<Inbox>(addr)) {
            0
        } else {
            let ib = borrow_global<Inbox>(addr);
            ib.next_id
        }
    }

    #[view]
    /// Get a specific message by ID
    public fun get_message(addr: address, id: u64): Message acquires Inbox {
        let ib = borrow_global<Inbox>(addr);
        assert!(table::contains(&ib.messages, id), 2); // Message must exist
        *table::borrow(&ib.messages, id)
    }

    #[view]
    /// Check if an inbox exists for an address
    public fun inbox_exists(addr: address): bool {
        exists<Inbox>(addr)
    }

    #[view]
    /// Get groups a user is in
    public fun get_user_groups(addr: address): vector<address> acquires UserGroups {
        if (!exists<UserGroups>(addr)) {
            vector::empty()
        } else {
            borrow_global<UserGroups>(addr).groups
        }
    }

    #[view]
    /// Get group details
    public fun get_group_info(group_addr: address): (String, vector<address>) acquires Group {
        let group = borrow_global<Group>(group_addr);
        (group.name, group.members)
    }

    #[view]
    /// Get group messages
    public fun get_group_messages(group_addr: address): vector<GroupMessage> acquires Group {
        if (!exists<Group>(group_addr)) {
            vector::empty()
        } else {
            let group = borrow_global<Group>(group_addr);
            let messages = vector::empty<GroupMessage>();
            let i = 0;
            while (i < group.next_msg_id) {
                if (table::contains(&group.messages, i)) {
                    let msg = *table::borrow(&group.messages, i);
                    vector::push_back(&mut messages, msg);
                };
                i = i + 1;
            };
            messages
        }
    }
}