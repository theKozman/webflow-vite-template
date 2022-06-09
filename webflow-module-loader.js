// Should be inserted into webflow directly, in global custom code

(() => {
    const LOCALHOST_URL = [
      'http://localhost:3000/@vite/client',
      'http://localhost:3000/src/main.js',
    ]
    const TEST_URL = ['YOUR_PUBLIC_TEST_BUILD_LINK'];
    const PROD_URL = ['YOUR_PUBLIC_PROD_BUILD_LINK'];

    function createScripts(arr, isDevMode) {
      return arr.map((url) => {
        const s = document.createElement('script');
        s.src = url;

        if (isDevMode) {
          s.type = 'module';
        }

        return s;
      })
    }

    async function insertScript(scriptArr) {
      // for used instead of forEach because latter has some issues with handling async expressions
      for(i = 0; i < scriptArr.length; i++) {
          document.body.appendChild(script);
      }
    }

    const localhostScripts = createScripts(LOCALHOST_URL, true);
    const testScripts = createScripts(TEST_URL, false);
    const prodScripts = createScripts(PROD_URL, false);


    let choosedScripts = null;

    // if localhost available and test domain - load localhost scripts
    // if not available and test domain - load test scripts
    // if not available and prod domain - load prod scripts
    fetch(LOCALHOST_URL[0], {})
      .then(() => {
        if(window.location.hostname.split(/\.(.*)/s)[1] != 'webflow.io') { throw new Error('cannot load dev modules on production domain') }
        choosedScripts = localhostScripts;
      })
      .catch(error => {
        if(window.location.hostname.split(/\.(.*)/s)[1] === 'webflow.io') {
          choosedScripts = testScripts;
        }
        else {
          choosedScripts = prodScripts;
        }
      })
      .finally(async () => {
        if (choosedScripts) {
          return await insertScript(choosedScripts);
        }

        console.error('something went wrong, no scripts loaded');
      });
})();