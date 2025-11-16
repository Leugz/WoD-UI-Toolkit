type EventCallback = () => void;

export class EventBus {
	private listeners: Map<string, EventCallback[]> = new Map();

	on(event: string, callback: EventCallback): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(callback);
	}

	emit(event: string): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			callbacks.forEach((callback) => callback());
		}
	}

	off(event: string, callback: EventCallback): void {
		const callbacks = this.listeners.get(event);

		if (callbacks) {
			const index = callbacks.indexOf(callback);

			if (index > -1) {
				callbacks.splice(index, 1);
			}
		}
	}
}
