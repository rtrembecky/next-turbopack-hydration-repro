import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

const Dynamic = dynamic(() => import("../components/Dynamic"));

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main>
      <Dynamic />
      <Component {...pageProps} />
    </main>
  );
}
