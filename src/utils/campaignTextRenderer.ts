import { CAMPAIGN_TYPES } from '#business/b2b/campaigns/constants/campaign-types';
import { CampaignForList } from '#business/b2c/lists/types';
import i18n from '#lang/i18n';

export const campaignTextRenderer = (campaigns: CampaignForList[]) => {
  const hasCampaign = campaigns.length > 0;

  const highestCampaignPercentage = hasCampaign
    ? campaigns.reduce((max, campaign) => {
        const metadata = JSON.parse(campaign.campaignMetadata);
        return Math.max(max, metadata?.percentage ?? 0);
      }, 0)
    : 0;

  const highestCampaignFixed = hasCampaign
    ? campaigns.reduce((max, campaign) => {
        const metadata = JSON.parse(campaign.campaignMetadata);
        return Math.max(max, metadata?.fixed ?? 0);
      }, 0)
    : 0;

  const hasBuyXGetYCampaign = campaigns.some(
    campaign => campaign.campaignTypeCode === CAMPAIGN_TYPES.BUY_X_GET_Y
  );

  if (hasBuyXGetYCampaign) {
    return i18n.t('screens.campaigns.buyXGetY');
  }

  return highestCampaignPercentage ? `${highestCampaignPercentage}%` : `${highestCampaignFixed}TL`;
};
