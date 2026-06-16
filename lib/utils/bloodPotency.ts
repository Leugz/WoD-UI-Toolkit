export interface FeedingInfo {
	animalBagged: 'Normal' | 'Half' | 'None';
	humanReduction: number;
	hungerFloor: number;
}

export function getFeedingInfo(bp: number): FeedingInfo {
	if (bp <= 1) {
		return {
			animalBagged: 'Normal',
			humanReduction: 0,
			hungerFloor: 0,
		};
	}

	if (bp === 2) {
		return {
			animalBagged: 'Half',
			humanReduction: 0,
			hungerFloor: 0,
		};
	}

	if (bp === 3) {
		return {
			animalBagged: 'None',
			humanReduction: 0,
			hungerFloor: 0,
		};
	}

	if (bp === 4) {
		return {
			animalBagged: 'None',
			humanReduction: 1,
			hungerFloor: 0,
		};
	}

	if (bp === 5) {
		return {
			animalBagged: 'None',
			humanReduction: 1,
			hungerFloor: 2,
		};
	}

	if (bp <= 7) {
		return {
			animalBagged: 'None',
			humanReduction: 2,
			hungerFloor: 2,
		};
	}

	if (bp <= 9) {
		return {
			animalBagged: 'None',
			humanReduction: 2,
			hungerFloor: 3,
		};
	}

	return {
		animalBagged: 'None',
		humanReduction: 3,
		hungerFloor: 3,
	};
}

export function getHungerFloor(bp: number): number {
	return getFeedingInfo(bp).hungerFloor;
}
