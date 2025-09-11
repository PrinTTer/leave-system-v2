import Lottie from "lottie-react";
import pgsmCmsLoadingLogin from "@/app/lotties/pgsm-cms-loading-login.json";
import { Flex } from "antd";

interface Props {
  width: number;
  height: number;
}

export const LoadingLoginPage: React.FC<Props> = ({ width, height }) => {
  return (
    <>
      <Flex align="center" justify="center" style={{ marginTop: "10vh" }}>
        <Lottie
          animationData={pgsmCmsLoadingLogin}
          loop={true}
          style={{ width: width, height: height }}
        />
      </Flex>
    </>
  );
};
