<script lang="ts">
      import * as Resizable from "$lib/components/ui/resizable";
</script>

<Resizable.PaneGroup direction="vertical" class="w-screen h-screen">
    <Resizable.Pane>One</Resizable.Pane>
    <Resizable.Handle />
    <Resizable.Pane>Two</Resizable.Pane>
  </Resizable.PaneGroup>