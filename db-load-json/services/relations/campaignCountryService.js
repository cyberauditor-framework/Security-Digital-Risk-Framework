export const getCampaignCountriesRelation = (fullCampaigns) => {
	const campaignCountriesRelations = [];

	for (const campaign of fullCampaigns) {
		const campaignId = campaign.interpressId || campaign.id;

		if (campaign.countries && campaign.countries.length > 0) {
			campaign.countries.forEach((countryId) => {
				campaignCountriesRelations.push({
					campaign_id: campaignId,
					country_id: countryId,
				});
			});
		}
	}

	return campaignCountriesRelations;
};
