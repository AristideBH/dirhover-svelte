<script lang="ts">
	import dirhover from '$lib/dirHover.attach.ts';

	const pickColorFromArray = (colors: string[]) =>
		colors[Math.floor(Math.random() * colors.length)];
	const colors = ['LightSalmon', 'Coral', 'Tomato', 'OrangeRed', 'DarkOrange', 'Orange'];
</script>

{#each { length: 20 }, row}
	{#each { length: 20 }, col}
		<div
			{@attach dirhover({
				animation: { duration: 0.15 },
				overlay: { background: pickColorFromArray(colors) },
				childClass: 'custom-child'
			})}
		>
			{row + 1}, {col + 1}
		</div>
	{/each}
{/each}

<style>
	div {
		height: 100%;
		width: 100%;
		display: grid;
		place-items: center;
		font-size: 7px;
	}

	:global(.custom-child) {
		display: grid;
		place-items: center;
		height: 100%;
	}

	/* Base CSS */
	:global(body) {
		margin: 0;
		padding: 0;
		height: 100vh;
		width: 100vw;
	}
	:global(body > div) {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(20, 1fr);
		grid-template-rows: repeat(20, 1fr);
		place-items: center;
	}
</style>
