<script lang="ts">
	import dirhover from '$lib/dirHover.attach.ts';
</script>

<span {@attach dirhover()}> test </span>

<style>
	span {
		padding: 1em;
	}
</style>
