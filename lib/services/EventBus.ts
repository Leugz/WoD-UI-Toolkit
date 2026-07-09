export interface EventMap {
	'attribute-changed': {
		file: string;
		attribute: string;
		value: number;
	};

	'blood-potency-changed': {
		file: string;
		value: number;
	};

	'willpower-changed': {
		file: string;
	};

	[key: string]: any;
}

type EventCallback<K extends keyof EventMap> = (payload: EventMap[K]) => void;

export class EventBus {
	private listeners: Map<string, any[]> = new Map();

	on<K extends string & keyof EventMap>(
		event: K,
		callback: EventCallback<K>,
	): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(callback);
	}

	emit<K extends string & keyof EventMap>(
		event: K,
		payload: EventMap[K],
	): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			callbacks.forEach((callback) => callback(payload));
		}
	}

	off<K extends string & keyof EventMap>(
		event: K,
		callback: EventCallback<K>,
	): void {
		const callbacks = this.listeners.get(event);

		if (callbacks) {
			const index = callbacks.indexOf(callback);

			if (index > -1) {
				callbacks.splice(index, 1);
			}
		}
	}
}
