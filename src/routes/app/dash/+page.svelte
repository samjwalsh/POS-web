<script lang="ts">
    export let data;
</script>

<div>Dashboard Page</div>
{#await data.rev}
    Loading...
{:then rev} 
    {rev}
{/await}
