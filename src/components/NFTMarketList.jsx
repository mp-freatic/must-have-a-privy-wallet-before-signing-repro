import { List, ListItem } from "@mui/material";

import NFTMarketItem from "src/components/NFTMarketItem";

export default function NFTMarketList({
    tokens,
    topicId,
    forSale = false,
    openseaClient,
    murmurNFTContract,
}) {
    return (
        <List>
            {tokens.map((tokenListingInfoOrTokenId) => {
                if (Number.isInteger(tokenListingInfoOrTokenId)) {
                    return (
                        <ListItem key={tokenListingInfoOrTokenId}>
                            <NFTMarketItem
                                tokenId={tokenListingInfoOrTokenId}
                                topicId={topicId}
                                ownedByUser
                                openseaClient={openseaClient}
                                murmurNFTContract={murmurNFTContract}
                            />
                        </ListItem>
                    );
                } else {
                    return (
                        <ListItem key={tokenListingInfoOrTokenId.orderHash}>
                            <NFTMarketItem
                                tokenId={tokenListingInfoOrTokenId.tokenId}
                                tokenListingInfo={tokenListingInfoOrTokenId}
                                topicId={topicId}
                                forSale={forSale}
                                openseaClient={openseaClient}
                                murmurNFTContract={murmurNFTContract}
                            />
                        </ListItem>
                    );
                }
            })}
        </List>
    );
}
