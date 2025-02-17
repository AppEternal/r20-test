function _LoadData() {
	const characters = Campaign.characters.models.findAll(
		(character) =>
			character.attributes?.inplayerjournals !== "" ||
			character.attributes?.mancerstep === "lp-welcome" ||
			character.attributes?.mancerstep === "l1-welcome" ||
			character.attributes?.mancerstep === "l1-summary",
	);

	const parsedData = characters.map(async (model) => {
		try {
			if (window.FILTER_NAMES && window.FILTER_NAMES?.length > 0) {
				if (!window.FILTER_NAMES.includes(model.attributes.name)) {
					return;
				}
			}
			if (!model.attribs.backboneFirebase) {
				model.attribs.backboneFirebase = new BackboneFirebase(model.attribs);
				model.abilities.backboneFirebase = new BackboneFirebase(model.abilities);

				model.attribsHaveArrived = new Promise(async (resolve) => {
					await model.attribs.backboneFirebase.reference.once("value");
					await model.abilities.backboneFirebase.reference.once("value");
					resolve();
				});
			}

			await model.attribsHaveArrived;
			let attribs = model?.attribs?.models ?? [];
			let attribsFilter = attribs.map((attrib) => {
				return attrib.attributes;
			});
			let abilities = model?.abilities?.models ?? [];
			let abilitiesFilter = abilities.map((ability) => {
				return ability.attributes;
			});

			function getByName(name) {
				return attribsFilter.find((attrib) => attrib.name === name)?.current;
			}
			function getByNameMax(name) {
				return attribsFilter.find((attrib) => attrib.name === name)?.max;
			}
			const tools = attribsFilter
				.filter((item) => item.name.includes("_toolname")) // Filter only item names
				.map((item) => ({
					name: item.current, // The item name
				}));
			const proficiencies = attribsFilter
				.filter((item) => item.name.includes("repeating_proficiencies_") && item.name.includes("_name")) // Filter only item names
				.map((item) => ({
					name: item.current, // The item name
				}));
			const resources = attribsFilter
				.filter((item) => item.name.includes("repeating_resource_") && item.name.includes("_resource_left_name")) // Filter only item names
				.map((item) => ({
					name: item.current, // The item name
					current:
						attribsFilter.find((i) => i.name === item.name.replace("_resource_left_name", "_resource_left"))
							?.current || "0",
					max:
						attribsFilter.find((i) => i.name === item.name.replace("_resource_left_name", "_resource_left"))
							?.max || "0",
					pb:
						attribsFilter.find(
							(i) => i.name === item.name.replace("_resource_left_name", "s_resource_left_use_pb"),
						)?.current || "0",
				}));
			const traits = attribsFilter
				.filter((item) => item.name.includes("repeating_traits_") && item.name.includes("_name")) // Filter only item names
				.map((item) => ({
					name: item.current, // The item name
					description:
						attribsFilter.find((i) => i.name === item.name.replace("_name", "_description"))?.current || "0",
					source: attribsFilter.find((i) => i.name === item.name.replace("_name", "_source"))?.current || "0",
				}));
			const items = attribsFilter
				.filter((item) => item.name.includes("_itemname")) // Filter only item names
				.map((item) => ({
					name: item.current, // The item name
					count:
						attribsFilter.find((i) => i.name === item.name.replace("_itemname", "_itemcount"))?.current || "0",
				}));
			const spells = attribsFilter
				.filter((item) => item.name.includes("_spellname")) // Filter only item names
				.map((item) => ({
					name: item.current, // The item name
					level:
						attribsFilter.find((i) => i.name === item.name.replace("_spellname", "_spelllevel"))?.current || "0",
				}));

			return {
				name: model?.attributes?.name,
				id: model?.attributes?.id,
				abilityScores: {
					strength: getByName("strength"),
					dexterity: getByName("dexterity"),
					constitution: getByName("constitution"),
					intelligence: getByName("intelligence"),
					wisdom: getByName("wisdom"),
					charisma: getByName("charisma"),
				},
				abilitySaves: {
					strength: getByName("charisma_save_bonus"),
					dexterity: getByName("dexterity_save_bonus"),
					constitution: getByName("constitution_save_bonus"),
					intelligence: getByName("intelligence_save_bonus"),
					wisdom: getByName("wisdom_save_bonus"),
					charisma: getByName("charisma_save_bonus"),
				},
				details: {
					hp: getByName("hp"),
					"max Hp": getByNameMax("hp"),
					speed: getByName("speed"),
					ac: getByName("ac"),
					level: getByName("level"),
					alignment: getByName("alignment"),
					weight: getByName("weighttotal"),
					"spell Save": getByName("spell_save_dc"),
					"spell Attack": getByName("spell_attack_bonus"),
				},
				money: {
					copper: getByName("cp") ?? 0,
					silver: getByName("sp") ?? 0,
					electrum: getByName("ep") ?? 0,
					gold: getByName("gp") ?? 0,
					platinum: getByName("pp") ?? 0,
				},
				skills: {
					acrobatics: getByName("acrobatics_bonus") ?? 0,
					animalHandling: getByName("animal_handling_bonus") ?? 0,
					arcana: getByName("arcana_bonus") ?? 0,
					athletics: getByName("athletics_bonus") ?? 0,
					deception: getByName("deception_bonus") ?? 0,
					history: getByName("history_bonus") ?? 0,
					insight: getByName("insight_bonus") ?? 0,
					intimidation: getByName("intimidation_bonus") ?? 0,
					investigation: getByName("investigation_bonus") ?? 0,
					medicine: getByName("medicine_bonus") ?? 0,
					nature: getByName("nature_bonus") ?? 0,
					perception: getByName("perception_bonus") ?? 0,
					performance: getByName("performance_bonus") ?? 0,
					persuasion: getByName("persuasion_bonus") ?? 0,
					religion: getByName("religion_bonus") ?? 0,
					sleightOfHand: getByName("sleight_of_hand_bonus") ?? 0,
					stealth: getByName("stealth_bonus") ?? 0,
					survival: getByName("survival_bonus") ?? 0,
				},

				items: items,
				spells: spells,
				traits: traits,
				tools: tools,
				resources: resources,
				proficiencies: proficiencies,
				spellSlots: {
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
				data: {
					dataSet1: JSON.parse(model.attributes?.mancerdata ?? "{}"),
					dataSet2: JSON.parse(model.attributes?.mancerget ?? "{}"),
					attribs: attribsFilter,
					abilities: abilitiesFilter,
					raw: model,
				},
			};
		} catch (error) {
			console.error(error);
			return undefined;
		}
	});
	Promise.all(parsedData).then((data) => {
		data = data.filter((item) => item !== undefined);
		console.log(data);
	});
}
_LoadData();
