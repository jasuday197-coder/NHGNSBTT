/* ==========================================================================
   MINIGAMES ENTRY BRIDGE (games.js)
   Instantiates VoiceBankGamesEngine inside src/components/Minigames/
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.VoiceBankGamesEngine !== 'undefined') {
    window.voiceBankGames = new window.VoiceBankGamesEngine();
    window.voiceBankGames.init();
    console.log('[Minigame System] Successfully initialized Minigame Engine.');
  } else {
    console.error('[Minigame System] VoiceBankGamesEngine is not loaded.');
  }
});
