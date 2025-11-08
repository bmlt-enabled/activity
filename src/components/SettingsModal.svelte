<script lang="ts">
  import { Modal, Button, Label, Select } from 'flowbite-svelte';
  import { translations } from '../lib/stores/localization';

  interface Props {
    open: boolean;
    currentLanguage: string;
    onLanguageChange: (lang: string) => void;
  }

  let { open = $bindable(), currentLanguage, onLanguageChange }: Props = $props();

  const languageOptions = [
    { value: 'en', name: 'English' },
    { value: 'es', name: 'Español' }
  ];

  let selectedLanguage = $state(currentLanguage);

  function handleSave() {
    onLanguageChange(selectedLanguage);
    open = false;
  }

  function handleCancel() {
    selectedLanguage = currentLanguage;
    open = false;
  }
</script>

<Modal bind:open title={$translations.languageSettings} size="xs" autoclose={false}>
  <div class="space-y-6">
    <div>
      <Label for="language-select" class="mb-2">{$translations.language}</Label>
      <Select id="language-select" items={languageOptions} bind:value={selectedLanguage} />
    </div>
  </div>

  <div class="mt-6 flex justify-end gap-3">
    <Button color="alternative" onclick={handleCancel}>{$translations.cancel}</Button>
    <Button class="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600" onclick={handleSave}>{$translations.save}</Button>
  </div>
</Modal>
