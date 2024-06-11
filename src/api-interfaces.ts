// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

interface PostPublicationRequestDataResponse {
    message_identifier: string;
}

interface TopicsQueryArgs {
    skip: number;
    take: number | string;
    term: string | null;
}

interface PostReferralFavoriteTopicRequestArgs {
    topic_id: number;
}

interface PostAuthRequestArgs {
    referral_code: string | null;
}

interface GetSettingsResponse {
    max_free_publication_requests: number;
}

interface PostPublicationRequestDataRequestArgs {
    topic_id: number;
    content: string;
    nft_id: number | null;
}

interface GetFeedSubscribersRequestArgs {
    skip: number;
    take: number | string;
}

interface GetEventsRequestArgs {
    skip: number;
    take: number;
    filter_type: string;
    feed_addresses: Array<string>;
}

interface GetPublicKeyResponse {
    wallet_address: string;
    public_key: string;
}

interface BurnedSubscription {
    id: number;
    topic_id: number;
    subscriber_id: number;
    token_id: number;
    contract_address: string;
    topic: Topic | null;
    subscriber: ProfileData | null;
}

interface Topic {
    id: number;
    name: string;
    color: string;
    description: string;
    created_at: string;
    updated_at: string;
    subscription_count: number | null;
    message_count: number | null;
}

interface PostTopicRequestsRequestArgs {
    name: string;
    description: string;
}

interface GetNftsRequestArgs {
    topic_id: number | null;
    owner_wallet_address: string | null;
    with_deleted: boolean | null;
    message_identifier: string | null;
    is_disabled: boolean | null;
    skip: number;
    take: number | string;
}

interface PostPublicKeyRequestArgs {
    public_key: string;
}

interface GetProfileWalletAddressFromFundingCodeResponse {
    wallet_address: string;
}

interface GetTopicRequestsResponse {
    total: number;
    data: Array<TopicRequest>;
}

interface GetPublicationRequestsResponse {
    count: number;
    publication_requests: Array<MessageData>;
}

interface GetMessagesResponse {
    total_count: number;
    messages: Array<any>;
}

interface MessageData {
    tlp_proof_hash: string | null;
    message_identifier: string;
    revealed_data: string;
    sent_to_contract_at: string | null;
    finished_notifying_at: string | null;
    revealed_at: string | null;
    vote_closed: boolean;
    contract_address: string;
    burnt_nft_id: number | null;
    has_attachments: boolean;
    owner: ProfileData | null;
    subscriptions_count: number;
    topic: Topic | null;
    total_revenue_wei: number;
}

interface VotesCount {
    total_votes: number;
    upvotes: number;
    downvotes: number;
}

interface MessageAndPublicationRequestsComputedFields {
    votes: VotesCount;
    can_vote: boolean;
    user_vote: number;
}

interface NeedsPaymentEncryptedMessage {
    needs_payment: boolean;
    burning_rate: number;
}

interface MessageComputedFields {
    tlp_data: string | null;
    number_of_subscribers_sent_to: number;
    your_spot: number | null;
    current_reader_spot: number | null;
    next_subscribers: Array<ProfileData> | null;
    next_turn_deadline: string | null;
    is_read: boolean;
    received_at: string | null;
    encrypted_message: boolean | string | NeedsPaymentEncryptedMessage | null;
    payment_completed_at: string | null;
    encrypted_key: string | null;
}

interface GetFeedPublishersResponse {
    total: number;
    total_verified: number;
    publishers: Array<ProfileData>;
}

interface GetAllPushNotificationSubscriptionResponse {
    push_notifications: any;
}

interface PostVoteRequestArgs {
    is_upvote: boolean;
}

interface ProfileData {
    funding_code: string | null;
    created_at: string;
    updated_at: string;
    last_updated: string;
    name: string | null;
    username: string | null;
    wallet_address: string;
    picture_url: string | null;
    public_key: string | null;
    slow_message_revenue: number;
    subscription_revenue: string;
    key_derivation_nonce: string | null;
    origin: string;
    social_network_type: string | null;
    social_network_id: string | null;
    score: number | null;
    is_verified: boolean | null;
}

interface ProfileMetadata {
    has_sent_first_secret_post: boolean;
    has_sent_first_post_request: boolean;
    hidden_messages_number: number;
    has_subscribed_to_any_topic: boolean;
    has_referred_users: boolean;
    referral_link: string;
    referral_favorite_topic_id: number | null;
}

interface SubscriptionData {
    id: number;
    created_at: string;
    updated_at: string;
    contract_address: string;
    burning_rate: number;
    token_id: number;
    total_fees: number;
    subscriber_id: number;
    topic_id: number;
    topic: Topic | null;
    subscriber: ProfileData | null;
}

interface GetTokenIdsToBeBurnedResponse {
    token_ids: Array<number>;
}

interface GetSkipTakeRequestArgs {
    skip: number;
    take: number;
}

interface Subscription {
    profile: ProfileData;
    burning_rate: number;
    token_id: number;
    subscriber: string;
}

interface TopicRequest {
    id: number;
    name: string;
    description: string;
    owner_id: number;
    owner: ProfileData | null;
}

interface PostAuthResponse {
    profile: ProfileData;
    metadata: ProfileMetadata;
    is_signed_in_twitter: boolean;
    is_signed_in: boolean;
}

interface GetSubscribersRankingResponse {
    total: number;
    subscribers: Array<SubscriptionData>;
}

interface GetPushNotificationSubscriptionResponse {
    subscribed: boolean;
}

interface GetSubscribersRankingRequestArgs {
    skip: number;
    take: number;
    contract_address: string;
}

interface PostReferralRequestArgs {
    referral_code: string;
}

interface GetProfileFundingCodeResponse {
    code: string;
}

interface GetNftsResponse {
    total: number;
    nfts: Array<NftData>;
}

interface ChatMessage {
    id: number;
    text: string;
    from_user: ProfileData | null;
    to_user: ProfileData | null;
    message: MessageData | null;
    from_wallet: string;
    to_wallet: string;
}

interface GetChatMessagesResponse {
    total_number_of_messages: number;
    messages: Array<ChatMessage>;
}

interface NftData {
    owner: string;
    token_id: number;
    topic_id: number;
    topic: Topic | null;
    is_disabled: boolean;
    rewarded_address: string | null;
    token_issued_reason: string | null;
    message_identifier: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

interface SuccessResponse {
    success: boolean;
}

interface GetPublicationRequestsCooldownStatusResponse {
    is_on_cooldown: boolean;
}

interface EncryptedKeyRequestArgs {
    serialized_encrypted_key: string;
    burning_rate: number;
    wallet_address: string;
}

interface EncryptedMessageRequestArgs {
    serialized_encryption: string;
}

interface PostMessageDataRequestArgs {
    message_identifier: string;
    tlp_data: Record<any, any>;
    encrypted_message: EncryptedMessageRequestArgs;
    encrypted_keys: Array<EncryptedKeyRequestArgs>;
    topic_id: number;
    tlp_proof_hash: string | null;
}

interface SocketJoinOrLeaveRequestArgs {
    room: string;
    from_wallet: string;
}

interface GetPublicationRequestsRequestArgs {
    skip: number;
    take: number;
}

interface RevenueData {
    subscription_revenue: number | null;
    slow_message_revenue: number | null;
    referral_revenue: number | null;
}

interface Referral {
    id: number;
    referral_code: string;
    referred: ProfileData | null;
    favorite_topic_id: number;
    favorite_topic: Topic | null;
}

interface GetPublicationRequestResponse {
    publication_request: any;
}

interface GetTopicsResponse {
    total: number;
    topics: Array<Topic>;
}

interface GetMessagesRequestArgs {
    skip: number;
    take: number;
}

interface GetUserReferralProgressByTopicResponse {
    can_post_publication_request_without_nft: boolean;
    remaining_publication_requests_without_nft: number;
}

interface PostMessageDataResponse {
    message_identifier: string;
}

interface SocketMessageRequestArgs {
    room: string;
    from_wallet: string;
    to_wallet: string;
    text: string;
    created_at: string;
}

interface GetFeedSubscribersResponse {
    total: number;
    subscriptions: Array<Subscription>;
}

interface PostChatMessageRequestArgs {
    text: string;
    to: string;
}

interface GetProfileResponse {
    profile: ProfileData;
    metadata: ProfileMetadata;
}
