// base is '/montjuic-game/' for the production build (GitHub Pages project site)
// but '/' in dev so the local server keeps working at the root.
export default ({ command }: { command: string }) => ({
  base: command === 'build' ? '/montjuic-game/' : '/',
  server: { host: true, open: false },
});
