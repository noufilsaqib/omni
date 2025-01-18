import { Helmet } from "react-helmet";
import Navbar from "./Navbar";

interface LayoutProps {
  title: string;
  isLandingPage?: boolean;
  children: React.ReactNode;
}

export default function Layout({
  title,
  isLandingPage = false,
  children,
}: LayoutProps) {
  if (title && typeof document !== "undefined") {
    document.title = isLandingPage ? "Omni" : `${title} | Omni`;
  }

  const showNav = !(title === "Login" || title === "Signup");

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{isLandingPage ? "Omni" : `${title} | Omni`}</title>
      </Helmet>
      {showNav && <Navbar />}
      <div className="min-h-screen">{children}</div>
    </>
  );
}
