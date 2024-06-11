import { ObjectToCamel } from "ts-case-convert/lib/caseConvert";
import { GetContractReturnType } from "viem";

export enum PushNotificationType {
    CHAT = "chat",
    TLP = "tlp",
    POST = "post",
    DISTRIBUTION_POSITION = "distribution_position",
    VERIFICATION = "verification",
    PAYMENT = "payment",
    POST_REQUEST = "post_request",
    BURNING = "burning",
    REVEAL = "reveal",
}

export type ContractType = GetContractReturnType;

export type Slowdown = {
    slower: string;
    epochs: number | bigint;
};

export type ParsedTLPData = {
    time_locked_key_bytes: string;
    time_lock_puzzle_modulus_bytes: string;
    time_lock_puzzle_base_bytes: string;
    ciphertext_bytes: string;
    iv_bytes: string;
    expected_time: number;
    iterations: number;
};

export type Message = ObjectToCamel<
    MessageData &
        MessageAndPublicationRequestsComputedFields &
        Omit<MessageComputedFields, "tlp_data">
> & {
    slowdowns?: Slowdown[];
    nftData?: ObjectToCamel<NftData>;
    tlpData: ObjectToCamel<ParsedTLPData> | null;
};

type MessageFromBackend = MessageData &
    MessageAndPublicationRequestsComputedFields &
    MessageComputedFields;

export type GetMessagesResponse = {
    total_count: number;
    messages: MessageFromBackend[];
};

export type PublicationRequest =
    | ObjectToCamel<MessageData & MessageAndPublicationRequestsComputedFields>
    | ObjectToCamel<MessageData>;

export type TokenListingType = {
    orderHash: string;
    listingTimestamp: number;
    expirationTimestamp: number;
    tokenId: number;
    orderMaker: {
        address: string;
    };
    currentPrice: string;
    makerFees: {
        account: {
            address: string;
        };
        basisPoints: string;
    };
};

export type ExtendedNftData = ObjectToCamel<NftData & { discount?: number }>;
