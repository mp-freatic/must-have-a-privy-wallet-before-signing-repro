import { Stack } from "@mui/material";
import { useSelector } from "react-redux";

import { selectAveragePrice, selectFloorPrice } from "src/slices/marketSlice";

import NFTMarketStat from "src/components/NFTMarketStat";

export default function NFTMarketStats({ onPriceClick }) {
    const floorPrice = useSelector(selectFloorPrice);
    const averagePrice = useSelector(selectAveragePrice);

    return (
        <Stack gap={2}>
            <NFTMarketStat
                label="Current floor"
                value={floorPrice}
                onClick={onPriceClick}
            />
            <NFTMarketStat
                label="Average price"
                value={averagePrice}
                onClick={onPriceClick}
            />
        </Stack>
    );
}
