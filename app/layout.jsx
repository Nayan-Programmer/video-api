import "./globals.css";

export const metadata = {
  title: "Free Text-to-Video Lab",
  description: "A starter interface for a free-access Gradio text-to-video Space."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
