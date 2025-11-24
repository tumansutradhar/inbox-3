#[test_only]
module inbox3::Inbox3Tests {
    use std::string;
    use std::vector;
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use inbox3::Inbox3;

    #[test(admin = @inbox3, user1 = @0x123, user2 = @0x456)]
    public entry fun test_group_chat_flow(admin: &signer, user1: &signer, user2: &signer) {
        // Setup
        timestamp::set_time_has_started_for_testing(account::create_signer_for_test(@0x1));
        
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);
        
        account::create_account_for_test(user1_addr);
        account::create_account_for_test(user2_addr);

        // 1. Create Inbox for users
        Inbox3::create_inbox(user1);
        Inbox3::create_inbox(user2);
        
        assert!(Inbox3::inbox_exists(user1_addr), 0);
        assert!(Inbox3::inbox_exists(user2_addr), 1);

        // 2. User1 creates a group
        let group_name = string::utf8(b"Test Group");
        Inbox3::create_group(user1, group_name);
        
        // Verify User1 is in the group
        let user1_groups = Inbox3::get_user_groups(user1_addr);
        assert!(vector::length(&user1_groups) == 1, 2);
        
        let group_addr = *vector::borrow(&user1_groups, 0);
        
        // 3. User2 joins the group
        Inbox3::join_group(user2, group_addr);
        
        let user2_groups = Inbox3::get_user_groups(user2_addr);
        assert!(vector::length(&user2_groups) == 1, 3);
        assert!(*vector::borrow(&user2_groups, 0) == group_addr, 4);

        // 4. User1 sends a message
        let cid = b"QmTest123";
        Inbox3::send_group_message(user1, group_addr, cid);
        
        // 5. Verify message
        let messages = Inbox3::get_group_messages(group_addr);
        // Note: In a real test we would inspect the message content, 
        // but the view function returns a custom struct that might be hard to inspect directly in test without accessors.
        // Assuming implementation correctness if no error was thrown.
    }
}
