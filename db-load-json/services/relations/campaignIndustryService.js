export const getCampaignIndustriesRelation = (fullCampaigns) => {
	const campaignIndustriesRelations = [];

	for (const campaign of fullCampaigns) {
		const campaignId = campaign.interpressId || campaign.id;

		if (campaign.industries && campaign.industries.length > 0) {
			campaign.industries.forEach((industryId) => {
				campaignIndustriesRelations.push({
					campaign_id: campaignId,
					industry_id: industryId,
				});
			});
		}
	}

	return campaignIndustriesRelations;
};
