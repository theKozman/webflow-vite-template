// Should be inserted into webflow directly, in global custom code

(() => {
  const LOCALHOST_URL = [
    'http://localhost:3000/@vite/client',
    'http://localhost:3000/src/main.ts',
  ];
  const STAGE_URL = ['YOUR_PUBLIC_STAGE_LINK'];
  const PROD_URL = ['YOUR_PUBLIC_PROD_LINK'];

  // scripts that will be loaded after main code
  const ADDITONAL_URL = [];

  function createScripts(arr, isDevMode) {
    return arr.map((url) => {
      const s = document.createElement('script');
      s.src = url;

      if (isDevMode) {
        s.type = 'module';
      }

      return s;
    });
  }

  async function insertScript(scriptArr) {
    // for used instead of forEach because latter has some issues with handling async expressions
    for (i = 0; i < scriptArr.length; i++) {
      await new Promise((resolve, reject) => {
        const script = scriptArr[i];
        script.addEventListener('load', () => {
          resolve();
        });
        document.body.appendChild(script);
      });
    }
  }

  const localhostScripts = createScripts(LOCALHOST_URL, true);
  const stageScripts = createScripts(STAGE_URL, false);
  const prodScripts = createScripts(PROD_URL, false);
  const additionalScripts = createScripts(ADDITONAL_URL, false);

  let chosenScripts = null;

  // if localhost available and test domain - load localhost scripts
  // if not available and test domain - load stage scripts
  // if not available and prod domain - load prod scripts
  fetch(LOCALHOST_URL[0], {})
    .then(() => {
      if (window.location.hostname.split(/\.(.*)/s)[1] != 'webflow.io') {
        throw new Error('cannot load dev modules on production domain');
      }
      chosenScripts = localhostScripts;
    })
    .catch((error) => {
      if (window.location.hostname.split(/\.(.*)/s)[1] === 'webflow.io') {
        chosenScripts = stageScripts;
      } else {
        chosenScripts = prodScripts;
      }
    })
    .finally(async () => {
      if (chosenScripts) {
        await insertScript(chosenScripts);

        insertScript(additionalScripts);
        return;
      }

      console.error('something went wrong, no scripts loaded');
    });
})();
