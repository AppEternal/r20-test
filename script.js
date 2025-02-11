function _LoadData(){
	const characters = Campaign.characters.models.findAll(
	(character) => character.attributes?.inplayerjournals !== "" || character.attributes?.mancerstep === "lp-welcome" || character.attributes?.mancerstep === "l1-welcome"
	);

	const parsedData = characters.map(async (model) => {
	try {
		if (!model.attribs.backboneFirebase) {
		model.attribs.backboneFirebase = new BackboneFirebase(
			model.attribs
		);
		model.abilities.backboneFirebase = new BackboneFirebase(
			model.abilities
		);

		model.attribsHaveArrived = new Promise(async (resolve) => {
			await model.attribs.backboneFirebase.reference.once("value");
			await model.abilities.backboneFirebase.reference.once("value");
			resolve();
		});
		}
		
		await model.attribsHaveArrived;
		let attribs = model?.attribs?.models ?? []
		let attribsFilter = attribs.map((attrib) => {
			return attrib.attributes
		})
		let abilities = model?.abilities?.models ?? []
		let abilitiesFilter = abilities.map((ability) => {
			return ability.attributes
		})

		function getByName(name){
			return attribsFilter.find((attrib) => attrib.name === name)?.current
		}
		function getByNameMax(name){
			return attribsFilter.find((attrib) => attrib.name === name)?.max
		}
		const items = attribsFilter
		.filter(item => item.name.includes("_itemname")) // Filter only item names
		.map(item => ({
			name: item.current, // The item name
			count: attribsFilter.find(i => i.name === item.name.replace("_itemname", "_itemcount"))?.current || "0",
		}));
		const spells = attribsFilter
		.filter(item => item.name.includes("_spellname")) // Filter only item names
		.map(item => ({
			name: item.current, // The item name
			level: attribsFilter.find(i => i.name === item.name.replace("_spellname", "_spelllevel"))?.current || "0",
		}));


		return {
			name: model?.attributes?.name,
			id: model?.attributes?.id,
			abilityScores: {
				"strength": getByName("strength"),
				"dexterity": getByName("dexterity"),
				"constitution": getByName("constitution"),
				"intelligence": getByName("intelligence"),
				"wisdom": getByName("wisdom"),
				"charisma": getByName("charisma"),
			},
			details:{
				"hp": getByName("hp"),
				"maxhp": getByNameMax("hp"),
				"speed": getByName("speed"),
				"ac": getByName("ac"),
				"level": getByName("level"),
				"alignment": getByName("alignment"),
				"weight": getByName("weighttotal"),
				"spell save": getByName("spell_save_dc"),
				"spell attack": getByName("spell_attack_bonus"),
			},
			money:{
				"copper": getByName("cp") ?? 0,
				"silver": getByName("sp") ?? 0,
				"electrum": getByName("ep") ?? 0,
				"gold": getByName("gp") ?? 0,
				"platinum": getByName("pp") ?? 0,
			},
			items: items,
			spells: spells,
			spellSlots:{
				"1st": getByName("lvl1_slots_total"),
				"2nd": getByName("lvl2_slots_total"),
				"3rd": getByName("lvl3_slots_total"),
				"4th": getByName("lvl4_slots_total"),
				"5th": getByName("lvl5_slots_total"),
				"6th": getByName("lvl6_slots_total"),
				"7th": getByName("lvl7_slots_total"),
				"8th": getByName("lvl8_slots_total"),
				"9th": getByName("lvl9_slots_total"),
			},
			data:{
				dataSet1: JSON.parse(model.attributes?.mancerdata ?? "{}"),
				dataSet2: JSON.parse(model.attributes?.mancerget ?? "{}"),
				attribs: attribsFilter,
				abilities: abilitiesFilter,
				raw: model,
			}
		};
	} catch (error) {
		console.error(error);
		return null;
	}
	});
	Promise.all(parsedData).then((data) => {
		console.log(data);
	});
}
_LoadData()