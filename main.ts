import { Plugin } from 'obsidian';
import { SkillsView } from './lib/views/SkillsView';
import { AttributesView } from './lib/views/AttributesView';
import { KeyValueStore } from './lib/services/KeyValueStore';
import { HealthView } from 'lib/views/HealthView';
import { EventBus } from 'lib/services/EventBus';
import { WillpowerView } from 'lib/views/WillpowerView';
import { HungerView } from 'lib/views/HungerView';
import { HumanityView } from 'lib/views/HumanityView';
import { PowerListView } from 'lib/views/PowerView';
import { DisciplinesView } from 'lib/views/DisciplinesView';
import { BloodPotencyView } from 'lib/views/BloodPotencyView';
import { ExperienceView } from 'lib/views/ExperienceView';
import { MeritsFlawsListView } from 'lib/views/MeritsFlawsView';

export default class VtmUIToolkitPlugin extends Plugin {
	store: KeyValueStore;
	eventBus: EventBus;

	async onload() {
		console.log('VtM Plugin loading...');

		// Initialize store with plugin instance
		this.store = new KeyValueStore(this);
		this.eventBus = new EventBus();
		await this.store.load();

		const allData = this.store.getAll();
		const keys = Object.keys(allData);
		console.log('Store loaded with', keys.length, 'entries');

		// Skills
		this.registerMarkdownCodeBlockProcessor(
			'vtm-skills',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const skillsView = new SkillsView(
					this.app,
					this.store,
					filePath,
				);
				skillsView.register(source, el, ctx);
			},
		);

		// Attributes
		this.registerMarkdownCodeBlockProcessor(
			'vtm-attributes',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const attributesView = new AttributesView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				attributesView.register(source, el, ctx);
			},
		);

		// Health
		this.registerMarkdownCodeBlockProcessor(
			'vtm-health',
			(source, element, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const healthView = new HealthView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);

				healthView.register(source, element, ctx);
			},
		);

		// Willpower
		this.registerMarkdownCodeBlockProcessor(
			'vtm-willpower',
			(source, element, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const willpowerView = new WillpowerView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				willpowerView.register(source, element, ctx);
			},
		);

		// Hunger:
		this.registerMarkdownCodeBlockProcessor(
			'vtm-hunger',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const hungerView = new HungerView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				hungerView.register(source, el, ctx);
			},
		);

		// Humanity
		this.registerMarkdownCodeBlockProcessor(
			'vtm-humanity',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const humanityView = new HumanityView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				humanityView.register(source, el, ctx);
			},
		);

		// Disciplines
		this.registerMarkdownCodeBlockProcessor(
			'vtm-disciplines',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const disciplinesView = new DisciplinesView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				disciplinesView.register(source, el, ctx);
			},
		);

		// Discipline Power Card
		this.registerMarkdownCodeBlockProcessor(
			'vtm-power-list',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const powerListView = new PowerListView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				powerListView.register(source, el, ctx);
			},
		);

		// Blood Potency
		this.registerMarkdownCodeBlockProcessor(
			'vtm-blood-potency',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const bloodPotencyView = new BloodPotencyView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				bloodPotencyView.register(source, el, ctx);
			},
		);

		// Experience Track
		this.registerMarkdownCodeBlockProcessor(
			'vtm-experience',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const experienceView = new ExperienceView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				experienceView.register(source, el, ctx);
			},
		);

		// Merits & Flaws
		this.registerMarkdownCodeBlockProcessor(
			'vtm-merits-flaws-list',
			(source, el, ctx) => {
				const filePath = ctx.sourcePath || 'unknown';
				const meritsFlawsListView = new MeritsFlawsListView(
					this.app,
					this.store,
					filePath,
					this.eventBus,
				);
				meritsFlawsListView.register(source, el, ctx);
			},
		);

		console.log('VtM Plugin loaded!');
	}

	onunload() {
		console.log('VtM Plugin unloaded!');
	}
}
