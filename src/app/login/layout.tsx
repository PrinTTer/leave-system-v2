import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { Suspense } from "react";
import Loading from "./loading";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Suspense fallback={<Loading />}>
        <Content>{children}</Content>
      </Suspense>
    </Layout>
  );
}
