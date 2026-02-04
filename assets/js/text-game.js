const logElement = document.getElementById('gameLog');
const inputElement = document.getElementById('playerInput');
const submitButton = document.getElementById('submitInput');
const hintElement = document.getElementById('inputHint');
const startButton = document.getElementById('startSession');
const statusSummary = document.getElementById('statusSummary');
const fetishSummary = document.getElementById('fetishSummary');
const contractText = document.getElementById('contractText');
const acceptButton = document.getElementById('acceptContract');
const declineButton = document.getElementById('declineContract');

const playerNameInput = document.getElementById('playerName');
const playerGenderInput = document.getElementById('playerGender');
const playerBearingInput = document.getElementById('playerBearing');

const rankTable = [
	{ name: 'Unranked', min: 0, max: 49, ap: [3, 6] },
	{ name: 'Initiate', min: 50, max: 149, ap: [4, 8] },
	{ name: 'Bearer', min: 150, max: 299, ap: [6, 11] },
	{ name: 'Envoy', min: 300, max: 599, ap: [8, 14] },
	{ name: 'Ascendant', min: 600, max: 999, ap: [10, 18] },
	{ name: 'Exemplar', min: 1000, max: Infinity, ap: [13, 22] }
];

const districtData = [
	{
		name: 'Whispering Spires',
		multiplier: 1.5,
		loc: 'Gilded alcove beneath the Whispering Spires archives.',
		oaths: 'Discretion before names; no physical marks beyond the rite; silence at dawn.'
	},
	{
		name: 'Murk Depths',
		multiplier: 1.0,
		loc: 'Low chamber sealed by rusted chains in the Murk Depths.',
		oaths: 'Witness nothing outside the chamber; accept the supplicant\'s urgency; cleanse after.'
	},
	{
		name: 'Veil Crossroads',
		multiplier: 1.3,
		loc: 'Curtained loft above the Veil Crossroads barter hall.',
		oaths: 'No lingering names; trade only touch for touch; depart within the hour.'
	}
];

const spTraits = [
	'rough hands',
	'scarred knuckles',
	'ink-stained nails',
	'watchful eyes',
	'precise posture',
	'smoke-soft voice',
	'calloused palms',
	'calm breath'
];

const spVibes = ['guarded', 'urgent', 'measured', 'silent', 'intent'];

const spNames = ['Brak', 'Dorn', 'Kess', 'Rusk', 'Varn', 'Seth', 'Jorr', 'Glen', 'Tarn', 'Mara', 'Kara', 'Vess', 'Rina', 'Hale'];

const spActions = [
	'presses closer, inviting a slow admission',
	'tests the space with a firm touch',
	'guides the pace with deliberate breath',
	'holds still, demanding a clearer vow',
	'circles with patient pressure'
];

let gameState = {
	step: 'idle',
	player: {
		name: '',
		gender: '',
		bearing: '',
		requiredTag: '',
		resistedTag: '',
		sigils: 0,
		shards: 0,
		rankIndex: 0,
		maxArousal: 60,
		currentArousal: 0
	},
	contract: null,
	threshold: null,
	requiredTagHit: false,
	tieCount: 0
};

function appendLog(text) {
	logElement.textContent += `${text}\n\n`;
	logElement.scrollTop = logElement.scrollHeight;
}

function setHint(text) {
	hintElement.textContent = text;
}

function updateStatus() {
	const rank = rankTable[gameState.player.rankIndex].name;
	statusSummary.textContent = `New Veiled Operative. Max Arousal ${gameState.player.maxArousal}. Sigils ${gameState.player.sigils}. Shards ${gameState.player.shards}. Rank ${rank}.`;
	fetishSummary.textContent = `Required Fetish Tag: ${gameState.player.requiredTag || '—'} | Resisted Fetish Tag: ${gameState.player.resistedTag || '—'}`;
}

function randomFromArray(items) {
	return items[Math.floor(Math.random() * items.length)];
}

function generateSupplicantGender(playerGender) {
	if (playerGender === 'woman') {
		return 'man';
	}
	if (playerGender === 'man') {
		return 'woman';
	}
	return Math.random() > 0.5 ? 'man' : 'woman';
}

function getRankBySigils(sigils) {
	return rankTable.findIndex((rank) => sigils >= rank.min && sigils <= rank.max);
}

function calculateMaxArousal(rankIndex) {
	return 10 * (rankIndex + 5 + 1);
}

function createContract() {
	const district = randomFromArray(districtData);
	const spRankIndex = Math.random() > 0.6 ? 1 : 0;
	const spRank = rankTable[spRankIndex];
	const spGender = generateSupplicantGender(gameState.player.gender);
	const spName = randomFromArray(spNames);
	const spAge = Math.floor(22 + Math.random() * 18);
	const traits = `${randomFromArray(spTraits)}, ${randomFromArray(spTraits)}`;
	const vibe = randomFromArray(spVibes);
	const appearance = `${spName}, ${spAge}, ${spGender}, ${spRank.name}, ${traits} – ${vibe}`;
	const spApMin = spRank.ap[0];
	const spApMax = spRank.ap[1];
	const reward = spRankIndex === 0 ? 18 : 30;
	const penalty = spRankIndex === 0 ? 8 : 12;
	const sdYield = Math.min(5, spRankIndex + 1);
	const fetishTag = randomFromArray([
		'confession',
		'control',
		'ritual touch',
		'binding promises',
		'breath discipline'
	]);

	return {
		district,
		spRankIndex,
		spRankName: spRank.name,
		spGender,
		spName,
		spAge,
		appearance,
		spApMin,
		spApMax,
		reward,
		penalty,
		sdYield,
		fetishTag
	};
}

function renderContract(contract) {
	contractText.textContent = `[VEILED PETITION]\nSupplicant: ${contract.appearance}\nSupplicant Arousal Pressure: ${contract.spApMin} - ${contract.spApMax}\nLocation: ${contract.district.loc}\nFetish: ${contract.fetishTag}\nOaths: ${contract.district.oaths}\nReward: +${contract.reward} Sigils\nPenalty: –${contract.penalty} Sigils\nShards Yield: +${contract.sdYield} (if)\nStatus: Offered`;
}

function startSession() {
	const name = playerNameInput.value.trim();
	const gender = playerGenderInput.value;
	const bearing = playerBearingInput.value.trim();

	if (!name || !gender || !bearing) {
		appendLog('The Inkbound Attendant waits. Provide your name, gender, and bearing before proceeding.');
		return;
	}

	gameState.player.name = name;
	gameState.player.gender = gender;
	gameState.player.bearing = bearing;
	gameState.step = 'question-required';

	appendLog('The hazy antechamber of the Luminous Guild smells of old paper. A faceless wax figure stands beside the Secret Ledger as the Contract Deliverer. The Chirurgeon waits in the corner.');
	appendLog('Inkbound Attendant: “Why have you come here?”');
	setHint('Answer to define your Required Fetish Tag.');
	updateStatus();
}

function handleInput() {
	const text = inputElement.value.trim();
	if (!text) {
		return;
	}
	inputElement.value = '';

	if (gameState.step === 'question-required') {
		gameState.player.requiredTag = text;
		gameState.step = 'question-resisted';
		appendLog(`You: “${text}.”`);
		appendLog('Inkbound Attendant: “What are you willing to give up to keep this secret?”');
		setHint('Answer to define your Resisted Fetish Tag.');
		updateStatus();
		return;
	}

	if (gameState.step === 'question-resisted') {
		gameState.player.resistedTag = text;
		appendLog(`You: “${text}.”`);
		appendLog(`Inkbound Attendant: “${gameState.player.name}, ${gameState.player.bearing}. Your inclinations are recorded. Welcome to the Luminous Guild.”`);
		gameState.contract = createContract();
		renderContract(gameState.contract);
		appendLog('A veiled petition slides forward.');
		setHint('Accept or decline the contract.');
		acceptButton.disabled = false;
		declineButton.disabled = false;
		updateStatus();
		gameState.step = 'contract-offer';
		return;
	}

	if (gameState.step === 'threshold-turn') {
		handleThresholdTurn(text);
	}
}

function calculateArousalGain(rangeMin, rangeMax) {
	return Math.floor(rangeMin + Math.random() * (rangeMax - rangeMin + 1));
}

function handleThresholdTurn(approach) {
	const threshold = gameState.threshold;
	const playerRank = rankTable[gameState.player.rankIndex];
	const spRank = rankTable[threshold.spRankIndex];
	let uaApMin = playerRank.ap[0];
	let uaApMax = playerRank.ap[1];
	let spApMin = spRank.ap[0];
	let spApMax = spRank.ap[1];

	const approachLower = approach.toLowerCase();
	const requiredLower = gameState.player.requiredTag.toLowerCase();
	const resistedLower = gameState.player.resistedTag.toLowerCase();

	if (approachLower.includes(resistedLower)) {
		spApMin += 2;
		spApMax += 2;
	}

	if (threshold.spApproach.toLowerCase().includes(resistedLower)) {
		uaApMin += 2;
		uaApMax += 2;
	}

	let spGain = 0;
	if (approachLower.includes(requiredLower)) {
		spGain = calculateArousalGain(uaApMin, uaApMax);
		gameState.requiredTagHit = true;
	}

	let uaGain = 0;
	if (threshold.spApproach.toLowerCase().includes(requiredLower)) {
		uaGain = calculateArousalGain(spApMin, spApMax);
	}

	if (!gameState.requiredTagHit && threshold.spCurrent + spGain >= threshold.spMax) {
		spGain = 0;
	}

	threshold.uaCurrent += uaGain;
	threshold.spCurrent += spGain;

	appendLog('[THRESHOLD TURN]');
	appendLog(`Approach: ${approach}.`);
	appendLog(`Outcome: User: +${uaGain} Arousal - Supplicant: +${spGain} Arousal`);
	appendLog(`Result: User: ${threshold.uaCurrent}/${threshold.uaMax} - Supplicant: ${threshold.spCurrent}/${threshold.spMax}`);
	appendLog(`${threshold.spName} ${randomFromArray(['shivers', 'tightens their grip', 'breathes in sharply', 'holds the gaze'])}.`);

	const uaReached = threshold.uaCurrent >= threshold.uaMax;
	const spReached = threshold.spCurrent >= threshold.spMax;

	if (uaReached || spReached) {
		resolveThreshold(uaReached, spReached);
		return;
	}

	threshold.turn += 1;
	threshold.spApproach = randomFromArray(spActions);
	appendLog(`Turn ${threshold.turn}: ${threshold.spName} ${threshold.spApproach}.`);
	setHint('Enter your next approach for the rite.');
}

function resolveThreshold(uaReached, spReached) {
	const threshold = gameState.threshold;
	if (uaReached && spReached) {
		const uaSurplus = threshold.uaCurrent - threshold.uaMax;
		const spSurplus = threshold.spCurrent - threshold.spMax;
		if (uaSurplus === spSurplus && gameState.tieCount < 2) {
			gameState.tieCount += 1;
			threshold.uaCurrent = 0;
			threshold.spCurrent = 0;
			threshold.turn += 1;
			appendLog('[THRESHOLD VEIL DESCENDS]');
			appendLog('Rite begins. First break loses.');
			appendLog(`Arousal — User: ${threshold.uaCurrent}/${threshold.uaMax} - Supplicant: ${threshold.spCurrent}/${threshold.spMax}`);
			appendLog(`Turn ${threshold.turn}: ${threshold.spName} ${threshold.spApproach}.`);
			setHint('The tie persists. Enter your approach.');
			return;
		}
		if (uaSurplus > spSurplus) {
			uaReached = true;
			spReached = false;
		} else {
			spReached = true;
			uaReached = false;
		}
	}

	if (spReached) {
		appendLog('[THRESHOLD RESOLVED — VICTORY]');
		appendLog(`${threshold.spName} broke first.`);
		handleVictory();
	} else {
		appendLog('[THRESHOLD RESOLVED — DEFEAT]');
		appendLog(`${gameState.player.name} broke first.`);
		handleDefeat();
	}

	gameState.step = 'finished';
	setHint('The rite concludes. Refresh to begin anew.');
}

function handleVictory() {
	const contract = gameState.contract;
	const gain = contract.reward;
	gameState.player.sigils += gain;
	const sdGain = Math.min(5, contract.spRankIndex + 1);
	gameState.player.shards += sdGain;
	const previousRank = gameState.player.rankIndex;
	gameState.player.rankIndex = getRankBySigils(gameState.player.sigils);
	gameState.player.maxArousal = 10 * (gameState.player.rankIndex + 6);
	appendLog(`[FULFILLED RITE]\nDone. +${gain} Sigils. Total: ${gameState.player.sigils} - Rank: ${rankTable[gameState.player.rankIndex].name} (+${sdGain} Shards, if.)`);
	if (previousRank !== gameState.player.rankIndex) {
		appendLog(`Obsidian Tribunal update: Rank now ${rankTable[gameState.player.rankIndex].name}.`);
	}
	updateStatus();
}

function handleDefeat() {
	const nextThreshold = rankTable[gameState.player.rankIndex + 1]
		? rankTable[gameState.player.rankIndex + 1].min
		: rankTable[gameState.player.rankIndex].max + 1;
	const maxLoss = Math.floor(nextThreshold * 0.2);
	const loss = Math.min(maxLoss, gameState.player.sigils);
	gameState.player.sigils -= loss;
	gameState.player.shards += 1;
	const previousRank = gameState.player.rankIndex;
	gameState.player.rankIndex = getRankBySigils(gameState.player.sigils);
	gameState.player.maxArousal = 10 * (gameState.player.rankIndex + 6);
	appendLog(`[FAILED/ABANDONED]\nUnfin. –${loss} Sigils. Total: ${gameState.player.sigils} - Rank: ${rankTable[gameState.player.rankIndex].name}`);
	if (previousRank !== gameState.player.rankIndex) {
		appendLog(`Obsidian Tribunal update: Rank now ${rankTable[gameState.player.rankIndex].name}.`);
	}
	updateStatus();
}

function startThreshold() {
	const contract = gameState.contract;
	const uaMax = gameState.player.maxArousal;
	const spBaseMax = 10 * (contract.spRankIndex + 6);
	const spMax = Math.round(spBaseMax * contract.district.multiplier);
	const spApproach = randomFromArray(spActions);

	gameState.threshold = {
		turn: 1,
		uaCurrent: 0,
		uaMax,
		spCurrent: 0,
		spMax,
		spName: contract.spName,
		spRankIndex: contract.spRankIndex,
		spApproach
	};

	gameState.requiredTagHit = false;
	gameState.tieCount = 0;
	gameState.step = 'threshold-turn';

	appendLog('[BOUND RITE]: Accepted. Oaths sealed.');
	appendLog('[THRESHOLD VEIL DESCENDS]');
	appendLog('Rite begins. First break loses.');
	appendLog(`Arousal — User: 0/${uaMax} - Supplicant: 0/${spMax}`);
	appendLog(`Supplicant posture: ${randomFromArray(['upright and waiting', 'leaning forward', 'hands folded', 'steady and still'])}.`);
	appendLog(`Turn 1: ${contract.spName} ${spApproach}.`);
	setHint('Enter your first approach for the rite.');
}

startButton.addEventListener('click', () => {
	startSession();
});

submitButton.addEventListener('click', () => {
	handleInput();
});

inputElement.addEventListener('keypress', (event) => {
	if (event.key === 'Enter') {
		handleInput();
	}
});

acceptButton.addEventListener('click', () => {
	acceptButton.disabled = true;
	declineButton.disabled = true;
	contractText.textContent += '\n[BOUND RITE]: Accepted. Oaths sealed.';
	startThreshold();
});

declineButton.addEventListener('click', () => {
	acceptButton.disabled = true;
	declineButton.disabled = true;
	contractText.textContent += '\n[SPURNED RITE]: Declined. No chg.';
	appendLog('[SPURNED RITE]: Declined. No change.');
	setHint('Refresh to request another petition.');
});

appendLog('Awaiting initiation in the antechamber.');
setHint('Complete your profile, then begin.');
updateStatus();
