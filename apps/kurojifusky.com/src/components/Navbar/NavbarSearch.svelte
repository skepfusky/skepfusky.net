<script lang="ts">
  import { fly } from "svelte/transition"
  import { cubicOut } from "svelte/easing"

  import { debounce } from "lodash-es"
  import SearchIcon from "~icons/lucide/search?raw"
  import XClearIcon from "~icons/lucide/x?raw"

  import { isSearchActive } from "./Navbar.stores"

  import Backdrop from "$components/Backdrop.svelte"

  let hasInputContent = false
  let currentFunnies: string

  const defaultPlaceholder = [...Array(21)].map(() => "Search on Kuro's stash")
  const funnies = [
    ...defaultPlaceholder,
    "Oh? Looks like someone wants to search my garbage~",
    "OwO",
    "How can I help you, cutie~?"
  ]

  $: $isSearchActive, updateFunnies()

  const updateFunnies = () => {
    document.body.style.overflowY = $isSearchActive ? "hidden" : "visible"

    if ($isSearchActive) {
      currentFunnies = funnies[Math.floor(Math.random() * funnies.length)]
      return
    }

    hasInputContent = false
  }

  const toggleKeyboardState = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return

    isSearchActive.toggleState()
  }

  const handleHasInput = (e: Event) => {
    hasInputContent = Boolean((e.target as HTMLInputElement).value)
    if (!hasInputContent) updateFunnies()
  }

  const inputDebounced = debounce((e: Event) => {
    const textValue = (e.target as HTMLInputElement).value
    console.log(textValue)
  }, 300)
</script>

{#if $isSearchActive}
  <div
    transition:fly={{ duration: 210, y: -5, easing: cubicOut }}
    class="absolute inset-x-0 mx-auto max-w-screen-lg w-full"
  >
    <div class="mt-4 py-5 px-8 w-full">
      <div class="relative">
        <span
          class="absolute h-full left-0 inset-y-0 [&_svg]:size-5 flex items-center pointer-events-none"
        >
          {@html SearchIcon}
        </span>
        <input
          id="global-search"
          type="search"
          placeholder={currentFunnies}
          class="pl-8 bg-transparent focus:outline-none text-2xl w-full"
          on:keydown={toggleKeyboardState}
          on:input={(e) => {
            inputDebounced(e)
            handleHasInput(e)
          }}
        />
      </div>
    </div>
    <div></div>
  </div>
{/if}

<Backdrop
  state={$isSearchActive}
  class="fixed inset-0 z-10 bg-kuro-dark2/80 backdrop-blur-sm"
  onClick={isSearchActive.toggleState}
/>
