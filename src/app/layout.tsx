import "./globals.css";
import { ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import '@ant-design/v5-patch-for-react-19';
import theme from "@/app/themeConfig";
import { UserProvider } from "./contexts/userContext";
import Head from "next/head";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="32" />
      </Head>
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <UserProvider>{children}</UserProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}