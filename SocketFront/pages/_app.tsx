import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="mx-auto w-full">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
