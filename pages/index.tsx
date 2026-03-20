/** Broken page: Dynamic is rendered via _app.tsx — sees the double-render bug */
export default function Home() {
  return <p data-testid="page-index">index page</p>;
}
